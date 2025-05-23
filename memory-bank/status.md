# OpenMina Chrome Extension: MVP Implementation Status

_Last Updated: December 19, 2024_

## Current Focus

🔄 **ARCHITECTURAL PIVOT**: After analyzing the successful Kaspa NG Chrome extension implementation, we have abandoned the complex bundling/offscreen document approach in favor of the proven Kaspa NG patterns. This represents a fundamental shift from experimental approaches to a working foundation.

## Major Decision: Kaspa NG Pattern Adoption

**CRITICAL INSIGHT**: The Kaspa NG Chrome extension successfully runs blockchain WASM in Chrome MV3 using:

-   Direct WASM loading in background service worker and popup
-   No offscreen document complexity
-   No complex bundling requirements
-   Critical `'wasm-unsafe-eval'` CSP directive
-   Standard ES module imports

## Task Status

### Previous Approach (Superseded by Kaspa NG Pattern)

| Task                                           | Status     | Progress | Last Updated      |
| ---------------------------------------------- | ---------- | -------- | ----------------- |
| Complex bundling strategy with Rollup          | Superseded | N/A      | December 19, 2024 |
| Offscreen document with cross-origin isolation | Superseded | N/A      | December 19, 2024 |
| Manual WASM runtime implementation             | Superseded | N/A      | December 19, 2024 |
| Complex module resolution systems              | Superseded | N/A      | December 19, 2024 |

### New Approach: Kaspa NG Pattern Implementation

#### Phase 1: Foundation Setup (Direct WASM Loading)

| Task                                                 | Status      | Progress | Last Updated      |
| ---------------------------------------------------- | ----------- | -------- | ----------------- |
| Create manifest.json with 'wasm-unsafe-eval' CSP     | Not Started | 0%       | December 19, 2024 |
| Create popup.html with basic UI elements             | Not Started | 0%       | December 19, 2024 |
| Create popup.js with WASM loading (Kaspa NG pattern) | Not Started | 0%       | December 19, 2024 |
| Create background.js with direct WASM loading        | Not Started | 0%       | December 19, 2024 |
| Test basic extension loading without CSP violations  | Not Started | 0%       | December 19, 2024 |
| Test WASM module initialization in background        | Not Started | 0%       | December 19, 2024 |
| Test popup-background communication                  | Not Started | 0%       | December 19, 2024 |

#### Phase 2: OpenMina WASM Integration

| Task                                             | Status      | Progress | Last Updated      |
| ------------------------------------------------ | ----------- | -------- | ----------------- |
| Compile OpenMina WASM with --target web          | Not Started | 0%       | December 19, 2024 |
| Set up OpenMina-specific configuration loading   | Not Started | 0%       | December 19, 2024 |
| Implement OpenMina node initialization           | Not Started | 0%       | December 19, 2024 |
| Handle "cursed hack" errors as expected behavior | Not Started | 0%       | December 19, 2024 |
| Test RPC interface and status queries            | Not Started | 0%       | December 19, 2024 |
| Verify circuit blob and supporting file loading  | Not Started | 0%       | December 19, 2024 |

#### Phase 3: Threading Support (Conditional)

| Task                                             | Status      | Progress | Last Updated      |
| ------------------------------------------------ | ----------- | -------- | ----------------- |
| Implement threading detection                    | Not Started | 0%       | December 19, 2024 |
| Add cross-origin isolation if threading required | Not Started | 0%       | December 19, 2024 |
| Test SharedArrayBuffer availability              | Not Started | 0%       | December 19, 2024 |
| Verify worker thread functionality               | Not Started | 0%       | December 19, 2024 |

## Active Decisions & Considerations

| Decision/Consideration       | Status                        | Last Updated      |
| ---------------------------- | ----------------------------- | ----------------- |
| Architectural approach       | Decided - Kaspa NG Pattern    | December 19, 2024 |
| WASM loading strategy        | Decided - Direct ES Module    | December 19, 2024 |
| Chrome MV3 CSP configuration | Decided - 'wasm-unsafe-eval'  | December 19, 2024 |
| UI approach                  | Decided - Popup (not sidebar) | December 19, 2024 |
| Threading support            | Conditional - Add if needed   | December 19, 2024 |
| Bundling strategy            | Superseded - Not needed       | December 19, 2024 |
| Offscreen document           | Superseded - Not needed       | December 19, 2024 |

## Next Steps

| Task                                             | Target Date | Priority | Dependencies              |
| ------------------------------------------------ | ----------- | -------- | ------------------------- |
| Implement Kaspa NG pattern manifest.json         | TBD         | High     | None                      |
| Create popup UI following Kaspa NG design        | TBD         | High     | Manifest setup            |
| Implement direct WASM loading in background      | TBD         | High     | Basic extension structure |
| Test OpenMina WASM compilation with --target web | TBD         | High     | WASM loading working      |
| Integrate OpenMina configuration and lifecycle   | TBD         | Medium   | WASM compilation          |

## Known Challenges

| Challenge                         | Impact                      | Mitigation Strategy                                       | Last Updated      |
| --------------------------------- | --------------------------- | --------------------------------------------------------- | ----------------- |
| Chrome extension CSP restrictions | High - Blocks WASM loading  | RESOLVED: Use 'wasm-unsafe-eval' CSP directive            | December 19, 2024 |
| Dynamic import resolution in MV3  | High - Blocks WASM loading  | RESOLVED: Use direct ES module imports (Kaspa NG pattern) | December 19, 2024 |
| wasm-bindgen snippet imports      | Medium - Module loading     | Use standard --target web compilation                     | December 19, 2024 |
| OpenMina "cursed hack" errors     | Low - Expected behavior     | Handle as normal operation, not actual errors             | December 19, 2024 |
| Circuit blob file loading         | Medium - Node functionality | Ensure proper file structure and web_accessible_resources | December 19, 2024 |
| Threading support (if required)   | Medium - Conditional        | Add cross-origin isolation only if threading is needed    | December 19, 2024 |

## Learnings & Insights

| Learning                                                                       | Discovery Date    | Project Impact                         | Last Updated      |
| ------------------------------------------------------------------------------ | ----------------- | -------------------------------------- | ----------------- |
| Kaspa NG Chrome extension successfully runs blockchain WASM in Chrome MV3      | December 19, 2024 | Provides proven architectural pattern  | December 19, 2024 |
| 'wasm-unsafe-eval' CSP directive is essential for WASM loading in Chrome MV3   | December 19, 2024 | Critical for WASM functionality        | December 19, 2024 |
| Direct WASM loading in service worker and popup works without complex bundling | December 19, 2024 | Eliminates need for complex solutions  | December 19, 2024 |
| Offscreen documents are not required for basic WASM loading in Chrome MV3      | December 19, 2024 | Simplifies architecture significantly  | December 19, 2024 |
| Standard ES module imports work reliably for WASM in Chrome extensions         | December 19, 2024 | Enables straightforward implementation | December 19, 2024 |
| Complex bundling strategies may be unnecessary for Chrome MV3 WASM loading     | December 19, 2024 | Reduces development complexity         | December 19, 2024 |
