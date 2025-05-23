OpenMina Chrome Extension: Kaspa NG-Inspired Implementation Plan

## Overarching Goal

Achieve a functional Chrome extension capable of loading and initializing the OpenMina WASM node using proven patterns from the Kaspa NG Chrome extension. Basic interaction (e.g., fetching node status) should be possible.

## Architectural Paradigm Shift

**CRITICAL DECISION**: After analyzing the successful Kaspa NG Chrome extension implementation, we are abandoning the complex bundling/offscreen document approach in favor of the proven Kaspa NG patterns.

### Key Insights from Kaspa NG Analysis

1. **Direct WASM Loading**: No complex bundling required - ES module imports work directly
2. **No Offscreen Document**: WASM loads successfully in background service worker and popup
3. **Critical CSP Directive**: `'wasm-unsafe-eval'` is essential for Chrome MV3 WASM loading
4. **Simplified Architecture**: Background worker + popup pattern, no complex isolation requirements

## Core Principles (Proven Pattern Focus)

### Follow Proven Patterns

All architectural decisions follow the successful Kaspa NG implementation patterns, eliminating experimental approaches.

### Minimal Viable Implementation

-   Start with Kaspa NG's exact manifest configuration
-   Use their direct WASM loading approach
-   Implement their background + popup communication pattern
-   Add OpenMina-specific configuration incrementally

### YAGNI Applied to Architecture

-   No complex bundling unless proven necessary
-   No offscreen documents unless threading absolutely requires it
-   No custom WASM runtime implementations
-   No manual module resolution systems

### Leverage Kaspa NG Success

-   Copy their manifest.json CSP configuration exactly
-   Follow their WASM initialization patterns
-   Use their message passing architecture
-   Adapt their error handling approaches

## Implementation Phases (Kaspa NG Pattern)

### Phase 1: Foundation Setup (Direct WASM Loading)

**Objective**: Establish basic Chrome extension structure following Kaspa NG patterns with direct WASM loading.

**Key Changes from Previous Approach**:

-   **No offscreen document** - WASM loads directly in background and popup
-   **No complex bundling** - Use standard ES module imports
-   **Popup instead of sidebar** - Following Kaspa NG UI pattern
-   **Critical CSP directive** - `'wasm-unsafe-eval'` enables WASM loading

#### manifest.json (Kaspa NG Pattern)

```json
{
    "manifest_version": 3,
    "name": "OpenMina Node",
    "version": "0.1.0",
    "description": "OpenMina blockchain node in browser",

    "permissions": ["scripting", "alarms", "storage", "activeTab"],
    "host_permissions": ["https://*/*", "http://*/*"],

    "content_security_policy": {
        "extension_pages": "default-src 'self' 'wasm-unsafe-eval'; connect-src 'self' *"
    },

    "background": {
        "service_worker": "background.js",
        "type": "module"
    },

    "action": {
        "default_popup": "popup.html",
        "default_title": "OpenMina Node"
    },

    "web_accessible_resources": [
        {
            "resources": ["openmina_node_web.js", "openmina_node_web_bg.wasm", "snippets/*"],
            "matches": ["<all_urls>"]
        }
    ]
}
```

#### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│  Background.js  │    │    Popup.js     │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ WASM Module │ │◄──►│ │ WASM Module │ │
│ │   (Node)    │ │    │ │    (UI)     │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
```

### Phase 2: OpenMina WASM Integration

**Objective**: Integrate OpenMina-specific WASM compilation and loading following the webnode lifecycle.

#### WASM Compilation (OpenMina Specific)

```bash
# Build OpenMina WASM with proper configuration
cd node/web
cargo +nightly build --release --target wasm32-unknown-unknown

# Generate JavaScript bindings with --target web (like Kaspa NG)
wasm-bindgen --target web --keep-debug \
  --out-dir ../../extension/ \
  ../../target/wasm32-unknown-unknown/release/openmina_node_web.wasm
```

#### Integration with OpenMina Lifecycle

Following the documented OpenMina webnode patterns:

1. **WASM Loading**: Direct ES module import (like Kaspa NG)
2. **Configuration**: Load from web-node-secrets.json
3. **Node Setup**: Call `wasm.run()` with OpenMina parameters
4. **RPC Interface**: Store returned RPC interface for status queries
5. **Worker Management**: Handle "cursed hack" errors as expected behavior

#### Required Supporting Files

```
extension/
├── manifest.json
├── background.js                 # Service worker with WASM
├── popup.html                    # Extension popup UI
├── popup.js                      # Popup logic
├── openmina_node_web.js          # Generated JS bindings
├── openmina_node_web_bg.wasm     # WASM binary
├── snippets/                     # Worker thread snippets
│   ├── wasm_thread-*/worker.js
│   └── p2p-*/worker.js
├── circuit-blobs/                # OpenMina verification files
│   └── 3.0.1devnet/
│       ├── block_verifier_index.postcard
│       └── transaction_verifier_index.postcard
└── config/
    └── web-node-secrets.json
```

### Phase 3: Threading Support (Conditional)

**Objective**: Enable WebAssembly threading only if required for full functionality.

**Strategy**: Start without threading, add incrementally if needed.

#### Threading Detection

```javascript
function checkThreadingSupport() {
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined"
    const isCrossOriginIsolated = window.crossOriginIsolated

    return hasSharedArrayBuffer && isCrossOriginIsolated
}
```

#### Cross-Origin Isolation (Only if Threading Required)

```json
// manifest.json additions (conditional)
{
    "cross_origin_opener_policy": { "value": "same-origin" },
    "cross_origin_embedder_policy": { "value": "require-corp" }
}
```

## Technical Constraints & Standards

### Chrome MV3 Requirements

-   **CSP Directive**: `'wasm-unsafe-eval'` is mandatory for WASM loading
-   **Module Type**: Background service worker must be `"type": "module"`
-   **Web Accessible Resources**: WASM files must be accessible to extension pages

### OpenMina Integration Points

-   **WASM Compilation**: Use `--target web` for proper module semantics
-   **Configuration**: Load from `web-node-secrets.json` following webnode lifecycle
-   **RPC Interface**: Use returned interface from `wasm.run()` for status queries
-   **Worker Management**: Handle "cursed hack" errors as expected behavior

### Success Criteria

#### Phase 1 Success Metrics

-   [ ] Extension loads without CSP violations
-   [ ] WASM module initializes successfully in background
-   [ ] Popup UI displays and communicates with background
-   [ ] Basic message passing works between components

#### Phase 2 Success Metrics

-   [ ] OpenMina WASM compiles with proper configuration
-   [ ] Node initialization completes without errors
-   [ ] RPC interface returns valid status data
-   [ ] Circuit blobs and supporting files load correctly

#### Phase 3 Success Metrics (If Threading Required)

-   [ ] Cross-origin isolation achieved when needed
-   [ ] SharedArrayBuffer available for threading
-   [ ] Worker threads function correctly
-   [ ] Full node synchronization works

## Benefits of Kaspa NG Pattern

✅ **Eliminates Complex Bundling**: No Rollup, no module resolution issues
✅ **Removes Offscreen Document**: Simpler architecture, fewer moving parts
✅ **Proven in Production**: Kaspa NG successfully runs blockchain WASM
✅ **Direct WASM Loading**: Standard ES module imports work reliably
✅ **Simplified Debugging**: Fewer abstraction layers to troubleshoot
✅ **Faster Development**: Start with working foundation, add features incrementally

## Risk Mitigation

### Known Challenges

1. **"Cursed Hack" Errors**: Expected behavior from OpenMina worker management
2. **Circuit Blob Loading**: Ensure all required verification files are present
3. **Worker Snippet Paths**: Verify snippet directory structure matches expectations
4. **Memory Limits**: Monitor WASM memory usage during node operation

### Fallback Strategies

1. **Threading Issues**: Start without threading, add only if absolutely required
2. **WASM Loading Failures**: Detailed error logging and user feedback
3. **Network Connectivity**: Graceful handling of seed node connection failures
4. **Resource Loading**: Retry mechanisms for circuit blobs and configuration files

This approach follows the proven Kaspa NG pattern, eliminating the complex experimental approaches in favor of a working foundation.
