document.addEventListener('DOMContentLoaded', function() {
    const scanBtn = document.getElementById('scan-btn');
    const statusText = document.getElementById('status-text');
    const statusIcon = document.getElementById('status-icon');
    const urlText = document.getElementById('url-text');

    // 1. Get the current active tab URL
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        urlText.textContent = currentUrl;

        // Automatically scan if it's a http/https link
        if (currentUrl.startsWith('http')) {
            scanUrl(currentUrl);
        } else {
            statusText.textContent = "System Page";
            statusIcon.textContent = "🚫";
            scanBtn.disabled = true;
        }
    });

    // 2. Function to call your Local API
    async function scanUrl(url) {
        // Update UI to loading state
        statusText.textContent = "Scanning...";
        statusText.className = "loading";
        statusIcon.textContent = "⏳";
        scanBtn.disabled = true;
        scanBtn.textContent = "Analyzing...";

        try {
            const response = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            // 3. Update UI with Results
            if (data.is_safe) {
                statusText.textContent = "SAFE TO VISIT";
                statusText.className = "safe";
                statusIcon.textContent = "✅";
            } else {
                statusText.textContent = "PHISHING DETECTED";
                statusText.className = "danger";
                statusIcon.textContent = "⚠️";
            }

        } catch (error) {
            statusText.textContent = "Connection Error";
            statusIcon.textContent = "🔌";
            urlText.textContent = "Is the Backend running?";
            console.error(error);
        } finally {
            scanBtn.textContent = "Re-Scan";
            scanBtn.disabled = false;
        }
    }

    // Allow manual re-scan
    scanBtn.addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            scanUrl(tabs[0].url);
        });
    });
});