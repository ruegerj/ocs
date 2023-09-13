/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import type { KeyMap } from '../types';

type ElementsRegistry = Map<string, HTMLElement>;
type ActionHandler = (elements: ElementsRegistry) => void;

const actionRegistry = new Map<string, ActionHandler>([
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

function log(...args: any): void {
    console.log('[OCS]', ...args);
}

function handleKeyPress(
    event: KeyboardEvent,
    keyMap: KeyMap,
    elements: ElementsRegistry,
): void {
    const mapping = keyMap[event.keyCode];

    if (!mapping) {
        return;
    }

    const action = actionRegistry.get(mapping.action);

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

function mount(keyMap: KeyMap): void {
    const elements = scrapeElements();
    listeners.keyPress = (event: KeyboardEvent) =>
        handleKeyPress(event, keyMap, elements);
    listeners.unload = port.disconnect;

    document.addEventListener('keydown', listeners.keyPress.bind(document));
    window.addEventListener('beforeunload', listeners.unload.bind(document));

    log('Event listeners mounted');
}

function unmount() {
    document.removeEventListener('keydown', listeners.unload);
    window.removeEventListener('beforeunload', listeners.unload);

    log('Event listeners unmounted');
}

function waitUntilLoaded(callback: (...args: any[]) => void) {
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

(async () => {
    port = chrome.runtime.connect({ name: 'shortcuts' });
    port.onDisconnect.addListener(unmount);

    const keyMap = await chrome.runtime.sendMessage({
        request: 'load-map',
    });

    log('Key mappings loaded', keyMap);

    waitUntilLoaded(() => mount(keyMap));
})();
