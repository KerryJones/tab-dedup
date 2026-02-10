# Contributing to Tab Dedup

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## Quick Links

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Guidelines](#code-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)

## Code of Conduct

- Be respectful and constructive
- Focus on what's best for the project and users
- Keep discussions on-topic and professional

## Development Setup

### Prerequisites

- Chrome browser (latest version recommended)
- Git
- Make (optional, for build automation)
- `jq` (optional, for manifest validation)

### Install from Source

```bash
# Clone the repository
git clone https://github.com/kerryjones/tab-dedup.git
cd tab-dedup

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the tab-dedup directory
```

### Icons Required

To run the extension, you need three icon files in the `/icons/` directory:

- **16×16 pixels**: `icons/icon16.png` - Toolbar icon
- **48×48 pixels**: `icons/icon48.png` - Extensions page icon
- **128×128 pixels**: `icons/icon128.png` - Chrome Web Store icon

See `/icons/ICON_REQUIREMENTS.md` for design guidelines.

## Project Structure

```
tab-dedup/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker - core logic
├── options.html/css/js    # Settings page
├── chooser/               # Tab chooser UI
│   ├── chooser.html
│   ├── chooser.css
│   └── chooser.js
├── icons/                 # Extension icons (16, 48, 128 px)
├── Makefile               # Build automation
├── LICENSE                # GPL v3 license
├── README.md              # User documentation
├── PRIVACY.md             # Privacy policy
├── CONTRIBUTING.md        # This file
├── PUBLISHING.md          # Chrome Web Store guide
└── CLAUDE.md              # AI development guide
```

## Architecture

### Overview

- **Manifest V3**: Modern Chrome extension architecture
- **Service Worker**: `background.js` runs as a service worker
- **Web Navigation API**: Intercepts navigation before it completes
- **Chrome Storage Sync**: Settings sync across devices
- **Web Accessible Resources**: Chooser page accessible via extension URL

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

### Key Functions

**`background.js`**:
- `loadConfig()`: Loads settings from Chrome sync storage
- `normalizeDomain()`: Normalizes domain names and applies aliases
- `onBeforeNavigate`: Main listener that intercepts new tab navigations

**`chooser/chooser.js`**:
- `render()`: Renders the chooser UI with options
- `confirm()`: Handles user selection (switch or open new)

**`options.js`**:
- `parseDomainAliases()`: Parses and validates domain alias input
- `parseDisallowDomains()`: Parses and validates disallow list input
- `saveSettings()`: Validates and saves configuration

## Development Workflow

### Making Changes

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the source files

3. Test in Chrome:
   - Go to `chrome://extensions/`
   - Click the refresh icon on Tab Dedup
   - Test your changes by opening new tabs
   - Check console logs if debug mode is enabled

4. Validate your changes:
   ```bash
   make validate  # Checks manifest.json and icons
   ```

5. Package for testing:
   ```bash
   make package   # Creates .zip file
   ```

### Useful Make Commands

```bash
make validate  # Validate manifest.json and check icons
make package   # Create Chrome Web Store package
make clean     # Remove build artifacts
make version   # Show current version
make help      # Show all available commands
```

### Debugging

**View console logs:**
- **Background script**: `chrome://extensions/` → Tab Dedup → "Inspect views: service worker"
- **Chooser page**: F12 when chooser is open
- **Options page**: F12 on settings page

**Enable debug mode:**
1. Right-click extension icon → Options
2. Scroll to "Advanced" section
3. Check "Enable debug logging"
4. Save settings

## Code Guidelines

### DO ✅

- Test changes with extension loaded unpacked in Chrome
- Use `make package` to create Web Store packages (validates automatically)
- Keep debug mode OFF by default (production mode)
- Add `if (config.debugMode)` checks before `console.log`
- Keep `console.error` statements always active (for bug reports)
- Validate user input in options page
- Add JSDoc comments to complex functions
- Handle Chrome API errors gracefully with try-catch
- Follow existing code style and patterns
- Test keyboard navigation in chooser UI

### DON'T ❌

- Add build tools (webpack, bundlers, transpilers) - keep code vanilla JS
- Add features beyond core tab deduplication
- Add telemetry, analytics, or external API calls
- Add dependencies or npm packages without strong justification
- Make console.log statements unconditional (breaks production mode)
- Add opinionated default configuration (keep defaults empty)
- Skip input validation on settings page
- Make breaking changes without updating version number

### Code Style

- Use vanilla JavaScript (no frameworks, no transpilation)
- Follow existing naming conventions
- Use template literals for strings when appropriate
- Prefer `async/await` over `.then()` chains
- Keep functions small and focused
- Add comments for complex logic

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

## Submitting Changes

### Before Submitting

1. ✅ Test all functionality works
2. ✅ Run `make validate`
3. ✅ Enable debug mode and check for errors
4. ✅ Test keyboard navigation
5. ✅ Check that default config is empty
6. ✅ Update README if adding user-facing features
7. ✅ Write clear commit messages

### Pull Request Process

1. Push your branch to GitHub
2. Open a Pull Request against `main`
3. Describe your changes clearly:
   - What does this PR do?
   - Why is it needed?
   - How was it tested?
4. Link to any related issues
5. Wait for review and address feedback

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add validation for domain alias format"
git commit -m "Fix chooser keyboard navigation on Firefox"

# Bad
git commit -m "fix bug"
git commit -m "updates"
```

## Reporting Bugs

### Before Reporting

1. Check if the issue already exists
2. Try with debug mode enabled
3. Test with other extensions disabled
4. Clear extension data and test again

### Bug Report Template

When reporting bugs, include:

1. **Chrome version**: `chrome://version/`
2. **Extension version**: From `chrome://extensions/`
3. **Steps to reproduce**: Numbered list
4. **Expected behavior**: What should happen
5. **Actual behavior**: What actually happens
6. **Console logs**: Enable debug mode first, paste relevant logs
7. **Screenshots**: If applicable

**Example:**

```
Chrome Version: 120.0.6099.109
Extension Version: 1.0.0

Steps to reproduce:
1. Open new tab
2. Navigate to gmail.com
3. Press Escape when chooser appears

Expected: Tab should close
Actual: Tab stays open with blank page

Console logs:
[Tab Dedup] Error: Cannot read property 'id' of undefined
  at chooser.js:127
```

## Feature Requests

We're open to feature requests, but keep in mind:

- Tab Dedup is intentionally simple and focused
- Features should align with core purpose (tab deduplication)
- Privacy and performance are priorities
- No external dependencies or services

When requesting features:
1. Describe the use case
2. Explain why existing features don't work
3. Suggest how it might work

## Versioning

We use [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes or major architecture changes
- **MINOR** (1.X.0): New features, backwards compatible
- **PATCH** (1.0.X): Bug fixes, minor improvements

Current version: **1.0.0**

Update `manifest.json` version before releasing.

## Questions?

- Check [CLAUDE.md](CLAUDE.md) for AI development guidance
- Check [PUBLISHING.md](PUBLISHING.md) for Web Store submission info
- Open a [GitHub Discussion](https://github.com/kerryjones/tab-dedup/discussions) for questions
- Open an [Issue](https://github.com/kerryjones/tab-dedup/issues) for bugs

---

Thank you for contributing! 🎉
