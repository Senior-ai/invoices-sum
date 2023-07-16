document.addEventListener('DOMContentLoaded', function() {
    var navigateButton = document.getElementById('navBtn');
    navigateButton.addEventListener('click', openNewTab);
});

function openNewTab() {
    var newTabUrl = 'https://mail.google.com/';
    chrome.tabs.create({ url: newTabUrl });
}