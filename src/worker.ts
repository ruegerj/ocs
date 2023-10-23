import type { KeyMap, Message } from './types';

const DEFAULT_KEY_MAP: KeyMap = {
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

async function loadKeyMap(): Promise<KeyMap | undefined> {
    const { keyMap } = await chrome.storage.local.get('keyMap');
    return keyMap;
}

async function storeKeyMap(keyMap: KeyMap): Promise<void> {
    await chrome.storage.local.set({ keyMap });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        storeKeyMap(DEFAULT_KEY_MAP);
    }
});

chrome.runtime.onConnect.addListener(async (port) => {
    if (port.name === 'shortcuts') {
        console.log('Content script established connection');
    }

    if (port.name === 'popup') {
        console.log('Popup established connection');
    }

    port.onDisconnect.addListener((port) => {
        console.log(`Port ${port.name} closed connection`);
    });
});

chrome.runtime.onMessage.addListener((message: Message, _, respond) => {
    if (message.request === 'load-map') {
        loadKeyMap().then(respond);
        return true;
    }

    if (message.request === 'save-map') {
        const map: KeyMap | undefined = (message as Message<KeyMap>).data;
        if (!map) {
            return false;
        }

        storeKeyMap(map).then(respond);
        return true;
    }
});
