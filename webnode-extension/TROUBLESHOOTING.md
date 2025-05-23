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

### Issue 2: WASM Thread Detection Error ⚠️ IN PROGRESS

**Error**: `RuntimeError: unreachable` in `is_web_worker_thread` and `main_thread_init`

**Root Cause**: OpenMina WASM module has automatic initialization that tries to detect thread context, but fails in Chrome extension environment.

**Current Approach**: 
1. Set `globalThis.crossOriginIsolated = false` to indicate no threading
2. Only initialize WASM in background service worker (not popup)
3. Use basic `init()` call without custom memory configuration

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

## Status

- ✅ CSP violations fixed
- ⚠️ WASM thread detection error in progress
- 🔄 Testing environment setup approach
- 📋 Ready to try alternative solutions if needed

The extension architecture is sound, but the OpenMina WASM module needs proper environment setup or modification for Chrome extension compatibility.
