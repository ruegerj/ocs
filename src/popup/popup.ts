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

        for (const elem of serialize(binding, os)) {
            input.insertAdjacentElement('beforeend', elem);
        }
    }
}

function serialize(
    binding: KeyBinding,
    os: chrome.runtime.PlatformOs,
): HTMLElement[] {
    const parts: HTMLElement[] = [];

    if (binding.ctrl) {
        parts.push(createKeyElement(getKeyDisplayName(CTRL, os)));
        parts.push(createPlusElement());
    }

    if (binding.alt) {
        parts.push(createKeyElement(getKeyDisplayName(ALT, os)));
        parts.push(createPlusElement());
    }

    if (binding.shift) {
        parts.push(createKeyElement(getKeyDisplayName(SHIFT, os)));
        parts.push(createPlusElement());
    }

    parts.push(createKeyElement(getKeyDisplayName(binding.keyCode, os)));

    return parts;
}

function createKeyElement(key: string): HTMLElement {
    const keyElem = document.createElement('span');
    keyElem.className = 'key';
    keyElem.textContent = key;

    return keyElem;
}

function createPlusElement(): HTMLElement {
    const plusElem = document.createElement('span');
    plusElem.className = 'plus';
    plusElem.textContent = '+';

    return plusElem;
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
