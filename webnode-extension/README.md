# OpenMina Chrome Extension MVP

## Phase 1: Testing Cross-Origin Isolation

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `webnode-extension` directory
4. The extension should appear in the extensions list

### Testing Cross-Origin Isolation

1. Click the OpenMina extension icon in the toolbar to open the sidebar
2. Open Chrome DevTools (F12)
3. Check the Console tab for messages from the offscreen document
4. Look for either:
   - ✅ "SUCCESS: Offscreen document IS cross-origin isolated"
   - ❌ "CRITICAL FAILURE: Offscreen document IS NOT cross-origin isolated"

### Expected Behavior

- The sidebar should show "Status: Offscreen ready & isolated." if COI is working
- The console should show successful cross-origin isolation
- If COI fails, the status will show an error message

### Next Steps

Once Phase 1 is confirmed working (cross-origin isolation verified), we'll proceed to Phase 2 with the bundled WASM loading strategy.

## File Structure

```
webnode-extension/
├── manifest.json          # Extension manifest with COOP/COEP
├── sidebar.html           # Sidebar UI
├── sidebar.js             # Sidebar logic
├── background.js          # Service worker
├── offscreen.html         # Offscreen document with COI headers
├── offscreen.js           # Phase 1: COI verification
└── README.md             # This file
```
