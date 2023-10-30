import { log } from './log';
import type { KeyBindingMap, Message } from './types';

interface TimedPort extends chrome.runtime.Port {
    _timer?: Timer;
}

const DEFAULT_KEY_MAP: KeyBindingMap = {
    prev: { keyCode: 37 }, // arr left
    next: { keyCode: 39 }, // arr right
    today: { keyCode: 84 }, // t
    toggleSplitView: { keyCode: 83 }, // s
    showDay: { keyCode: 68 }, // d
    showWorkweek: { keyCode: 65 }, // a
    showWeek: { keyCode: 87 }, // w
    showMonth: { keyCode: 77 }, // m
    search: { keyCode: 70, ctrl: true }, // ctrl + f
};
const PORT_LIFETIME_MS = 250e3;

const openPorts: TimedPort[] = [];

async function loadKeyMap(): Promise<KeyBindingMap | undefined> {
    const { keyMap } = await chrome.storage.local.get('keyMap');
    return keyMap;
}

async function storeKeyMap(keyMap: KeyBindingMap): Promise<void> {
    await chrome.storage.local.set({ keyMap });

    broadcast<KeyBindingMap>({
        request: 'reload-map',
        data: keyMap,
    });
}

function broadcast<TData>(message: Message<TData>): void {
    for (const port of openPorts) {
        port.postMessage(message);
    }
}

function forceReconnect(port: TimedPort): void {
    deleteTimer(port);
    port.disconnect();
}

function deleteTimer(port: TimedPort): void {
    if (!port._timer) {
        return;
    }

    clearTimeout(port._timer);
    delete port._timer;
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        storeKeyMap(DEFAULT_KEY_MAP);
    }
});

chrome.runtime.onConnect.addListener((port: TimedPort) => {
    port._timer = setTimeout(forceReconnect, PORT_LIFETIME_MS);
    port.onDisconnect.addListener((port: TimedPort) => {
        deleteTimer(port);

        const index = openPorts.indexOf(port);
        if (index < 0) {
            return;
        }
        openPorts.splice(index, 1);
    });
    openPorts.push(port);

    log(`Port ${port.name} established connection`);
});

chrome.runtime.onMessage.addListener((message: Message, _, respond) => {
    if (message.request === 'load-map') {
        loadKeyMap().then(respond);
        return true;
    }

    if (message.request === 'save-map') {
        const map: KeyBindingMap | undefined = (
            message as Message<KeyBindingMap>
        ).data;
        if (!map) {
            return false;
        }

        storeKeyMap(map).then(respond);
        return true;
    }
});
