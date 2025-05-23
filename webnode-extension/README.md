# OpenMina Chrome Extension - Kaspa NG Pattern Implementation

## Overview

This Chrome extension implements the OpenMina blockchain node using the proven Kaspa NG pattern, eliminating complex bundling and offscreen document approaches in favor of direct WASM loading.

## Key Features

- **Direct WASM Loading**: No complex bundling required
- **Popup UI**: Clean, simple interface following Kaspa NG design
- **Critical CSP Directive**: `'wasm-unsafe-eval'` enables WASM loading in Chrome MV3
- **Background Service Worker**: Handles node initialization and management
- **No Cross-Origin Isolation**: Simplified architecture without complex isolation requirements

## Installation

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `webnode-extension` directory
4. The extension should appear in the extensions list

### Testing the Extension

1. Click the OpenMina extension icon in the toolbar to open the popup
2. Click "Start Node" to initialize the OpenMina WASM module
3. Open Chrome DevTools (F12) to monitor console output
4. Use "Get Status" button to query node status

### Expected Behavior

- The popup should show "Node Idle" initially
- After clicking "Start Node", status should change to "Initializing..."
- Once initialized, status should show "Running" with peer count
- Console should show WASM module loading and node initialization messages

## Current Implementation Status

### Phase 1: Foundation Setup ✅
- [x] Manifest.json with Kaspa NG CSP configuration
- [x] Background service worker with direct WASM loading
- [x] Popup UI with clean interface
- [x] Basic message passing between components

### Phase 2: OpenMina WASM Integration (Next)
- [ ] Compile OpenMina WASM with proper configuration
- [ ] Add circuit blob files and supporting resources
- [ ] Implement OpenMina-specific configuration loading
- [ ] Handle "cursed hack" errors as expected behavior

### Phase 3: Threading Support (Conditional)
- [ ] Add cross-origin isolation if threading is required
- [ ] Implement SharedArrayBuffer support
- [ ] Enable worker threads for full node functionality

## File Structure

```
webnode-extension/
├── manifest.json          # Chrome extension manifest with Kaspa NG CSP
├── background.js          # Service worker with direct WASM loading
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic and local WASM instance
├── README.md              # This file
└── [Legacy files - to be removed]
    ├── sidebar.html       # Old sidebar approach
    ├── sidebar.js         # Old sidebar logic
    ├── offscreen.html     # Old offscreen document
    └── offscreen.js       # Old offscreen logic
```

## Next Steps

1. **Compile OpenMina WASM**: Build the WASM module with proper configuration
2. **Add Supporting Files**: Include circuit blobs, worker snippets, and configuration
3. **Test Basic Loading**: Verify WASM loads without CSP violations
4. **Implement Node Lifecycle**: Follow OpenMina webnode patterns for initialization

## Troubleshooting

### Common Issues

1. **CSP Violations**: Ensure `'wasm-unsafe-eval'` is in the manifest CSP directive
2. **Module Loading Errors**: Check that background.js has `"type": "module"` in manifest
3. **WASM Not Found**: Verify WASM files are in web_accessible_resources
4. **"Cursed Hack" Errors**: These are expected from OpenMina worker management

### Debug Tips

- Open Chrome DevTools and check Console for detailed error messages
- Use Network tab to verify WASM file loading
- Check Extension service worker logs in chrome://extensions/
- Monitor popup console for UI-specific issues
