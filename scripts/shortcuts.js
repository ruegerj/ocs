const KEYS = {
  arrLeft: 37,
  arrUp: 38,
  arrRight: 39,
  arrDown: 40,
  a: 65,
  d: 68,
  m: 77,
  t: 84,
  w: 87,
};

function scrapeElements() {
  const uiElements = new Map();
  uiElements.set("nextBtn", loadIconBtn("ChevronRightRegular"));
  uiElements.set("prevBtn", loadIconBtn("ChevronLeftRegular"));
  uiElements.set("newEventBtn", loadIconBtn("CalendarEmptyRegular"));
  uiElements.set("viewDayBtn", loadIconBtn("CalendarDayRegular"));
  uiElements.set("viewWorkweekBtn", loadIconBtn("CalendarWorkWeekRegular"));
  uiElements.set("viewWeekBtn", loadIconBtn("Calendar3DayRegular"));
  uiElements.set("viewMonthBtn", loadIconBtn("CalendarLtrRegular"));
  uiElements.set(
    "todayBtn",
    document.getElementById("id__53").parentElement.parentElement.parentElement
  );
  uiElements.set("searchInput", document.getElementById("topSearchInput"));
  return uiElements;
}

function loadIconBtn(icon) {
  return document.querySelector(`i[data-icon-name="${icon}"]`).parentElement
    .parentElement;
}

function handleKeyPress(event, elements) {
  event.preventDefault();

  console.log(event.keyCode);

  if (event.keyCode == KEYS.arrRight) {
    elements.get("nextBtn").click();
  } else if (event.keyCode == KEYS.arrLeft) {
    elements.get("prevBtn").click();
  } else if (event.keyCode == KEYS.t) {
    elements.get("todayBtn").click();
  }
  // TODO: Fix click events
  //   } else if (event.keyCode == KEYS.d) {
  //     elements.get("viewDayBtn").click();
  //   } else if (event.keyCode == KEYS.a) {
  //     elements.get("viewWorkweekBtn").click();
  //   } else if (event.keyCode == KEYS.w) {
  //     elements.get("viewWeekBtn").click();
  //   } else if (event.keyCode == KEYS.m) {
  //     console.log(elements.get("viewMonthBtn"));
  //     elements.get("viewMonthBtn").click();
}

function bootstrap() {
  const elements = scrapeElements();
  document.addEventListener("keyup", (event) =>
    handleKeyPress(event, elements)
  );
}

function waitUntilLoaded(callback) {
  const loadingScreen = document.getElementById("loadingScreen");
  const observer = new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      if (mutation.removedNodes[0] === loadingScreen) {
        console.log("loaded");
        observer.disconnect();
        callback();
        break;
      }
    }
  });
  observer.observe(loadingScreen.parentElement, {
    childList: true,
  });
}

waitUntilLoaded(bootstrap);
