# OpenMina Chrome Extension: Critical Blocker Analysis

**Last Updated**: December 19, 2024  
**Status**: BLOCKED - Fundamental WASM incompatibility identified  
**Next Agent**: Needs deep WASM/Rust expertise for thread detection analysis

## Executive Summary

The OpenMina Chrome extension implementation has reached a **critical blocker**. Despite successfully implementing:
- ✅ Cross-origin isolation (COI Service Worker)
- ✅ Content Security Policy with `'wasm-unsafe-eval'`
- ✅ SharedArrayBuffer availability
- ✅ WASM module loading and compilation

**The OpenMina WASM consistently fails with `RuntimeError: unreachable` in thread detection logic across ALL execution contexts.**

## Critical Error Details

### Error Signature
```
RuntimeError: unreachable
    at openmina_node_web.wasm.wasm_thread::wasm32::utils::is_web_worker_thread::h233487740e01a168
    at openmina_node_web.wasm.openmina_core::thread::main_thread::main_thread_init::h988e244f4ad980b7
```

### Failure Points
1. **WASM Initialization**: `wasm.default()` call fails during thread detection
2. **Node Spawning**: `wasm.run()` call fails when trying to spawn worker threads

### Tested Execution Contexts

| Context | Cross-Origin Isolated | SharedArrayBuffer | WASM Loads | Thread Detection | Result |
|---------|----------------------|-------------------|------------|------------------|---------|
| Main Thread | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Fails | `unreachable` |
| Offscreen Document | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Fails | `unreachable` |
| Dedicated Worker | ✅ Yes | ✅ Yes | ✅ Yes | ❌ Fails | `unreachable` |

## Technical Analysis

### What Works
- **CSP Configuration**: `script-src 'self' 'wasm-unsafe-eval'` allows WASM compilation
- **Cross-Origin Isolation**: `self.crossOriginIsolated === true` in all contexts
- **WASM Loading**: Dynamic imports and module instantiation succeed
- **Memory Configuration**: Both default and custom memory configurations tested

### What Fails
- **Thread Detection Logic**: `is_web_worker_thread()` function in OpenMina WASM
- **Context Recognition**: WASM cannot determine if it's in main thread or worker
- **Thread Spawning**: Subsequent worker creation fails with same error

### Root Cause Hypothesis
OpenMina's thread detection logic (`wasm_thread::wasm32::utils::is_web_worker_thread`) appears to be **incompatible with Chrome extension execution contexts**. The function likely relies on browser APIs or global objects that are:
1. **Missing** in Chrome extension contexts
2. **Modified** by Chrome's extension security model
3. **Restricted** by Chrome MV3 limitations

## Implementation Status

### Completed Components
- **Extension Structure**: Manifest, background script, popup, sidebar
- **COI Service Worker**: Injects COOP/COEP headers for cross-origin isolation
- **WASM Assets**: Complete OpenMina asset integration (47MB+ of files)
- **Loading Mechanism**: Replicates exact Angular frontend pattern
- **Worker Implementation**: Dedicated worker for WASM execution
- **Diagnostics**: Comprehensive logging and environment checking

### File Structure
```
openmina-extension/
├── manifest.json (with CSP and COOP/COEP)
├── background.js (tab lifecycle management)
├── popup.html/js (sidebar interface)
├── webnode.html (main node interface)
├── webnode.js (main thread logic)
├── webnode-worker.js (dedicated worker)
├── coi-serviceworker.js (cross-origin isolation)
└── assets/webnode/ (complete OpenMina WASM assets)
```

## Next Steps for Resolution

### Immediate Investigation Required
1. **WASM Source Analysis**: Examine `wasm_thread::wasm32::utils::is_web_worker_thread` implementation
2. **Browser API Dependencies**: Identify what browser APIs the thread detection relies on
3. **Extension Context Differences**: Compare Chrome extension globals vs regular web page globals
4. **Alternative Thread Detection**: Explore if OpenMina can use different thread detection logic

### Potential Solutions
1. **WASM Patching**: Modify OpenMina WASM to use extension-compatible thread detection
2. **Polyfill Approach**: Provide missing browser APIs in extension context
3. **Single-Threaded Mode**: Configure OpenMina to run without worker threads (if possible)
4. **Native Messaging**: Use Chrome extension native messaging to run OpenMina outside browser

### Required Expertise
- **Rust/WASM**: Understanding of wasm-bindgen threading and browser detection
- **Chrome Extensions**: Deep knowledge of MV3 execution contexts and limitations
- **OpenMina Internals**: Familiarity with OpenMina's threading architecture

## Handoff Information

### Current State
- Extension loads and creates tabs successfully
- Cross-origin isolation and CSP working correctly
- WASM assets integrated and accessible
- All infrastructure ready for node execution

### Blocker Location
- File: `assets/webnode/pkg/openmina_node_web_bg.wasm`
- Function: `wasm_thread::wasm32::utils::is_web_worker_thread`
- Error: `RuntimeError: unreachable`

### Test Instructions
1. Load extension in Chrome
2. Click extension icon → Start Node
3. Monitor console for detailed error logs
4. Error occurs during WASM initialization

### Key Files for Next Agent
- `memory-bank/status.md` - Current implementation status
- `memory-bank/openmina-webnode-lifecycle.md` - Working Angular frontend analysis
- `openmina-extension/webnode-worker.js` - Latest worker implementation
- Console logs show exact error stack trace

**This blocker requires deep WASM/Rust expertise to resolve the thread detection incompatibility.**
