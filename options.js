const DEFAULT_CONFIG = {
  domainAliases: {},
  disallowDomains: [],
  debugMode: false
};

function serializeDomainAliases(aliases) {
  return Object.entries(aliases)
    .map(([source, dest]) => `${source} = ${dest}`)
    .join('\n');
}

/**
 * Parse domain aliases from textarea input
 * Format: source = destination (one per line)
 * @param {string} text - Raw textarea input
 * @returns {Object} Object with valid aliases and validation errors
 */
function parseDomainAliases(text) {
  const aliases = {};
  const errors = [];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

  // Basic domain validation regex (simplified, allows most common domain formats)
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split('=').map(p => p.trim());

    if (parts.length !== 2) {
      errors.push(`Line ${i + 1}: Invalid format (expected "source = destination")`);
      continue;
    }

    const [source, dest] = parts;

    if (!source || !dest) {
      errors.push(`Line ${i + 1}: Both source and destination domains are required`);
      continue;
    }

    if (!domainRegex.test(source)) {
      errors.push(`Line ${i + 1}: Invalid source domain "${source}"`);
      continue;
    }

    if (!domainRegex.test(dest)) {
      errors.push(`Line ${i + 1}: Invalid destination domain "${dest}"`);
      continue;
    }

    aliases[source] = dest;
  }

  return { aliases, errors };
}

function serializeDisallowDomains(domains) {
  return domains.join('\n');
}

/**
 * Parse disallow domains from textarea input
 * Format: one domain per line
 * @param {string} text - Raw textarea input
 * @returns {Object} Object with valid domains and validation errors
 */
function parseDisallowDomains(text) {
  const domains = [];
  const errors = [];
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  // Basic domain validation regex
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

  for (let i = 0; i < lines.length; i++) {
    const domain = lines[i];

    if (!domainRegex.test(domain)) {
      errors.push(`Line ${i + 1}: Invalid domain "${domain}"`);
      continue;
    }

    domains.push(domain);
  }

  return { domains, errors };
}

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(DEFAULT_CONFIG);

    document.getElementById('domainAliases').value =
      serializeDomainAliases(result.domainAliases || {});
    document.getElementById('disallowDomains').value =
      serializeDisallowDomains(result.disallowDomains || []);
    document.getElementById('debugMode').checked = result.debugMode || false;
  } catch (error) {
    showStatus('Error loading settings: ' + error.message, true);
  }
}

async function saveSettings() {
  const domainAliasesText = document.getElementById('domainAliases').value;
  const disallowDomainsText = document.getElementById('disallowDomains').value;
  const debugMode = document.getElementById('debugMode').checked;

  try {
    // Parse and validate inputs
    const aliasResult = parseDomainAliases(domainAliasesText);
    const disallowResult = parseDisallowDomains(disallowDomainsText);

    // Collect all validation errors
    const allErrors = [...aliasResult.errors, ...disallowResult.errors];

    if (allErrors.length > 0) {
      const errorMessage = 'Validation errors:\n' + allErrors.join('\n');
      showStatus(errorMessage, true);
      return;
    }

    const config = {
      domainAliases: aliasResult.aliases,
      disallowDomains: disallowResult.domains,
      debugMode: debugMode
    };

    await chrome.storage.sync.set(config);

    showStatus('Settings saved!');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, true);
  }
}

async function resetSettings() {
  try {
    await chrome.storage.sync.set(DEFAULT_CONFIG);
    await loadSettings();
    showStatus('Reset to defaults');
  } catch (error) {
    showStatus('Error resetting settings: ' + error.message, true);
  }
}

function showStatus(message, isError = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = isError ? 'error' : '';

  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 3000);
}

document.getElementById('save').addEventListener('click', saveSettings);
document.getElementById('reset').addEventListener('click', resetSettings);

loadSettings();
