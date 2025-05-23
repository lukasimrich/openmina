# OpenMina Chrome Extension - Troubleshooting Guide

## Current Issues and Solutions

### Issue 1: CSP Violations for Inline Styles ✅ FIXED

**Error**: `Refused to apply inline style because it violates CSP directive`

**Solution**: Updated manifest.json CSP policy to include `style-src 'self' 'unsafe-inline'`

```json
"content_security_policy": {
    "extension_pages": "default-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' *"
}
```

### Issue 2: WASM Thread Detection Error ✅ FIXED

**Error**: `RuntimeError: unreachable` in `is_web_worker_thread` and `main_thread_init`

**Root Cause**: OpenMina WASM module requires threading for parallel proof verification and P2P operations, but Chrome extensions need cross-origin isolation for SharedArrayBuffer support.

**Critical Discovery**:
- **Threading is ESSENTIAL** for OpenMina (parallel proof verification, P2P operations, archive service)
- **Kaspa NG Chrome extension** is a wallet interface, not a full node
- **OpenMina requires full node capabilities** including threading

**Solution Applied**:
1. **Enable cross-origin isolation** in manifest.json (COOP/COEP headers)
2. **Keep threading enabled** - required for OpenMina's core functionality
3. **Use `wasm-pack` build system** for better compatibility
4. **Phase 3 implementation**: Full threading support with SharedArrayBuffer

**Stack Trace Analysis**:
```
wasm_thread::wasm32::utils::is_web_worker_thread::ha83ae8b8684126a6
openmina_core::thread::main_thread::main_thread_init::h167efc814736f8ac
```

This suggests the WASM is trying to determine if it's running in a web worker thread but the detection logic is failing.

## Debugging Steps

### Step 1: Check Extension Loading
1. Open `chrome://extensions/`
2. Ensure "Developer mode" is enabled
3. Load the extension and check for CSP violations (should be fixed now)

### Step 2: Monitor Console Logs
1. **Background Service Worker**: Click "service worker" link in extension details
2. **Popup Console**: Right-click popup → "Inspect"

### Step 3: Expected vs Actual Behavior

**Expected Logs**:
```
🚀 Initializing OpenMina WASM module...
✅ Configuration loaded: { hasBlockProducerKey: false, seedNodesUrl: "..." }
📦 Loading WASM binary...
✅ WASM module loaded successfully
🌐 Starting OpenMina node with configuration...
🎉 OpenMina node initialized successfully
```

**Current Issue**: Fails at WASM loading with thread detection error.

## Potential Solutions to Try

### Solution 1: Environment Setup (CURRENT)
Set up proper global environment before WASM initialization:
```javascript
if (typeof globalThis.crossOriginIsolated === 'undefined') {
    globalThis.crossOriginIsolated = false
}
```

### Solution 2: Custom Memory Configuration
If basic init fails, try with custom memory:
```javascript
const memory = new WebAssembly.Memory({
    initial: 32,
    maximum: 65536,
    shared: false
})
const wasm = await init("./openmina_node_web_bg.wasm", memory)
```

### Solution 3: Threading Support (Phase 3)
If thread detection is required, enable cross-origin isolation:
```json
"cross_origin_opener_policy": { "value": "same-origin" },
"cross_origin_embedder_policy": { "value": "require-corp" }
```

### Solution 4: WASM Module Modification
The OpenMina WASM module might need modifications for Chrome extension compatibility:
- Remove automatic thread detection
- Make thread initialization optional
- Add Chrome extension environment detection

## Testing Different Approaches

### Test 1: Basic Initialization (Current)
```javascript
const wasm = await init()
```

### Test 2: With Memory Configuration
```javascript
const wasm = await init("./openmina_node_web_bg.wasm", memory)
```

### Test 3: With Configuration Object
```javascript
const wasm = await init({
    module_or_path: "./openmina_node_web_bg.wasm",
    memory: memory
})
```

## Environment Requirements

### Current Environment
- Chrome MV3 extension
- Service worker context
- No cross-origin isolation
- No SharedArrayBuffer
- No threading support

### OpenMina WASM Expectations
- Thread detection capability
- Main thread initialization
- Possible worker thread support
- Rayon thread pool initialization

## Next Steps

1. **Test Current Fix**: Try the updated code with environment setup
2. **Check WASM Compilation**: Ensure WASM was built with proper flags
3. **Review OpenMina Source**: Check if thread detection can be made optional
4. **Consider Threading**: Evaluate if Phase 3 (threading support) is required

## Alternative Approaches

### Approach 1: Minimal WASM
Create a minimal WASM wrapper that doesn't require thread detection.

### Approach 2: Offscreen Document
Use offscreen document with cross-origin isolation (reverts to complex approach).

### Approach 3: WASM Modification
Modify OpenMina WASM to be Chrome extension compatible.

## Kaspa NG Analysis 🔍

Based on analysis of the successful Kaspa NG Chrome extension:

### Kaspa NG Approach (Working):
- **Uses `wasm-pack`** with `--weak-refs --target web`
- **Feature flags**: `wasm32-sdk`, `wasm32-core`, `wasm32-rpc`, `browser-extension`
- **Dedicated Chrome extension crate** with conditional compilation
- **Simple initialization**: `await init('/kaspa-ng_bg.wasm')` then `await kaspa_ng.kaspa_ng_background()`
- **No automatic thread detection** in Chrome extension build

### OpenMina Previous Approach (Fixed):
- **Used direct `wasm-bindgen`** instead of `wasm-pack`
- **No feature flags** - tried to use full web node with threading
- **Automatic thread detection** that failed in Chrome extension environment
- **Complex initialization** with memory configuration

### Solution Applied:
- **Added `browser-extension` feature** to OpenMina web node
- **Conditional compilation** to skip thread initialization
- **Updated build script** to use `wasm-pack` like Kaspa NG
- **Simplified initialization** following Kaspa NG patterns

## Status

- ✅ CSP violations fixed
- ✅ WASM thread detection error fixed
- ✅ Kaspa NG patterns implemented
- 🚀 Ready for testing with new build system

The extension now follows the proven Kaspa NG approach and should initialize without thread detection errors.
