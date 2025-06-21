// LinkedIn Jobs Blocker Extension

function hideJobElements() {
    // Hide job links in navigation or lists
    document.querySelectorAll('li > a').forEach(link => {
        if (link.href && link.href.includes('linkedin.com/jobs')) {
            if (link.parentElement) {
                link.parentElement.style.display = 'none';
            }
        }
    });

    // Remove job posting aggregates
    document.querySelectorAll('div').forEach(el => {
        if (el.getAttribute('data-id') && el.getAttribute('data-id').includes('urn:li:jobPosting')) {
            if (el.parentNode) el.parentNode.remove();
        }
    });
}

// Observe DOM changes for dynamically loaded content
const observer = new MutationObserver(() => {
    hideJobElements();
});
observer.observe(document.body, { childList: true, subtree: true });

// Overlay block function
function showBlockOverlay() {
    if (!document.getElementById('linkedin-block-overlay')) {
        // prevent scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        //prevent right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // prevent any key presses
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
        });

        const overlay = document.createElement('div');
        overlay.id = 'linkedin-block-overlay';
        overlay.style.overflow = 'hidden';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.95)';
        overlay.style.zIndex = 999999;
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.style.fontSize = '2rem';
        overlay.innerHTML = `
            <div>
                <strong>Daily LinkedIn limit reached!</strong>
                <p>Come back tomorrow.</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
}

// Listen for block message from background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "block_linkedin") {
        console.clear();
        console.log("LinkedIn block message received. Showing overlay.");
        showBlockOverlay();
    }
});

// on page load, check if the overlay should be shown
window.addEventListener('load', () => {

    // Run once on script load
    hideJobElements();

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['dailyTimeSpent'], (result) => {
            if ((result.dailyTimeSpent || 0) >= (typeof DAILY_LIMIT_MS !== "undefined" ? DAILY_LIMIT_MS : Number.MAX_SAFE_INTEGER)) {
                console.log("Daily limit reached on page load. Showing overlay.");
                showBlockOverlay();
            }
        });
    }
});
