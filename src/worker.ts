import type { KeyMap } from './types';

const DEFAULT_KEY_MAP: KeyMap = {
    37: { action: 'prev' }, // arr left
    39: { action: 'next' }, // arr right
    84: { action: 'today' }, // t
    83: { action: 'toggleSplitView' }, // s
    68: { action: 'showDay' }, // d
    65: { action: 'showWorkweek' }, // a
    87: { action: 'showWeek' }, // w
    77: { action: 'showMonth' }, // m
    70: { action: 'search', ctrl: true }, // ctrl + f
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
