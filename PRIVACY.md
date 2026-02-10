# Privacy Policy for Tab Dedup

**Last updated: February 10, 2025**

## Overview

Tab Dedup is committed to protecting your privacy. This extension does not collect, store, or transmit any personal data to external servers.

## Data Collection

Tab Dedup does **NOT** collect:
- Browsing history
- Personal information
- Website URLs you visit
- Usage statistics or analytics
- Any form of telemetry or tracking data

## Data Storage

The only data stored by Tab Dedup is your configuration settings:

- **Domain aliases** (if you configure them)
- **Disallow list** (if you configure it)
- **Debug mode preference**

This configuration data is stored **locally** on your device using Chrome's built-in sync storage API. If you are signed into Chrome with sync enabled, these settings will sync across your devices using Google's secure sync infrastructure. Tab Dedup does not access, control, or have visibility into this sync mechanism beyond using the standard Chrome API.

## Permissions

Tab Dedup requires the following Chrome permissions:

### tabs
Used to:
- Detect when duplicate tabs exist
- Switch focus between tabs
- Close the chooser tab after selection

### webNavigation
Used to:
- Intercept navigation events on newly created tabs
- Check if the destination URL matches an existing tab's domain

### storage
Used to:
- Save your configuration settings (domain aliases, disallow list, debug mode)
- Sync these settings across your Chrome devices

**These permissions are used solely for the extension's core functionality.** The extension cannot and does not access tab content, passwords, form data, or any other sensitive information.

## Third-Party Services

Tab Dedup does **NOT** use:
- Analytics services (Google Analytics, etc.)
- Tracking tools or cookies
- External APIs or servers
- Ad networks
- Any third-party code or libraries that could collect data

## Source Code

Tab Dedup is fully open source. The complete source code is available for inspection on GitHub:

**Repository**: [https://github.com/kerryjones/tab-dedup](https://github.com/kerryjones/tab-dedup)

Anyone can verify our privacy claims by reviewing the code.

## License

This extension is licensed under the GNU General Public License v3.0, which ensures that any derivative works must also remain open source and respect user privacy. This prevents anyone from taking the code and making it proprietary with tracking.

## Data Deletion

To delete all data stored by Tab Dedup:

1. Right-click the extension icon → Options
2. Click "Reset to Defaults"
3. Or uninstall the extension from `chrome://extensions/`

All configuration data will be permanently deleted.

## Children's Privacy

Tab Dedup does not knowingly collect any information from anyone, including children under 13. Since we collect no data at all, there are no special considerations for children's privacy.

## Changes to This Policy

Any changes to this privacy policy will be:
- Posted in this document on GitHub
- Updated in the Chrome Web Store listing
- Reflected in the extension version notes

We will update the "Last updated" date at the top of this document.

## International Users

Tab Dedup processes all data locally on your device. There is no server-side processing, so there are no international data transfers.

If you use Chrome Sync, your settings are synced through Google's infrastructure according to [Google's Privacy Policy](https://policies.google.com/privacy).

## Your Rights

Since Tab Dedup collects no personal data, there is no personal data to:
- Access
- Correct
- Delete
- Export
- Object to processing of

Your configuration settings are entirely under your control and can be modified or deleted at any time through the extension's settings page.

## Contact

For privacy concerns, questions, or to report privacy issues:

- **GitHub Issues**: [https://github.com/kerryjones/tab-dedup/issues](https://github.com/kerryjones/tab-dedup/issues)
- **Email**: Create an issue on GitHub (we don't collect email addresses)

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) - by collecting no personal data
- California Consumer Privacy Act (CCPA) - by collecting no personal data

## Summary

**Tab Dedup is privacy-first by design:**
- ✅ No data collection
- ✅ No external servers
- ✅ No tracking or analytics
- ✅ Open source and auditable
- ✅ Local processing only

Your browsing activity is your business, not ours.
