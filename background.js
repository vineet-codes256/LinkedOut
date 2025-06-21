// Simple LinkedIn Time Tracker - Background Script
const DAILY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

let currentLinkedInTab = null;
let startTime = null;

function getTodayKey() {
    const today = new Date();
    return `linkedin_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;
}

function isLinkedInUrl(url) {
    return url && url.includes('linkedin.com');
}

async function getTotalTime() {
    return new Promise(resolve => {
        chrome.storage.local.get([getTodayKey()], result => {
            resolve(result[getTodayKey()] || 0);
        });
    });
}

async function addTime(milliseconds) {
    const key = getTodayKey();
    const currentTotal = await getTotalTime();
    const newTotal = currentTotal + milliseconds;
    
    chrome.storage.local.set({ [key]: newTotal });
    return newTotal;
}

async function saveCurrentSession() {
    if (!startTime) return;
    
    const sessionTime = Date.now() - startTime;
    const totalTime = await addTime(sessionTime);
    
    console.log(`Added ${sessionTime}ms, total: ${totalTime}ms`);
    
    // Check if over limit and block
    if (totalTime >= DAILY_LIMIT_MS && currentLinkedInTab) {
        chrome.tabs.sendMessage(currentLinkedInTab, { action: "block_linkedin" });
    }
}

function startTracking(tabId) {
    if (currentLinkedInTab === tabId) return; // Already tracking
    
    stopTracking(); // Stop any existing tracking
    currentLinkedInTab = tabId;
    startTime = Date.now();
    console.log(`Started tracking tab ${tabId}`);
}

function stopTracking() {
    if (!currentLinkedInTab) return;
    
    saveCurrentSession();
    currentLinkedInTab = null;
    startTime = null;
    console.log('Stopped tracking');
}

// Check if already over limit and block immediately
async function checkAndBlock(tabId) {
    const totalTime = await getTotalTime();
    if (totalTime >= DAILY_LIMIT_MS) {
        chrome.tabs.sendMessage(tabId, { action: "block_linkedin" });
    }
}

// Event Listeners
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, tab => {
        if (isLinkedInUrl(tab?.url)) {
            startTracking(tab.id);
            checkAndBlock(tab.id);
        } else {
            stopTracking();
        }
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.active) return;
    
    if (isLinkedInUrl(tab.url)) {
        startTracking(tabId);
        checkAndBlock(tabId);
    } else if (tabId === currentLinkedInTab) {
        stopTracking();
    }
});

chrome.windows.onFocusChanged.addListener(windowId => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // User left browser - save current session but keep tracking
        saveCurrentSession();
        if (currentLinkedInTab) {
            startTime = null; // Pause timer
        }
    } else if (currentLinkedInTab && !startTime) {
        // User came back - resume timer
        startTime = Date.now();
    }
});

chrome.tabs.onRemoved.addListener(tabId => {
    if (tabId === currentLinkedInTab) {
        stopTracking();
    }
});

// Periodic check - block any LinkedIn tabs if over limit
setInterval(async () => {
    const totalTime = await getTotalTime();
    if (totalTime >= DAILY_LIMIT_MS) {
        chrome.tabs.query({ url: "*://*.linkedin.com/*" }, tabs => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, { action: "block_linkedin" });
            });
        });
    }
}, 2000);

