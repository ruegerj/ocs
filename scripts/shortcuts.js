const keyHandler = new Map([
    [37, { action: prevWeek }],
    [39, { action: nextWeek }],
    [84, { action: today }],
    [83, { action: toggleSplitView }],
    [68, { action: showDay }],
    [65, { action: showWorkweek }],
    [87, { action: showWeek }],
    [77, { action: showMonth }],
    [70, { action: search, condition: (event) => event.ctrlKey }],
]);

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

function handleKeyPress(event, elements) {
    const handler = keyHandler.get(event.keyCode);

    if (!handler) {
        return;
    }

    if (handler.condition && !handler.condition(event)) {
        return;
    }

    event.preventDefault();
    handler.action(elements);
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

function bootstrap() {
    const elements = scrapeElements();
    document.addEventListener('keydown', (event) =>
        handleKeyPress(event, elements),
    );
}

function waitUntilLoaded(callback) {
    const loadingScreen = document.getElementById('loadingScreen');
    const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            if (mutation.removedNodes[0] === loadingScreen) {
                console.log('loaded');
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

waitUntilLoaded(bootstrap);
