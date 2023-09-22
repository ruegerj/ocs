import type { KeyMap } from './types';

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

        port.onDisconnect.addListener(() => {
            console.log('Content script closed connection');
        });
    }
});

chrome.runtime.onMessage.addListener((message, _, respond) => {
    if (message.request === 'load-map') {
        loadKeyMap().then(respond);
        return true;
    }
});
