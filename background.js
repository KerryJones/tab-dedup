const allowedTabs = new Set();
const newTabs = new Set();

// Configuration loaded from storage
let config = {
  domainAliases: {},
  disallowDomains: [],
  debugMode: false
};

/**
 * Load configuration from Chrome sync storage
 * Sets defaults for any missing config values
 */
async function loadConfig() {
  const DEFAULT_CONFIG = {
    domainAliases: {},
    disallowDomains: [],
    debugMode: false
  };

  try {
    const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
    config = result;
    // Normalize stored domains to match how hostnames are normalized at runtime,
    // in case entries were saved before normalization was enforced in options.js
    config.disallowDomains = config.disallowDomains.map(
      d => d.replace(/^www\./, '').toLowerCase().trim()
    );
    config.domainAliases = Object.fromEntries(
      Object.entries(config.domainAliases).map(
        ([k, v]) => [k.replace(/^www\./, '').toLowerCase().trim(), v.replace(/^www\./, '').toLowerCase().trim()]
      )
    );
    if (config.debugMode) {
      console.log('[Tab Dedup] Config loaded:', config);
    }
  } catch (error) {
    console.error('[Tab Dedup] Error loading config:', error);
    config = DEFAULT_CONFIG;
  }
}

// Listen for config changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    loadConfig();
  }
});

/**
 * Normalize domain name by removing www prefix and applying domain aliases
 * @param {string} hostname - The hostname to normalize
 * @returns {string} The normalized/canonical domain name
 */
function normalizeDomain(hostname) {
  let normalized = hostname.replace(/^www\./, "").toLowerCase();
  // Apply domain aliases from config
  const canonical = config.domainAliases[normalized] || normalized;
  if (canonical !== normalized && config.debugMode) {
    console.log('[Tab Dedup] Domain alias:', normalized, '→', canonical);
  }
  return canonical;
}

// Initialize config on startup - store promise so navigation handler can await it
const configReady = loadConfig();

// Track newly created tabs
chrome.tabs.onCreated.addListener((tab) => {
  newTabs.add(tab.id);
  if (config.debugMode) {
    console.log('[Tab Dedup] New tab created:', tab.id);
  }
});

// Clean up when tabs are removed
chrome.tabs.onRemoved.addListener((tabId) => {
  newTabs.delete(tabId);
  allowedTabs.delete(tabId);
});

/**
 * Main navigation interceptor - detects duplicate tabs and shows chooser
 * Flow: new tab created → user navigates → check for existing tabs → show chooser or allow
 */
chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    // Wait for config to load - handles race condition on service worker restart
    await configReady;

    if (config.debugMode) {
      console.log('[Tab Dedup] onBeforeNavigate fired', {
        url: details.url,
        tabId: details.tabId,
        frameId: details.frameId
      });
    }

    if (details.frameId !== 0) return;

    const tabId = details.tabId;

    if (allowedTabs.has(tabId)) {
      if (config.debugMode) {
        console.log('[Tab Dedup] Tab in allowedTabs, skipping');
      }
      allowedTabs.delete(tabId);
      newTabs.delete(tabId);
      return;
    }

    if (!newTabs.has(tabId)) {
      if (config.debugMode) {
        console.log('[Tab Dedup] Not a new tab, skipping');
      }
      return;
    }

    if (config.debugMode) {
      console.log('[Tab Dedup] This is a new tab navigation');
    }

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
    if (config.debugMode) {
      console.log('[Tab Dedup] Target domain:', targetDomain);
    }

    // Check if domain is in disallow list
    if (config.disallowDomains.includes(targetDomain)) {
      if (config.debugMode) {
        console.log('[Tab Dedup] Domain in disallow list, allowing navigation');
      }
      newTabs.delete(tabId);
      return;
    }

    let allTabs;
    try {
      allTabs = await chrome.tabs.query({});
    } catch (error) {
      console.error('[Tab Dedup] Error querying tabs:', error);
      newTabs.delete(tabId);
      return;
    }

    const matches = allTabs.filter((t) => {
      if (t.id === tabId) return false;
      try {
        const tabUrl = new URL(t.url);
        return normalizeDomain(tabUrl.hostname) === targetDomain;
      } catch {
        return false;
      }
    });

    if (config.debugMode) {
      console.log('[Tab Dedup] Found', matches.length, 'matching tabs');
    }

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

    if (config.debugMode) {
      console.log('[Tab Dedup] Redirecting to chooser:', chooserUrl);
    }

    // Mark tab as no longer new to prevent intercepting chooser page navigations
    newTabs.delete(tabId);

    chrome.tabs.update(tabId, { url: chooserUrl });
  },
  { url: [{ schemes: ["http", "https"] }] }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (config.debugMode) {
    console.log('[Tab Dedup] Message received:', message.type);
  }

  if (message.type === "allowTab") {
    allowedTabs.add(message.tabId);
    if (config.debugMode) {
      console.log('[Tab Dedup] Added tab', message.tabId, 'to allowedTabs');
    }
    sendResponse({ ok: true });
  } else if (message.type === "switchToTab") {
    if (config.debugMode) {
      console.log('[Tab Dedup] Switching to tab', message.targetTabId, 'in window', message.windowId);
    }
    (async () => {
      try {
        await chrome.tabs.update(message.targetTabId, { active: true });
        if (config.debugMode) {
          console.log('[Tab Dedup] Activated tab', message.targetTabId);
        }
        await chrome.windows.update(message.windowId, { focused: true });
        if (config.debugMode) {
          console.log('[Tab Dedup] Focused window', message.windowId);
        }
        await chrome.tabs.remove(message.senderTabId);
        if (config.debugMode) {
          console.log('[Tab Dedup] Removed sender tab', message.senderTabId);
        }
        sendResponse({ ok: true });
      } catch (error) {
        console.error('[Tab Dedup] Error switching tabs:', error);
        sendResponse({ ok: false });
      }
    })();
    return true;
  }
});
