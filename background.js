chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (tab.url && tab.url.includes("mail.google.com")) {
        const queryParams = tab.url.split('?') //! you dont need it.
    }
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.type === "shownotification"){
        chrome.notifications.create('notify', request.opt, function(){})
    }
});
