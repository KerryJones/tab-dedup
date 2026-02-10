# Chrome Web Store Publishing Guide

This document outlines the requirements and steps for publishing Tab Dedup to the Chrome Web Store.

## Pre-Publishing Checklist

- [ ] All icons created and placed in `/icons/` directory (16x16, 48x48, 128x128)
- [ ] Extension tested in Chrome (unpacked mode)
- [ ] All features working correctly
- [ ] Debug mode disabled by default
- [ ] manifest.json version set correctly (currently 1.0.0)
- [ ] README.md complete and accurate
- [ ] Privacy policy reviewed
- [ ] Screenshots prepared
- [ ] Promotional images created (optional but recommended)

## Required Assets

### 1. Icons (REQUIRED)

**Files needed**:
- `icons/icon16.png` - 16×16 pixels
- `icons/icon48.png` - 48×48 pixels
- `icons/icon128.png` - 128×128 pixels

**Requirements**:
- PNG format
- Transparent or solid background
- Should be recognizable at small sizes
- Consistent design across all sizes

**Status**: See `icons/ICON_REQUIREMENTS.md` for detailed specifications

### 2. Screenshots (REQUIRED)

**Requirements**:
- **Size**: 1280×800 or 640×400 pixels (recommended: 1280×800)
- **Format**: PNG or JPEG
- **Maximum**: 5 screenshots
- **Minimum**: 1 screenshot (recommended: 2-3)

**Recommended screenshots**:

1. **Chooser Interface** (Primary screenshot)
   - Show the tab chooser UI with multiple matching tabs
   - Include keyboard hints at the bottom
   - Use a recognizable website (e.g., GitHub, Wikipedia)

2. **Settings Page**
   - Show the options page with example configuration
   - Include both Domain Aliases and Disallow List sections
   - Maybe show the Advanced section with debug mode

3. **In Action** (Optional)
   - Show the extension detecting a duplicate tab
   - Before/after comparison of tab bar

**Tips**:
- Use high-resolution displays for screenshots
- Show real-world use cases
- Keep screenshots clean and uncluttered
- Avoid showing personal information

### 3. Promotional Tile (OPTIONAL but RECOMMENDED)

**Requirements**:
- **Size**: 440×280 pixels
- **Format**: PNG or JPEG
- **Purpose**: Featured placement in Chrome Web Store

**Design suggestions**:
- Feature the extension icon prominently
- Include the name "Tab Dedup"
- Simple tagline like "Stop Opening Duplicate Tabs"
- Clean, modern design
- Use Chrome's design language (Material Design)

### 4. Small Promotional Tile (OPTIONAL)

**Requirements**:
- **Size**: 128×128 pixels
- **Format**: PNG or JPEG
- **Purpose**: Additional promotional placement

Can be a simplified version of the main promotional tile.

## Store Listing Information

### Name
```
Tab Dedup
```

### Summary (132 characters max)
```
Automatically detects duplicate tabs and offers to switch to existing tabs instead of opening duplicates.
```

### Description

Use the detailed description below (can be edited in the Chrome Web Store Developer Dashboard):

```
Tab Dedup helps you manage your tabs by automatically detecting when you're about to open a duplicate. Instead of creating another tab for the same website, it shows you a clean interface where you can:

• Switch to an existing tab with one keypress
• See all matching tabs across all windows
• Open a new tab anyway if you really need it

KEY FEATURES

⌨️ Full Keyboard Support
Navigate with arrow keys, confirm with Enter, cancel with Esc. Fast and efficient.

🎯 Smart Domain Matching
Configure domain aliases to handle redirects (e.g., gmail.com → mail.google.com)

🚫 Disallow List
Exclude domains where you want multiple tabs (like search engines or localhost)

🔒 Privacy First
No tracking, no telemetry, no external servers. All processing happens locally.

☁️ Chrome Sync
Settings sync across all your Chrome devices automatically

🐛 Debug Mode
Optional detailed logging for troubleshooting and bug reports

HOW IT WORKS

1. You open a new tab and start typing a URL
2. Tab Dedup checks if any existing tabs match that domain
3. If matches are found, you see a chooser interface
4. Select an existing tab to switch to it, or choose "Open new tab"
5. That's it! No manual searching through dozens of tabs

PERFECT FOR

• Developers who work with multiple documentation sites
• Researchers who open many reference pages
• Anyone with 20+ tabs open at any given time
• Power users who want better tab management

CONFIGURATION

The extension works great out of the box, but you can customize it:

• Domain Aliases: Map redirecting domains to their canonical form
• Disallow List: Exclude specific domains from duplicate detection
• Debug Mode: Enable detailed console logging for troubleshooting

All settings sync via Chrome's built-in sync, so you only configure once.

PRIVACY

Tab Dedup respects your privacy:
✓ No data collection
✓ No external servers
✓ No tracking or analytics
✓ Open source on GitHub
✓ Only stores your configuration locally

SUPPORT

Found a bug? Have a suggestion? Visit the GitHub repository:
https://github.com/kerryjones/tab-dedup

This extension uses Manifest V3, Chrome's modern extension architecture.
```

### Category
```
Productivity
```

### Language
```
English (United States)
```

## Privacy Policy

**Required for Chrome Web Store**. A complete privacy policy has been created in `PRIVACY.md`.

### How to Link to Privacy Policy in Chrome Web Store

You have **three options** for providing the privacy policy URL:

#### Option 1: Link Directly to GitHub File (Recommended)
```
https://github.com/kerryjones/tab-dedup/blob/main/PRIVACY.md
```

**Pros:**
- ✅ Simple and direct
- ✅ No extra setup needed
- ✅ Automatically stays in sync with your repo
- ✅ Chrome Web Store accepts GitHub links

**Cons:**
- ❌ Shows GitHub UI (but this is fine)

#### Option 2: Use GitHub Raw Link
```
https://raw.githubusercontent.com/kerryjones/tab-dedup/main/PRIVACY.md
```

**Pros:**
- ✅ Shows just the markdown text
- ✅ No GitHub UI

**Cons:**
- ❌ Harder to read (not rendered)
- ❌ Less professional looking

#### Option 3: GitHub Pages (Optional)
If you want a prettier URL like `https://kerryjones.github.io/tab-dedup/privacy`:
1. Enable GitHub Pages in repo settings
2. Create a `docs/` folder with HTML version
3. More work, but looks more professional

**Recommendation**: Use **Option 1** (direct GitHub link). It's accepted by Chrome Web Store, requires zero extra work, and looks professional enough.

## Packaging the Extension

### Option 1: Using Make (Recommended)

The project includes a Makefile for easy, consistent packaging:

```bash
cd /Users/kerryjones/code/tab-dedup
make package
```

This will:
- ✅ Automatically use the version from manifest.json
- ✅ Validate manifest.json syntax
- ✅ Check that all required icons are present
- ✅ Exclude all documentation/development files correctly
- ✅ Show package contents and size
- ✅ Create `tab-dedup-v1.0.0.zip` (or current version)

**Other useful commands:**
```bash
make help      # Show all available commands
make validate  # Just validate manifest and check icons
make clean     # Remove all .zip files
make version   # Show current version
```

### Option 2: Manual ZIP (if Make not available)

```bash
cd /Users/kerryjones/code/tab-dedup
zip -r tab-dedup-v1.0.0.zip . \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "Makefile" \
  -x "PUBLISHING.md" \
  -x "CLAUDE.md" \
  -x "PRIVACY.md" \
  -x "screenshots/*" \
  -x "icons/ICON_REQUIREMENTS.md" \
  -x "*.zip"
```

**Files to include** (required):
- `manifest.json` ✅
- `background.js` ✅
- `options.html`, `options.css`, `options.js` ✅
- `chooser/` directory (all files) ✅
- `icons/` directory (*.png files only) ✅
- `LICENSE` ✅ (required by GPL v3)
- `README.md` ✅ (optional, but good practice)

**Files to exclude** (documentation/development only):
- `.git/` and `.gitignore` ❌
- `.DS_Store` ❌
- `PUBLISHING.md` ❌ (publishing guide - not for users)
- `CLAUDE.md` ❌ (AI development guide - not for users)
- `PRIVACY.md` ❌ (hosted on GitHub, linked from Web Store)
- `screenshots/` ❌ (uploaded separately to Web Store)
- `icons/ICON_REQUIREMENTS.md` ❌ (development docs)
- `*.zip` files ❌
- `node_modules/` ❌ (if present)

## Chrome Web Store Submission Steps

### 1. Create Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time $5 developer registration fee
3. Complete account setup

### 2. Upload Extension

1. Click "New Item" in the Developer Dashboard
2. Upload the ZIP file created above
3. Chrome will validate the manifest and files

### 3. Fill Out Store Listing

Complete all required fields:

- **Product details**
  - Name: Tab Dedup
  - Summary: (see above)
  - Detailed description: (see above)
  - Category: Productivity
  - Language: English (United States)

- **Graphic assets**
  - Upload icon (128×128) - will be extracted from ZIP
  - Upload screenshots (at least 1, recommended 2-3)
  - Upload promotional tile (optional, 440×280)

- **Privacy**
  - Privacy policy URL: (link to hosted privacy policy)
  - Permissions justification: Explain why each permission is needed

- **Additional fields**
  - Official URL: https://github.com/kerryjones/tab-dedup
  - Support URL: https://github.com/kerryjones/tab-dedup/issues

### 4. Submit for Review

1. Review all information carefully
2. Click "Submit for review"
3. Chrome Web Store team will review (typically 1-3 business days)

### 5. Post-Approval

Once approved:
- Extension will be live on Chrome Web Store
- Users can install directly from the store
- Update README.md to link to the store listing
- Share the store URL!

## Publishing Updates

When publishing updates:

1. Update `version` in `manifest.json` (follow semantic versioning)
2. Test thoroughly in unpacked mode
3. Create a new ZIP file
4. Go to Developer Dashboard
5. Click "Package" → "Upload new package"
6. Upload the new ZIP
7. Update store listing if needed (new screenshots, description changes)
8. Click "Submit for review"

**Note**: Minor updates typically review faster than initial submissions.

## Store URL Format

After publishing, your extension will be available at:
```
https://chrome.google.com/webstore/detail/[extension-id]
```

The extension ID is assigned by Google and cannot be changed.

## Pricing

Tab Dedup is **free** (no in-app purchases, no subscription).

## Verification Status

Consider applying for verified publisher status (shows a checkmark badge):
- Requires domain verification
- Improves user trust
- See [Chrome Web Store verification docs](https://developer.chrome.com/docs/webstore/verify/)

## Troubleshooting

### Common Rejection Reasons

1. **Missing or incorrect privacy policy** - Must be hosted at a public URL
2. **Unclear permission justification** - Explain why each permission is necessary
3. **Poor quality screenshots** - Use high-resolution, clear images
4. **Single-purpose requirement** - Extension must do one thing well
5. **Misleading description** - Don't claim features you don't have

### Appeal Process

If rejected:
1. Read the rejection reason carefully
2. Fix the issues mentioned
3. Resubmit with changes documented
4. If you disagree, respond to the review with explanation

## Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Development Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)

## Questions?

Open an issue on GitHub: https://github.com/kerryjones/tab-dedup/issues
