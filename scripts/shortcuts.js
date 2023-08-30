const uiElements = new Map();

function bootstrapElements() {
  uiElements.set("nextBtn", loadIconBtn("ChevronRightRegular"));
  uiElements.set("prevBtn", loadIconBtn("ChevronLeftRegular"));
  uiElements.set("newEventBtn", loadIconBtn("CalendarEmptyRegular"));
  uiElements.set("viewTodayBtn", loadIconBtn("CalendarDayRegular"));
  uiElements.set("viewWorkweekBtn", loadIconBtn("CalendarWorkWeekRegular"));
  uiElements.set("viewWeekBtn", loadIconBtn("Calendar3DayRegular"));
  uiElements.set("viewMonthBtn", loadIconBtn("CalendarLtrRegular"));
  uiElements.set(
    "todayBtn",
    document.getElementById("id__53").parentElement.parentElement.parentElement
  );
  uiElements.set("searchInput", document.getElementById("topSearchInput"));
  console.log("items", uiElements);
}

function loadIconBtn(icon) {
  return document.querySelector(`i[data-icon-name="${icon}"]`).parentElement
    .parentElement;
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

waitUntilLoaded(bootstrapElements);
