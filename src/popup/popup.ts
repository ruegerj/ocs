/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { KeyCombination } from '../key-binding';
import { ALT, CTRL, SHIFT, getKeyDisplayName, isValidKey } from '../keys';
import { log } from '../log';
import {
    FocusoutEventListener,
    KeyBindingMap,
    KeyboardEventListener,
    Message,
} from '../types';

function mountForm(keyMap: KeyBindingMap): void {
    for (const action of Object.keys(keyMap)) {
        const inputGroup = getInputGroup(action);
        const binding = keyMap[action];

        if (!inputGroup) {
            continue;
        }

        renderBinding(action, binding);

        inputGroup.addEventListener('click', (e) => {
            e.preventDefault();
            changeKeyBind(action, keyMap);
        });
    }
}

async function changeKeyBind(
    action: string,
    keyMap: KeyBindingMap,
): Promise<void> {
    const inputGroup = getInputGroup(action);
    const input = getInput(action);

    if (!inputGroup || !input) {
        throw new Error(`Failed to find input(-group) for action: ${action}`);
    }

    input.innerHTML = '';
    inputGroup.focus();

    const previousBinding = keyMap[action];

    let keydownListener: KeyboardEventListener = () => {};
    let keyupListener: KeyboardEventListener = () => {};
    let focusLostListener: FocusoutEventListener = () => {};

    const waitForBind = new Promise<KeyCombination>((res) => {
        let latestBinding = new KeyCombination(-1);

        keydownListener = (event: KeyboardEvent) => {
            event.preventDefault();
            const key = event.keyCode;

            if (!isValidKey(key)) {
                const emptyBinding = KeyCombination.fromEvent(event);
                emptyBinding.keyCode - 1;
                renderBinding(action, emptyBinding);
                return;
            }

            latestBinding = new KeyCombination(
                key,
                event.ctrlKey,
                event.altKey,
                event.shiftKey,
            );

            res(latestBinding);
        };

        keyupListener = (event: KeyboardEvent) => {
            event.preventDefault();

            if (isValidKey(latestBinding.keyCode)) {
                return;
            }

            const emptyBinding = KeyCombination.fromEvent(event);
            emptyBinding.keyCode - 1;
            renderBinding(action, emptyBinding);
        };

        document.addEventListener('keydown', keydownListener);
        document.addEventListener('keyup', keyupListener);
    });

    const waitForFocusLost = new Promise<KeyCombination>((res) => {
        focusLostListener = () => res(previousBinding);

        inputGroup.addEventListener('focusout', focusLostListener);
    });

    const updatedBinding = await Promise.any<KeyCombination>([
        waitForBind,
        waitForFocusLost,
    ]);

    // clean up event listeners
    document.removeEventListener('keydown', keydownListener);
    document.removeEventListener('keyup', keyupListener);
    inputGroup.removeEventListener('focusout', focusLostListener);

    keyMap[action] = updatedBinding;
    renderBinding(action, updatedBinding);

    await chrome.runtime.sendMessage<Message<KeyBindingMap>>({
        request: 'save-map',
        data: keyMap,
    });

    log(`Updated keybinding for action: ${action}`, updatedBinding);
}

function renderBinding(action: string, binding: KeyCombination): void {
    const parts: HTMLElement[] = [];
    const input = getInput(action);

    if (!input) {
        return;
    }

    if (binding.ctrl) {
        parts.push(createKeyElement(getKeyDisplayName(CTRL)));
        parts.push(createPlusElement());
    }

    if (binding.alt) {
        parts.push(createKeyElement(getKeyDisplayName(ALT)));
        parts.push(createPlusElement());
    }

    if (binding.shift) {
        parts.push(createKeyElement(getKeyDisplayName(SHIFT)));
        parts.push(createPlusElement());
    }

    if (binding.keyCode > 0 && isValidKey(binding.keyCode)) {
        parts.push(createKeyElement(getKeyDisplayName(binding.keyCode)));
    }

    input.innerHTML = ''; // ensure no child nodes

    for (const elem of parts) {
        input.insertAdjacentElement('beforeend', elem);
    }
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

function getInput(action: string): HTMLElement | null {
    return document.getElementById(action);
}

function getInputGroup(action: string): HTMLElement | null {
    const group = document.getElementById(action)?.parentElement;
    return group ? group : null;
}

(async () => {
    const keyMap = await chrome.runtime.sendMessage<Message>({
        request: 'load-map',
    });

    log('Key mappings loaded', keyMap);

    mountForm(keyMap);
})();
