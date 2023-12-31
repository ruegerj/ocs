/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { KeyCombination } from '../key-binding';
import { getKeyDisplayName } from '../keys';
import { log } from '../log';
import type { KeyBindingMap, Message } from '../types';

type ElementsRegistry = Map<string, HTMLElement>;
type ActionHandler = (elements: ElementsRegistry) => void;
type KeyBindingLookup = {
    [id: string]: {
        action: string;
        ctrl?: boolean;
        alt?: boolean;
        shift?: boolean;
    };
};

const ACTION_REGISTRY = new Map<string, ActionHandler>([
    ['prev', (elements) => elements.get('prevBtn')?.click()],
    ['next', (elements) => elements.get('nextBtn')?.click()],
    ['today', (elements) => elements.get('todayBtn')?.click()],
    [
        'toggleSplitView',
        (elements) => elements.get('toggleSplitViewBtn')?.click(),
    ],
    ['showDay', (elements) => elements.get('viewDayBtn')?.click()],
    ['showWorkweek', (elements) => elements.get('viewWorkweekBtn')?.click()],
    ['showWeek', (elements) => elements.get('viewWeekBtn')?.click()],
    ['showMonth', (elements) => elements.get('viewMonthBtn')?.click()],
    ['search', (elements) => elements.get('searchInput')?.focus()],
]);

const listeners: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
} = {
    keyPress: undefined,
    unload: undefined,
};
let port: chrome.runtime.Port;

function scrapeElements() {
    const uiElements = new Map();
    uiElements.set('nextBtn', loadIconBtn('ChevronRightRegular'));
    uiElements.set('prevBtn', loadIconBtn('ChevronLeftRegular'));
    uiElements.set('newEventBtn', loadIconBtn('CalendarEmptyRegular'));
    uiElements.set('viewDayBtn', loadIconBtn('CalendarDayRegular'));
    uiElements.set('viewWorkweekBtn', loadIconBtn('CalendarWorkWeekRegular'));
    uiElements.set('viewWeekBtn', loadIconBtn('Calendar3DayRegular'));
    uiElements.set('viewMonthBtn', loadIconBtn('CalendarLtrRegular'));
    uiElements.set(
        'todayBtn',
        document.querySelector(
            '[data-app-section="CalendarModuleSurfaceNavigationBar"]',
        )?.children[0],
    );
    uiElements.set(
        'toggleSplitViewBtn',
        loadIconBtn('CalendarMultipleRegular'),
    );
    uiElements.set('searchInput', document.getElementById('topSearchInput'));
    return uiElements;
}

function loadIconBtn(icon: string): HTMLElement | null | undefined {
    return document.querySelector(`i[data-icon-name="${icon}"]`)?.parentElement
        ?.parentElement;
}

function handleKeyPress(
    event: KeyboardEvent,
    keyBindingLookup: KeyBindingLookup,
    elements: ElementsRegistry,
): void {
    const combination = KeyCombination.fromEvent(event);
    const mapping = keyBindingLookup[calcCombinationId(combination)];

    if (!mapping) {
        return;
    }

    const action = ACTION_REGISTRY.get(mapping.action);

    if (
        (mapping.ctrl && !event.ctrlKey) ||
        (mapping.shift && !event.shiftKey) ||
        (mapping.alt && !event.altKey) ||
        !action
    ) {
        return;
    }

    event.preventDefault();
    action(elements);
}

function mount(keyMap: KeyBindingMap): void {
    const elements = scrapeElements();

    const keyMappingLookup = Object.entries(keyMap).reduce((acc, cur) => {
        const [action, binding] = cur;

        acc[calcCombinationId(binding)] = {
            action,
            alt: binding.alt,
            shift: binding.shift,
            ctrl: binding.ctrl,
        };
        return acc;
    }, {} as KeyBindingLookup);

    listeners.keyPress = (event: KeyboardEvent) =>
        handleKeyPress(event, keyMappingLookup, elements);
    listeners.unload = port.disconnect;

    document.addEventListener('keydown', listeners.keyPress);
    window.addEventListener('beforeunload', listeners.unload);

    log('Event listeners mounted');
}

function unmount() {
    document.removeEventListener('keydown', listeners.keyPress);
    window.removeEventListener('beforeunload', listeners.unload);

    log('Event listeners unmounted');
}

function onReloadKeyMap(message: Message<KeyBindingMap>) {
    const keyMap = message.data as KeyBindingMap;

    if (!keyMap) {
        return;
    }

    log('Key map has changed', keyMap);

    unmount();
    mount(keyMap);
}

function calcCombinationId(keyCombination: KeyCombination): string {
    const idParts: string[] = [
        keyCombination.ctrl ? 'ctrl' : '',
        keyCombination.alt ? 'alt' : '',
        keyCombination.shift ? 'shift' : '',
        getKeyDisplayName(keyCombination.keyCode),
    ];

    return idParts.filter((p) => p).join('+');
}

function waitUntilLoaded(callback: (...args: unknown[]) => void) {
    const loadingScreen = document.getElementById('loadingScreen');

    if (!loadingScreen?.parentNode) {
        return callback();
    }

    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            if (mutation.removedNodes[0] === loadingScreen) {
                log('Site fully loaded');
                observer.disconnect();
                setTimeout(callback, 500); // allow React component to load properly
                break;
            }
        }
    });

    observer.observe(loadingScreen.parentNode, {
        childList: true,
    });
}

function onPortMessage(message: Message): void {
    if (message.request === 'reload-map') {
        return onReloadKeyMap(message as Message<KeyBindingMap>);
    }
}

function connectToWorker(): void {
    port = chrome.runtime.connect({ name: 'shortcuts' });
    port.onDisconnect.addListener(connectToWorker);
    port.onMessage.addListener(onPortMessage);

    log('Connected to worker');
}

(async () => {
    connectToWorker();

    const keyMap = await chrome.runtime.sendMessage<Message>({
        request: 'load-map',
    });

    log('Key mappings loaded', keyMap);

    waitUntilLoaded(() => mount(keyMap));
})();
