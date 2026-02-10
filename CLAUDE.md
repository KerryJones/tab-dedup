# Claude Development Guide for Tab Dedup

This file provides context and guidelines for AI assistants (like Claude) working on the Tab Dedup Chrome extension.

## Project Overview

Tab Dedup is a Chrome extension that automatically detects duplicate tabs and offers users a choice to switch to existing tabs instead of opening duplicates. It's built with Manifest V3 and emphasizes simplicity, privacy, and keyboard-driven UX.

**License**: GNU General Public License v3.0 (GPL v3) - ensures the extension remains open source and privacy-respecting forever.

## Core Principles

1. **Simplicity First**: This is a single-purpose extension. Don't add features that aren't directly related to tab deduplication.
2. **Privacy-Focused**: No telemetry, no external servers, no tracking. Everything runs locally.
3. **Keyboard-First UX**: The chooser interface is designed for keyboard navigation (↑↓/Enter/Esc).
4. **Production-Ready**: Debug logs are disabled by default. Code should be clean and well-commented.
5. **No Over-Engineering**: Avoid adding abstractions, frameworks, or build tools unless absolutely necessary.

## Architecture

### File Structure

```
tab-dedup/
├── manifest.json          # MV3 manifest
├── background.js          # Service worker - core deduplication logic
├── options.html/css/js    # Settings page
├── chooser/               # Tab chooser UI (shown when duplicates found)
│   ├── chooser.html
│   ├── chooser.css
│   └── chooser.js
└── icons/                 # Extension icons (user-provided)
```

### Key Components

**background.js (Service Worker)**
- Tracks newly created tabs via `chrome.tabs.onCreated`
- Intercepts navigation via `chrome.webNavigation.onBeforeNavigate`
- Compares domains using `normalizeDomain()` function
- Applies domain aliases and disallow list from config
- Redirects to chooser UI when duplicates detected
- Handles messages from chooser (switch tab, allow tab)

**chooser/chooser.js (Chooser UI)**
- Receives matched tabs and target URL via query params
- Renders list of existing tabs + "Open new tab" option
- Keyboard navigation (arrow keys, Enter, Esc)
- Sends messages back to background.js

**options.js (Settings)**
- Domain aliases: map redirecting domains to canonical forms
- Disallow list: domains that should never trigger chooser
- Debug mode: toggle for console logging
- Input validation with user-friendly error messages

## Configuration Schema

Stored in `chrome.storage.sync`:

```javascript
{
  domainAliases: {
    'source.com': 'destination.com'
  },
  disallowDomains: ['domain.com'],
  debugMode: false  // Must default to false
}
```

## Development Guidelines

### DO:
- ✅ Test changes with extension loaded unpacked in Chrome
- ✅ Keep debug mode OFF by default (production mode)
- ✅ Add `if (config.debugMode)` checks before `console.log`
- ✅ Keep `console.error` statements always active (for bug reports)
- ✅ Validate user input in options page
- ✅ Add JSDoc comments to complex functions
- ✅ Handle Chrome API errors gracefully with try-catch
- ✅ Follow existing code style and patterns
- ✅ Test keyboard navigation in chooser UI

### DON'T:
- ❌ Add build tools, bundlers, or frameworks unless absolutely necessary
- ❌ Add features beyond core tab deduplication
- ❌ Add telemetry, analytics, or external API calls
- ❌ Add dependencies or npm packages without strong justification
- ❌ Make console.log statements unconditional (breaks production mode)
- ❌ Add opinionated default configuration (keep defaults empty)
- ❌ Skip input validation on settings page
- ❌ Make breaking changes without updating version number

## Code Patterns

### Debug Logging Pattern

```javascript
// CORRECT - conditional logging
if (config.debugMode) {
  console.log('[Tab Dedup] Some debug info');
}

// CORRECT - errors always log
console.error('[Tab Dedup] Error:', error);

// WRONG - unconditional debug log
console.log('[Tab Dedup] Some debug info');
```

### Chrome API Error Handling

```javascript
// CORRECT
try {
  const tabs = await chrome.tabs.query({});
  // ... use tabs
} catch (error) {
  console.error('[Tab Dedup] Error querying tabs:', error);
  // Handle gracefully (don't crash)
}

// WRONG - no error handling
const tabs = await chrome.tabs.query({});
```

### Domain Normalization

The `normalizeDomain()` function:
1. Removes `www.` prefix
2. Converts to lowercase
3. Applies domain aliases from config

This ensures `www.example.com`, `example.com`, and aliased domains are treated as duplicates.

## Testing Checklist

When making changes, test:

1. **Basic functionality**:
   - [ ] Open new tab, navigate to site → no chooser (first time)
   - [ ] Open another new tab to same domain → chooser appears
   - [ ] Keyboard navigation works (↑↓/Enter/Esc)
   - [ ] "Switch to tab" closes current tab and focuses existing tab
   - [ ] "Open new tab" navigates to URL without triggering chooser again

2. **Configuration**:
   - [ ] Domain aliases work (e.g., gmail.com → mail.google.com)
   - [ ] Disallow list prevents chooser from appearing
   - [ ] Settings save and persist across extension reload
   - [ ] Input validation catches invalid domains

3. **Debug mode**:
   - [ ] Console is quiet by default (debug mode OFF)
   - [ ] Enabling debug mode shows logs
   - [ ] Disabling debug mode stops logs (except errors)
   - [ ] Errors always appear regardless of debug mode

4. **Edge cases**:
   - [ ] No crash if matched tab is closed before selection
   - [ ] No infinite loops with "Open new tab" option
   - [ ] No chooser on non-new tabs (refreshing existing tab)
   - [ ] Works across multiple windows

## Common Pitfalls

### 1. The "Open New Tab" Infinite Loop
**Problem**: If "Open new tab" doesn't properly mark the tab as allowed, the navigation triggers the chooser again.

**Solution**: The `allowedTabs` Set in background.js tracks tabs that should skip duplicate detection. The chooser sends a `allowTab` message before navigating.

### 2. Forgetting to Remove from `newTabs` Set
**Problem**: Tabs stay marked as "new" and every navigation triggers duplicate check.

**Solution**: Always call `newTabs.delete(tabId)` after handling a navigation (whether allowing it or showing chooser).

### 3. Breaking Debug Mode
**Problem**: Adding console.log without the conditional check.

**Solution**: Always wrap in `if (config.debugMode)` or `if (debugMode)`.

### 4. Assuming Config Is Loaded
**Problem**: Service workers can restart, losing in-memory config.

**Solution**: `loadConfig()` is called on startup and listens for storage changes.

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes or major architecture changes
- **MINOR** (1.X.0): New features, backwards compatible
- **PATCH** (1.0.X): Bug fixes, minor improvements

Current version: **1.0.0**

Update `manifest.json` version before publishing updates.

## Chrome Web Store

- The extension is (will be) published on Chrome Web Store
- See `PUBLISHING.md` for submission guidelines
- All updates must be reviewed by Chrome Web Store team
- Maintain the privacy-first approach (required for store listing)

## Debug Commands

```bash
# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select the tab-dedup directory
#
# Or use: make install (shows instructions)

# View console logs (when debug mode enabled)
# 1. Background: chrome://extensions/ → Tab Dedup → "Inspect views: service worker"
# 2. Chooser: F12 on the chooser page
# 3. Options: F12 on the options page

# Package for Chrome Web Store (recommended)
make package

# Or manually (if Make not available)
cd /Users/kerryjones/code/tab-dedup
zip -r tab-dedup-v1.0.0.zip . \
  -x "*.git*" "*.DS_Store" "Makefile" \
  -x "PUBLISHING.md" "CLAUDE.md" "PRIVACY.md" \
  -x "screenshots/*" "icons/ICON_REQUIREMENTS.md" "*.zip"

# Other useful Make commands
make help      # Show all available commands
make validate  # Validate manifest and check icons
make clean     # Remove build artifacts
make version   # Show current version
```

## Project Status

- ✅ Core functionality complete and working
- ✅ Production-ready (v1.0.0)
- ✅ Debug mode implemented
- ✅ Input validation added
- ✅ Error handling in place
- ✅ Documentation complete (README, PUBLISHING, code comments)
- ⏳ Icons needed (user will provide)
- ⏳ Screenshots needed for Chrome Web Store
- ⏳ Chrome Web Store submission pending

## Questions or Issues?

- GitHub: https://github.com/kerryjones/tab-dedup
- Check existing issues before implementing features
- Maintain the single-purpose, privacy-focused philosophy

---

**Remember**: This extension does ONE thing well. Keep it simple, fast, and privacy-respecting.
