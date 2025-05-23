# OpenMina Chrome Extension - Development Guide

## Phase 2: OpenMina WASM Integration

This guide covers the development workflow for Phase 2 of the OpenMina Chrome Extension implementation.

## 🚀 Quick Start

### Prerequisites

1. **Rust Toolchain**:
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Install nightly toolchain
   rustup toolchain install nightly
   
   # Add WASM target
   rustup target add wasm32-unknown-unknown --toolchain nightly
   ```

2. **wasm-bindgen CLI**:
   ```bash
   cargo install wasm-bindgen-cli
   ```

3. **Chrome Browser** with Developer Mode enabled

### Build and Test Workflow

1. **Download Circuit Blobs**:
   ```bash
   cd webnode-extension
   ./download-circuit-blobs.sh
   ```

2. **Build WASM Module**:
   ```bash
   ./build-wasm.sh
   ```

3. **Load Extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `webnode-extension` directory

4. **Test Extension**:
   - Click the OpenMina extension icon
   - Click "Start Node" in the popup
   - Monitor console for initialization progress
   - Use "Get Status" to query node state

## 📁 File Structure

```
webnode-extension/
├── manifest.json                 # Chrome extension manifest
├── background.js                 # Service worker with WASM loading
├── popup.html                    # Extension popup UI
├── popup.js                      # Popup logic
├── build-wasm.sh                 # WASM build script
├── download-circuit-blobs.sh     # Circuit blobs download script
├── DEVELOPMENT.md                # This file
├── README.md                     # User documentation
├── config/
│   └── web-node-secrets.json     # Node configuration
├── circuit-blobs/                # Zero-knowledge proof files
│   └── 3.0.1devnet/
│       ├── block_verifier_index.postcard
│       ├── transaction_verifier_index.postcard
│       └── ... (proving key files)
├── snippets/                     # Worker thread files (generated)
│   ├── wasm_thread-*/worker.js
│   └── p2p-*/worker.js
├── openmina_node_web.js          # Generated JS bindings
└── openmina_node_web_bg.wasm     # WASM binary
```

## 🔧 Development Features

### Enhanced Background Service Worker

- **Configuration Loading**: Loads settings from `config/web-node-secrets.json`
- **Error Handling**: Handles "cursed hack" errors as expected behavior
- **Status Monitoring**: Periodic status updates every 5 seconds
- **RPC Interface**: Full access to OpenMina node RPC methods

### Improved Popup Interface

- **Real-time Status**: Automatic updates from background monitoring
- **Detailed Metrics**: Peers, block height, sync progress
- **Error Feedback**: Clear error messages and troubleshooting hints
- **Configuration Display**: Shows loaded node configuration

### Build System

- **Automated WASM Build**: Single script builds and configures WASM
- **Circuit Blob Management**: Automated download of required verification files
- **Development Workflow**: Clear steps from build to test

## 🧪 Testing and Debugging

### Console Monitoring

1. **Extension Service Worker**:
   - Go to `chrome://extensions/`
   - Click "service worker" link for OpenMina extension
   - Monitor background script logs

2. **Popup Console**:
   - Right-click on popup → "Inspect"
   - Monitor popup-specific logs

3. **Expected Log Messages**:
   ```
   🚀 Initializing OpenMina WASM module...
   ✅ Configuration loaded: { hasBlockProducerKey: false, seedNodesUrl: "..." }
   📦 Loading WASM binary...
   ✅ WASM module loaded successfully
   🌐 Starting OpenMina node with configuration...
   🔧 Worker keep-alive hack triggered (expected behavior)
   🎉 OpenMina node initialized successfully
   📊 Node Status (timestamp): { peers: 0, blockHeight: 0, syncProgress: "0%" }
   ```

### Common Issues and Solutions

1. **WASM Loading Errors**:
   - **Issue**: `Failed to fetch openmina_node_web_bg.wasm`
   - **Solution**: Run `./build-wasm.sh` to generate WASM files

2. **Circuit Blob Errors**:
   - **Issue**: `Failed to fetch circuit blob: block_verifier_index.postcard`
   - **Solution**: Run `./download-circuit-blobs.sh` to download required files

3. **CSP Violations**:
   - **Issue**: `Refused to load the script because it violates CSP`
   - **Solution**: Ensure `'wasm-unsafe-eval'` is in manifest CSP directive

4. **"Cursed Hack" Errors**:
   - **Issue**: `Cursed hack to keep workers alive`
   - **Solution**: This is expected behavior, not an actual error

### Performance Monitoring

- **Memory Usage**: Monitor WASM memory consumption
- **Network Activity**: Check WebRTC connections to peers
- **CPU Usage**: Monitor background processing load
- **Sync Progress**: Track blockchain synchronization

## 🔄 Development Workflow

### Making Changes

1. **Code Changes**: Edit background.js, popup.js, or other files
2. **Reload Extension**: Click reload button in `chrome://extensions/`
3. **Test Changes**: Open popup and test functionality
4. **Check Logs**: Monitor console for errors or issues

### WASM Updates

1. **Modify Rust Code**: Edit files in `../../node/web/src/`
2. **Rebuild WASM**: Run `./build-wasm.sh`
3. **Reload Extension**: Refresh extension in Chrome
4. **Test Integration**: Verify WASM changes work correctly

### Configuration Updates

1. **Edit Config**: Modify `config/web-node-secrets.json`
2. **Reload Extension**: Refresh extension in Chrome
3. **Test Config**: Verify new settings are loaded

## 📊 Status Monitoring

The extension provides detailed status monitoring:

### Background Monitoring
- Automatic status updates every 5 seconds
- Peer connection tracking
- Block height monitoring
- Sync progress calculation

### Popup Display
- Real-time peer count
- Current block height
- Synchronization percentage
- Last update timestamp

### RPC Interface
- Full access to OpenMina node status
- Transaction pool information
- Network state details
- Block production metrics

## 🚀 Next Steps (Phase 3)

If threading support is required:

1. **Threading Detection**: Check for SharedArrayBuffer support
2. **Cross-Origin Isolation**: Add COOP/COEP headers if needed
3. **Worker Thread Support**: Enable full multi-threading
4. **Performance Optimization**: Optimize for full node operation

## 📚 References

- **OpenMina Webnode Lifecycle**: `../memory-bank/openmina-webnode-lifecycle.md`
- **Kaspa NG Implementation**: Proven pattern we're following
- **Chrome Extension MV3**: Official Chrome extension documentation
- **WebAssembly**: MDN WebAssembly documentation

## 🤝 Contributing

1. Follow the established Kaspa NG pattern
2. Test all changes thoroughly
3. Update documentation for new features
4. Monitor console logs for issues
5. Ensure compatibility with Chrome MV3 restrictions
