# Next Agent Investigation Guide: OpenMina WASM Thread Detection

**Priority**: CRITICAL BLOCKER  
**Required Expertise**: Rust, WASM, wasm-bindgen, Chrome Extensions  
**Estimated Effort**: 2-4 hours investigation + implementation

## Problem Statement

OpenMina WASM fails with `RuntimeError: unreachable` in `is_web_worker_thread()` function across all Chrome extension execution contexts, preventing node initialization.

## Investigation Steps

### 1. Analyze WASM Thread Detection Logic

**Objective**: Understand how OpenMina detects execution context

**Actions**:
```bash
# If you have access to OpenMina source code:
1. Find `wasm_thread::wasm32::utils::is_web_worker_thread` implementation
2. Identify browser APIs it depends on
3. Check for assumptions about global objects

# Key questions:
- Does it check `self.importScripts`?
- Does it rely on `window` vs `self` globals?
- Does it use `WorkerGlobalScope` detection?
- Are there Chrome extension-specific global differences?
```

### 2. Compare Extension vs Web Page Globals

**Objective**: Identify missing/different APIs in extension context

**Test Script** (add to webnode.js):
```javascript
// Add this diagnostic function
function compareGlobals() {
  console.log('=== GLOBAL OBJECT ANALYSIS ===');
  console.log('typeof window:', typeof window);
  console.log('typeof self:', typeof self);
  console.log('typeof globalThis:', typeof globalThis);
  console.log('typeof importScripts:', typeof importScripts);
  console.log('typeof WorkerGlobalScope:', typeof WorkerGlobalScope);
  console.log('typeof DedicatedWorkerGlobalScope:', typeof DedicatedWorkerGlobalScope);
  console.log('self === window:', self === window);
  console.log('self.constructor.name:', self.constructor.name);
  console.log('Available on self:', Object.getOwnPropertyNames(self).filter(name => name.includes('Worker')));
}
```

### 3. Test in Different Contexts

**Objective**: Confirm behavior across contexts

**Test Matrix**:
- Regular web page (working Angular frontend)
- Chrome extension main thread
- Chrome extension offscreen document  
- Chrome extension dedicated worker
- Chrome extension service worker (if applicable)

### 4. Examine wasm-bindgen Threading

**Objective**: Understand wasm-bindgen's thread detection mechanism

**Research Areas**:
- wasm-bindgen documentation on threading
- `wasm_thread` crate implementation
- Browser compatibility requirements
- Known issues with Chrome extensions

### 5. Potential Workarounds

**Option A: Polyfill Missing APIs**
```javascript
// In worker context, add missing globals if needed
if (typeof importScripts === 'undefined') {
  self.importScripts = function() {
    console.log('Polyfilled importScripts called');
  };
}
```

**Option B: Force Thread Context**
```javascript
// Try to convince WASM it's in the right context
if (typeof DedicatedWorkerGlobalScope === 'undefined') {
  self.DedicatedWorkerGlobalScope = function() {};
}
```

**Option C: Single-Threaded Mode**
- Research if OpenMina supports single-threaded execution
- Check for configuration flags to disable threading

## Debugging Tools

### 1. Enhanced Error Logging

Add to `webnode-worker.js`:
```javascript
// Catch and analyze the exact failure point
try {
  await wasmModule.default();
} catch (error) {
  console.error('WASM Init Error Details:');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Try to get more WASM-specific info
  if (error.stack.includes('wasm')) {
    console.error('WASM-related error detected');
    // Add WASM memory inspection if possible
  }
}
```

### 2. WASM Memory Inspection

```javascript
// After WASM loads but before init
console.log('WASM Module exports:', Object.keys(wasmModule));
console.log('WASM Memory:', wasmModule.memory);
```

### 3. Browser Compatibility Check

```javascript
// Check for Chrome extension specific limitations
console.log('Chrome extension context checks:');
console.log('chrome.runtime available:', typeof chrome !== 'undefined' && chrome.runtime);
console.log('Extension ID:', chrome?.runtime?.id);
console.log('Extension context type:', chrome?.runtime?.getContexts ? 'MV3' : 'MV2');
```

## Expected Outcomes

### Success Criteria
1. **Root Cause Identified**: Specific API/global missing in extension context
2. **Workaround Implemented**: WASM initializes without "unreachable" error
3. **Node Starts**: OpenMina node successfully initializes and connects to network

### Fallback Options
1. **Single-Threaded Mode**: If threading can be disabled
2. **Native Messaging**: Move OpenMina execution outside browser
3. **Alternative WASM Build**: Request OpenMina team for extension-compatible build

## Resources

### Documentation
- [wasm-bindgen threading](https://rustwasm.github.io/wasm-bindgen/examples/wasm-in-web-workers.html)
- [Chrome Extension Contexts](https://developer.chrome.com/docs/extensions/mv3/architecture-overview/)
- [WebAssembly Threading](https://web.dev/webassembly-threads/)

### Test Environment
- Extension already loaded and functional
- All infrastructure in place
- Detailed error logs available
- Working Angular frontend for comparison

### Key Files
- `openmina-extension/webnode-worker.js` - Current worker implementation
- `openmina-extension/assets/webnode/pkg/` - WASM files
- `memory-bank/critical-blocker-analysis.md` - Detailed error analysis

**Start with step 1 (WASM source analysis) as it's most likely to reveal the root cause.**
