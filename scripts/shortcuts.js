const actionRegistry = new Map([
    ['prev', prevWeek],
    ['next', nextWeek],
    ['today', today],
    ['toggleSplitView', toggleSplitView],
    ['showDay', showDay],
    ['showWorkweek', showWorkweek],
    ['showWeek', showWeek],
    ['showMonth', showMonth],
    ['search', search],
]);

let port;

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
        ).children[0],
    );
    uiElements.set(
        'toggleSplitViewBtn',
        loadIconBtn('CalendarMultipleRegular'),
    );
    uiElements.set('searchInput', document.getElementById('topSearchInput'));
    return uiElements;
}

function loadIconBtn(icon) {
    return document.querySelector(`i[data-icon-name="${icon}"]`).parentElement
        .parentElement;
}

function nextWeek(elements) {
    elements.get('nextBtn').click();
}

function prevWeek(elements) {
    elements.get('prevBtn').click();
}

function today(elements) {
    elements.get('todayBtn').click();
}

function toggleSplitView(elements) {
    elements.get('toggleSplitViewBtn').click();
}

function showDay(elements) {
    elements.get('viewDayBtn').click();
}

function showWorkweek(elements) {
    elements.get('viewWorkweekBtn').click();
}

function showWeek(elements) {
    elements.get('viewWeekBtn').click();
}

function showMonth(elements) {
    elements.get('viewMonthBtn').click();
}

function search(elements) {
    elements.get('searchInput').focus();
}

function log(...args) {
    console.log('[OCS]', ...args);
}

function handleKeyPress(event, keyMap, elements) {
    const mapping = keyMap[event.keyCode];

    if (!mapping) {
        return;
    }

    if (
        (mapping.ctrl && !event.ctrlKey) ||
        (mapping.shift && !event.shiftKey) ||
        (mapping.alt && !event.altKey) ||
        !actionRegistry.has(mapping.action)
    ) {
        return;
    }

    event.preventDefault();
    actionRegistry.get(mapping.action)(elements);
}

function bootstrap(port, keyMap) {
    const elements = scrapeElements();
    document.addEventListener('keydown', (event) =>
        handleKeyPress(event, keyMap, elements),
    );
    window.addEventListener('beforeunload', () => {
        port.disconnect();
    });

    log('Event listeners mounted');
}

function waitUntilLoaded(callback) {
    const loadingScreen = document.getElementById('loadingScreen');
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
    observer.observe(loadingScreen.parentElement, {
        childList: true,
    });
}

(async () => {
    port = chrome.runtime.connect({ name: 'shortcuts' });

    const keyMap = await chrome.runtime.sendMessage({
        request: 'load-map',
    });

    log('Key mappings loaded', keyMap);

    waitUntilLoaded(() => bootstrap(port, keyMap));
})();
