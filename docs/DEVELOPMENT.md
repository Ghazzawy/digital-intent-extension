# Development Guide - Digital Intent Companion

## Getting Started

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `digital-intent-extension` folder
5. The extension will appear in your extensions list

### Project Structure

```
digital-intent-extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── src/
│   ├── background/        # Service worker logic
│   ├── content/           # Content scripts (run on pages)
│   ├── popup/             # Popup UI and scripts
│   └── utils/             # Shared helper functions
├── assets/                # Icons and images
├── data/                  # JSON configuration files
└── docs/                  # Documentation
```

## Key Files

- **manifest.json** - Declares extension metadata, permissions, and entry points
- **src/background/background.js** - Service worker; handles background tasks
- **src/content/content.js** - Runs on every page to collect data
- **src/popup/popup.html** - Popup interface shown when extension icon is clicked
- **src/popup/popup.css** - Popup styling
- **src/popup/popup.js** - Popup interaction logic
- **data/site-classification.json** - Site category definitions

## Manifest V3 Key Points

- Uses `service_worker` instead of `background_page`
- Permissions include `tabs`, `storage`, and host permissions
- Content scripts defined in `content_scripts` array
- Popup UI defined in `action.default_popup`

## Debugging

- Open DevTools: Right-click extension icon → "Inspect popup"
- Service worker logs: `chrome://extensions/` → Click "Inspect" under extension
- Content script logs: Open page DevTools (F12) → Check Console tab

## Making Changes

1. Edit source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Changes are live immediately

## Next Steps

- Add icons (16x16, 48x48, 128x128 PNG files) to `assets/`
- Expand site classification in `data/site-classification.json`
- Build out popup interface in `src/popup/`
- Add more content script logic as needed
