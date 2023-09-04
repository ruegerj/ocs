chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason !== 'install') {
        return;
    }

    chrome.storage.local.set({
        keyMap: {
            t: 'today',
        },
    });
});

chrome.runtime.onMessage.addListener((message, _, respond) => {
    if (message.greeting === 'load-map') {
        chrome.storage.local.get('keyMap').then(respond);
        return true;
    }
});
