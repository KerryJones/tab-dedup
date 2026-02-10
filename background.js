const allowedTabs = new Set();
const newTabs = new Set();

// Configuration loaded from storage
let config = {
  domainAliases: {},
  disallowDomains: []
};

// Load configuration from storage
async function loadConfig() {
  const DEFAULT_CONFIG = {
    domainAliases: {
      'gmail.com': 'mail.google.com'
    },
    disallowDomains: ['google.com']
  };

  const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
  config = result;
  console.log('[Tab Dedup] Config loaded:', config);
}

// Listen for config changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    loadConfig();
  }
});

function normalizeDomain(hostname) {
  let normalized = hostname.replace(/^www\./, "").toLowerCase();
  // Apply domain aliases from config
  const canonical = config.domainAliases[normalized] || normalized;
  if (canonical !== normalized) {
    console.log('[Tab Dedup] Domain alias:', normalized, '→', canonical);
  }
  return canonical;
}

// Initialize config on startup
loadConfig();

// Track newly created tabs
chrome.tabs.onCreated.addListener((tab) => {
  newTabs.add(tab.id);
  console.log('[Tab Dedup] New tab created:', tab.id);
});

// Clean up when tabs are removed
chrome.tabs.onRemoved.addListener((tabId) => {
  newTabs.delete(tabId);
  allowedTabs.delete(tabId);
});

chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    console.log('[Tab Dedup] onBeforeNavigate fired', {
      url: details.url,
      tabId: details.tabId,
      frameId: details.frameId
    });

    if (details.frameId !== 0) return;

    const tabId = details.tabId;

    if (allowedTabs.has(tabId)) {
      console.log('[Tab Dedup] Tab in allowedTabs, skipping');
      allowedTabs.delete(tabId);
      newTabs.delete(tabId);
      return;
    }

    if (!newTabs.has(tabId)) {
      console.log('[Tab Dedup] Not a new tab, skipping');
      return;
    }

    console.log('[Tab Dedup] This is a new tab navigation');

    let targetUrl;
    try {
      targetUrl = new URL(details.url);
    } catch {
      return;
    }

    if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
      return;
    }

    const targetDomain = normalizeDomain(targetUrl.hostname);
    console.log('[Tab Dedup] Target domain:', targetDomain);

    // Check if domain is in disallow list
    if (config.disallowDomains.includes(targetDomain)) {
      console.log('[Tab Dedup] Domain in disallow list, allowing navigation');
      newTabs.delete(tabId);
      return;
    }

    const allTabs = await chrome.tabs.query({});
    const matches = allTabs.filter((t) => {
      if (t.id === tabId) return false;
      try {
        const tabUrl = new URL(t.url);
        return normalizeDomain(tabUrl.hostname) === targetDomain;
      } catch {
        return false;
      }
    });

    console.log('[Tab Dedup] Found', matches.length, 'matching tabs');

    if (matches.length === 0) {
      // No matches, allow this navigation and mark tab as no longer new
      newTabs.delete(tabId);
      return;
    }

    const matchData = matches.map((t) => ({
      id: t.id,
      windowId: t.windowId,
      title: t.title,
      url: t.url,
    }));

    const params = new URLSearchParams({
      target: details.url,
      matches: JSON.stringify(matchData),
    });

    const chooserUrl = chrome.runtime.getURL(
      `chooser/chooser.html?${params.toString()}`
    );

    console.log('[Tab Dedup] Redirecting to chooser:', chooserUrl);

    // Mark tab as no longer new to prevent intercepting chooser page navigations
    newTabs.delete(tabId);

    chrome.tabs.update(tabId, { url: chooserUrl });
  },
  { url: [{ schemes: ["http", "https"] }] }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Tab Dedup] Message received:', message.type);

  if (message.type === "allowTab") {
    allowedTabs.add(message.tabId);
    console.log('[Tab Dedup] Added tab', message.tabId, 'to allowedTabs');
    sendResponse({ ok: true });
  } else if (message.type === "switchToTab") {
    console.log('[Tab Dedup] Switching to tab', message.targetTabId, 'in window', message.windowId);
    (async () => {
      try {
        await chrome.tabs.update(message.targetTabId, { active: true });
        console.log('[Tab Dedup] Activated tab', message.targetTabId);
        await chrome.windows.update(message.windowId, { focused: true });
        console.log('[Tab Dedup] Focused window', message.windowId);
        await chrome.tabs.remove(message.senderTabId);
        console.log('[Tab Dedup] Removed sender tab', message.senderTabId);
        sendResponse({ ok: true });
      } catch (error) {
        console.error('[Tab Dedup] Error switching tabs:', error);
        sendResponse({ ok: false });
      }
    })();
    return true;
  }
});
