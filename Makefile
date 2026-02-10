# Tab Dedup - Makefile
# Simple automation for common development tasks

VERSION := $(shell grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
PACKAGE_NAME := tab-dedup-v$(VERSION).zip

# Default target - show available commands
.PHONY: help
help:
	@echo "Tab Dedup - Available Commands"
	@echo ""
	@echo "  make package    - Create Chrome Web Store package ($(PACKAGE_NAME))"
	@echo "  make clean      - Remove build artifacts and packages"
	@echo "  make validate   - Validate manifest.json"
	@echo "  make install    - Install extension in Chrome (show instructions)"
	@echo "  make version    - Show current version"
	@echo ""

# Package extension for Chrome Web Store
.PHONY: package
package: clean validate
	@echo "📦 Packaging Tab Dedup v$(VERSION)..."
	@zip -r $(PACKAGE_NAME) . \
		-x "*.git*" \
		-x "*.DS_Store" \
		-x "node_modules/*" \
		-x "Makefile" \
		-x "PUBLISHING.md" \
		-x "CLAUDE.md" \
		-x "PRIVACY.md" \
		-x "screenshots/*" \
		-x "icons/ICON_REQUIREMENTS.md" \
		-x "*.zip" \
		> /dev/null
	@echo "✅ Package created: $(PACKAGE_NAME)"
	@echo ""
	@unzip -l $(PACKAGE_NAME) | head -20
	@echo "..."
	@echo ""
	@echo "📊 Package size: $$(du -h $(PACKAGE_NAME) | cut -f1)"
	@echo "📁 Total files: $$(unzip -l $(PACKAGE_NAME) | tail -1 | awk '{print $$2}')"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -f *.zip
	@echo "✅ Clean complete"

# Validate manifest.json
.PHONY: validate
validate:
	@echo "🔍 Validating manifest.json..."
	@if ! command -v jq > /dev/null 2>&1; then \
		echo "⚠️  jq not installed, skipping JSON validation"; \
		echo "   Install with: brew install jq"; \
	else \
		jq empty manifest.json && echo "✅ manifest.json is valid JSON"; \
	fi
	@if [ ! -f "icons/icon16.png" ]; then \
		echo "⚠️  Warning: icons/icon16.png not found"; \
	fi
	@if [ ! -f "icons/icon48.png" ]; then \
		echo "⚠️  Warning: icons/icon48.png not found"; \
	fi
	@if [ ! -f "icons/icon128.png" ]; then \
		echo "⚠️  Warning: icons/icon128.png not found"; \
	fi
	@if [ -f "icons/icon16.png" ] && [ -f "icons/icon48.png" ] && [ -f "icons/icon128.png" ]; then \
		echo "✅ All required icons present"; \
	fi

# Show installation instructions
.PHONY: install
install:
	@echo "📥 To install Tab Dedup in Chrome:"
	@echo ""
	@echo "1. Open Chrome and go to: chrome://extensions/"
	@echo "2. Enable 'Developer mode' (toggle in top right)"
	@echo "3. Click 'Load unpacked'"
	@echo "4. Select this directory: $$(pwd)"
	@echo ""
	@echo "To reload after changes:"
	@echo "  Click the refresh icon on the extension card"
	@echo ""

# Show current version
.PHONY: version
version:
	@echo "Tab Dedup v$(VERSION)"

# Development workflow - validate and show install instructions
.PHONY: dev
dev: validate install
