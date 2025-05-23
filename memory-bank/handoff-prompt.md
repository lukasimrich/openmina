# OpenMina Chrome Extension: Comprehensive Handoff Prompt

_Created: December 19, 2024_

## Context & Architectural Decision

You are taking over the OpenMina Chrome Extension project after a **critical architectural pivot**. The project has moved from a complex experimental approach to a proven pattern based on the successful Kaspa NG Chrome extension implementation.

### Previous Approach (Abandoned)
- Complex Rollup bundling strategy
- Offscreen document with cross-origin isolation
- Manual WASM runtime implementations
- Custom module resolution systems

### New Approach (Kaspa NG Pattern)
- **Direct WASM loading** in background service worker and popup
- **No offscreen document** complexity
- **No complex bundling** - standard ES module imports
- **Critical CSP directive**: `'wasm-unsafe-eval'` enables WASM loading
- **Popup UI** instead of sidebar (following Kaspa NG design)

## Why This Change Was Made

### Kaspa NG Analysis Revealed
1. **Proven Success**: Kaspa NG successfully runs blockchain WASM in Chrome MV3
2. **Simple Architecture**: Background worker + popup pattern works reliably
3. **Direct Loading**: No bundling complexity needed for WASM modules
4. **CSP Solution**: `'wasm-unsafe-eval'` directive solves Chrome MV3 restrictions

### Key Technical Insights
- Chrome MV3 supports direct WASM loading with proper CSP configuration
- Offscreen documents are unnecessary for basic WASM functionality
- Complex bundling strategies may be overengineering the problem
- Standard ES module imports work reliably in Chrome extensions

## Current Project State

### Memory Bank Files (CRITICAL - READ ALL)
1. **`memory-bank/kaspa-inspired-implementation-plan.md`** - Complete implementation plan following Kaspa NG patterns
2. **`memory-bank/project.md`** - Updated project overview with new architectural approach
3. **`memory-bank/status.md`** - Current task status and architectural pivot documentation
4. **`memory-bank/openmina-webnode-lifecycle.md`** - OpenMina-specific integration requirements

### Implementation Status
- **Phase 1**: Foundation setup (Not Started) - Kaspa NG pattern implementation
- **Phase 2**: OpenMina WASM integration (Not Started) - Following webnode lifecycle
- **Phase 3**: Threading support (Conditional) - Only if required

## Immediate Next Steps

### 1. Implement Kaspa NG Pattern Foundation
```json
// manifest.json - Critical CSP configuration
{
  "content_security_policy": {
    "extension_pages": "default-src 'self' 'wasm-unsafe-eval'; connect-src 'self' *"
  }
}
```

### 2. Create Basic Extension Structure
- `manifest.json` with Kaspa NG CSP configuration
- `background.js` with direct WASM loading
- `popup.html` and `popup.js` for UI
- Test basic extension loading without CSP violations

### 3. OpenMina WASM Compilation
```bash
# Following OpenMina webnode lifecycle
cd node/web
cargo +nightly build --release --target wasm32-unknown-unknown
wasm-bindgen --target web --keep-debug \
  --out-dir ../../extension/ \
  ../../target/wasm32-unknown-unknown/release/openmina_node_web.wasm
```

## Technical Requirements

### Chrome MV3 Constraints
- **CSP Directive**: `'wasm-unsafe-eval'` is mandatory for WASM loading
- **Module Type**: Background service worker must be `"type": "module"`
- **Web Accessible Resources**: WASM files must be accessible to extension pages

### OpenMina Integration Points
- **WASM Compilation**: Use `--target web` for proper module semantics
- **Configuration**: Load from `web-node-secrets.json` following webnode lifecycle
- **RPC Interface**: Use returned interface from `wasm.run()` for status queries
- **Worker Management**: Handle "cursed hack" errors as expected behavior

### File Structure Required
```
extension/
├── manifest.json                 # Chrome extension manifest
├── background.js                 # Service worker with WASM loading
├── popup.html                    # Extension popup UI
├── popup.js                      # Popup logic and local WASM
├── openmina_node_web.js          # Generated JS bindings
├── openmina_node_web_bg.wasm     # WASM binary
├── snippets/                     # Worker thread snippets
├── circuit-blobs/                # OpenMina verification files
│   └── 3.0.1devnet/
└── config/
    └── web-node-secrets.json
```

## Success Criteria

### Phase 1 Success Metrics
- [ ] Extension loads without CSP violations
- [ ] WASM module initializes successfully in background
- [ ] Popup UI displays and communicates with background
- [ ] Basic message passing works between components

### Phase 2 Success Metrics
- [ ] OpenMina WASM compiles with proper configuration
- [ ] Node initialization completes without errors
- [ ] RPC interface returns valid status data
- [ ] Circuit blobs and supporting files load correctly

### Phase 3 Success Metrics (If Threading Required)
- [ ] Cross-origin isolation achieved when needed
- [ ] SharedArrayBuffer available for threading
- [ ] Worker threads function correctly
- [ ] Full node synchronization works

## Critical Implementation Notes

### 1. Follow Kaspa NG Patterns Exactly
- Copy their manifest.json CSP configuration
- Use their direct WASM loading approach
- Implement their background + popup communication pattern
- Adapt their error handling approaches

### 2. OpenMina-Specific Considerations
- Handle "cursed hack" errors as normal operation (not actual errors)
- Ensure circuit blob files are properly loaded
- Follow webnode lifecycle for configuration and initialization
- Use OpenMina's `wasm.run()` function signature

### 3. Avoid Previous Mistakes
- Do NOT implement complex bundling unless proven necessary
- Do NOT use offscreen documents unless threading absolutely requires it
- Do NOT create custom WASM runtime implementations
- Do NOT build manual module resolution systems

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

## Development Approach

### 1. Start Simple
- Implement basic Kaspa NG pattern first
- Test each component individually
- Add OpenMina-specific features incrementally

### 2. Follow Proven Patterns
- Reference Kaspa NG implementation for guidance
- Use OpenMina webnode lifecycle documentation for integration
- Avoid experimental approaches

### 3. Test Incrementally
- Verify each phase before proceeding to the next
- Test WASM loading before adding OpenMina specifics
- Add threading support only if actually required

## Key Resources

1. **Kaspa NG Chrome Extension**: https://github.com/aspectron/kaspa-ng/tree/627bacb02fab5f382f0f4782eb77ce216cca4bc3/extensions/chrome
2. **OpenMina Webnode Lifecycle**: `memory-bank/openmina-webnode-lifecycle.md`
3. **Implementation Plan**: `memory-bank/kaspa-inspired-implementation-plan.md`
4. **Current Status**: `memory-bank/status.md`

This handoff represents a fundamental shift from complex experimental approaches to a proven, working foundation. The Kaspa NG pattern provides a clear path to success.
