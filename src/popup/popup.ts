/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { ALT, CTRL, SHIFT, getKeyDisplayName } from '../keys';
import { log } from '../log';
import { KeyBinding, KeyMap } from '../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let port: chrome.runtime.Port;

function populateForm(keyMap: KeyMap, os: chrome.runtime.PlatformOs): void {
    for (const action of Object.keys(keyMap)) {
        const input = document.getElementById(action);
        const binding = keyMap[action];

        if (!input) {
            continue;
        }

        input.textContent = serialize(binding, os);
    }
}

function serialize(binding: KeyBinding, os: chrome.runtime.PlatformOs): string {
    const parts: string[] = [];

    if (binding.ctrl) {
        parts.push(getKeyDisplayName(CTRL, os));
    }

    if (binding.alt) {
        parts.push(getKeyDisplayName(ALT, os));
    }

    if (binding.shift) {
        parts.push(getKeyDisplayName(SHIFT, os));
    }

    parts.push(getKeyDisplayName(binding.keyCode, os));

    return parts.join(' + ');
}

(async () => {
    port = chrome.runtime.connect({ name: 'popup' });
    const { os } = await chrome.runtime.getPlatformInfo();

    const keyMap = await chrome.runtime.sendMessage({
        request: 'load-map',
    });

    log('Key mappings loaded', keyMap);

    populateForm(keyMap, os);
})();
