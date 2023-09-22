/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { log } from '../log';
import { KeyBinding, KeyMap } from '../types';

let port: chrome.runtime.Port;

function populateForm(keyMap: KeyMap): void {
    for (let action of Object.keys(keyMap)) {
        const input = document.getElementById(action);
        const binding = keyMap[action];

        if (!input) {
            continue;
        }

        input.textContent = serialize(binding);
    }
}

function serialize(binding: KeyBinding): string {
    const parts: string[] = [];

    if (binding.ctrl) {
        parts.push('Ctrl');
    }

    if (binding.alt) {
        parts.push('Alt');
    }

    if (binding.shift) {
        parts.push('Shift');
    }

    parts.push(String.fromCharCode(binding.keyCode).toLocaleUpperCase());

    return parts.join(' + ');
}

(async () => {
    port = chrome.runtime.connect({ name: 'popup' });

    const keyMap = await chrome.runtime.sendMessage({
        request: 'load-map',
    });

    log('Key mappings loaded', keyMap);

    populateForm(keyMap);
})();
