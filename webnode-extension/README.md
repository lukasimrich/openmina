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

### Phase 2: OpenMina WASM Integration ✅ COMPLETE
- [x] Create WASM build script with proper configuration
- [x] Add circuit blob download script and file structure
- [x] Implement OpenMina-specific configuration loading
- [x] Handle "cursed hack" errors as expected behavior
- [x] Add status monitoring and RPC interface
- [x] Enhanced error handling and user feedback

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

## Quick Start

1. **Download Circuit Blobs**: `./download-circuit-blobs.sh`
2. **Build WASM Module**: `./build-wasm.sh`
3. **Load Extension**: Load unpacked extension in Chrome
4. **Test Node**: Click "Start Node" and monitor console logs

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development workflow, debugging tips, and advanced configuration options.

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
