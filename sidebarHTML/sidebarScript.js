window.addEventListener('message', function(event) {
    if (event.data.action === 'addClickListener') {
        const closeButton = document.getElementById('closeBtn');
        closeButton.addEventListener('click', function() {
            event.source.postMessage({ action: 'closeSidebar' }, '*');
        });

        const downloadButton = document.getElementById('downloadBtn');
        downloadButton === null? ('') : 
        (downloadButton.addEventListener('click', function() {
            event.source.postMessage({action: 'openFilter'}, '*');
        })); 
        
        const configButton = document.getElementById('configBtn');
        configButton.addEventListener('click', function () {
            event.source.postMessage({action: 'lastConfig'}, '*');
        });
    }
});