const DEFAULT_CONFIG = {
  domainAliases: {
    'gmail.com': 'mail.google.com'
  },
  disallowDomains: ['google.com']
};

function serializeDomainAliases(aliases) {
  return Object.entries(aliases)
    .map(([source, dest]) => `${source} = ${dest}`)
    .join('\n');
}

function parseDomainAliases(text) {
  const aliases = {};
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

  for (const line of lines) {
    const parts = line.split('=').map(p => p.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      aliases[parts[0]] = parts[1];
    }
  }

  return aliases;
}

function serializeDisallowDomains(domains) {
  return domains.join('\n');
}

function parseDisallowDomains(text) {
  return text.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

async function loadSettings() {
  const result = await chrome.storage.sync.get(DEFAULT_CONFIG);

  document.getElementById('domainAliases').value =
    serializeDomainAliases(result.domainAliases);
  document.getElementById('disallowDomains').value =
    serializeDisallowDomains(result.disallowDomains);
}

async function saveSettings() {
  const domainAliasesText = document.getElementById('domainAliases').value;
  const disallowDomainsText = document.getElementById('disallowDomains').value;

  try {
    const config = {
      domainAliases: parseDomainAliases(domainAliasesText),
      disallowDomains: parseDisallowDomains(disallowDomainsText)
    };

    await chrome.storage.sync.set(config);

    showStatus('Settings saved!');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, true);
  }
}

async function resetSettings() {
  await chrome.storage.sync.set(DEFAULT_CONFIG);
  await loadSettings();
  showStatus('Reset to defaults');
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
