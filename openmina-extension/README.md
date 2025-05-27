# OpenMina Chrome Extension

A Chrome extension that runs the OpenMina blockchain node in a new tab with full cross-origin isolation support.

## Architecture

This extension uses the **New Tab Approach** to provide full cross-origin isolation and SharedArrayBuffer support for OpenMina's threaded WASM implementation.

### Components

- **Extension Popup** (`popup.html`, `popup.js`): User interface for controlling the node
- **Background Service Worker** (`background.js`): Tab lifecycle management and communication
- **WebNode Tab** (`webnode.html`, `webnode.js`): The actual OpenMina node environment
- **OpenMina Assets** (`assets/webnode/`): Complete OpenMina WASM and circuit files

### Key Features

- ✅ **Full Cross-Origin Isolation**: Via manifest COOP/COEP headers
- ✅ **SharedArrayBuffer Support**: Enables OpenMina threading
- ✅ **Tab Auto-Recovery**: Automatically restarts if tab is accidentally closed
- ✅ **Real-time Status**: Live updates of peers, block height, and sync progress
- ✅ **Tab Protection**: Warns user before closing the node tab

## Installation

1. Copy OpenMina assets to `assets/webnode/` directory
2. Load the extension in Chrome Developer Mode
3. Click the extension icon to start the node

## Usage

1. **Start Node**: Click "Start Node" in the extension popup
2. **Monitor Status**: View real-time status in the popup
3. **Open Dashboard**: Click "Open Dashboard" to see detailed node information
4. **Keep Tab Open**: The node tab must remain open for the node to run

## Development Status

- ✅ Phase 1: Extension structure and new tab setup (COMPLETE)
- ⏳ Phase 2: OpenMina asset integration and loading (NEXT)
- ⏳ Phase 3: Tab lifecycle and communication polish

## Technical Details

### Cross-Origin Isolation

The extension achieves cross-origin isolation through:

```json
{
  "cross_origin_opener_policy": { "value": "same-origin" },
  "cross_origin_embedder_policy": { "value": "require-corp" }
}
```

### Asset Loading

OpenMina assets are loaded using the exact same mechanism as the working implementation:

```javascript
window.addEventListener('startWebNode', () => {
  import(chrome.runtime.getURL('assets/webnode/pkg/openmina_node_web.js'))
    .then((v) => {
      window.webnode = v;
      window.dispatchEvent(new CustomEvent('webNodeLoaded'));
    });
});
```

### Memory Configuration

The extension replicates the exact WebNodeService memory configuration:

```javascript
const memory = {
  initial: 32,    // 32 pages (2MB)
  maximum: 65536, // 65536 pages (4GB)
  shared: true    // Critical for threading
};
```

## Next Steps

1. Copy OpenMina assets from the working frontend implementation
2. Test cross-origin isolation and SharedArrayBuffer availability
3. Test WASM loading and node initialization
4. Implement state persistence and enhanced error handling
