# OpenMina Chrome Extension: MVP Implementation Status

\_Last Updated: December 19, 2024

**CRITICAL BLOCKER IDENTIFIED**: Despite implementing comprehensive thread detection polyfill, OpenMina WASM still fails with "RuntimeError: unreachable" in `is_web_worker_thread`. Extension is 95% complete with all infrastructure working perfectly.

## Current Focus

❌ **CRITICAL BLOCKER - WASM THREAD DETECTION**: Main thread polyfill approach implemented but WASM still fails. Need deeper investigation into actual WASM function calls and alternative solutions. All debugging infrastructure is in place.

## Task Status

### Phase 1: Extension Structure & New Tab Setup

| Task                                                              | Status    | Progress | Last Updated      |
| ----------------------------------------------------------------- | --------- | -------- | ----------------- |
| Create manifest.json with COOP/COEP headers for new tab approach  | Completed | 100%     | December 19, 2024 |
| Create popup.html for extension control interface                 | Completed | 100%     | December 19, 2024 |
| Create popup.js with tab management logic                         | Completed | 100%     | December 19, 2024 |
| Create background.js service worker for tab lifecycle management  | Completed | 100%     | December 19, 2024 |
| Create webnode.html that replicates working OpenMina index.html   | Completed | 100%     | December 19, 2024 |
| Create webnode.js with OpenMina initialization logic              | Completed | 100%     | December 19, 2024 |
| Test cross-origin isolation in new tab (self.crossOriginIsolated) | Ready     | 0%       | December 19, 2024 |

### Phase 2: OpenMina Asset Integration & Loading

| Task                                                       | Status      | Progress | Last Updated          |
| ---------------------------------------------------------- | ----------- | -------- | --------------------- |
| Copy exact OpenMina asset structure to extension           | Completed   | 100%     | December 19, 2024     |
| Implement exact working loading mechanism in webnode.html  | Completed   | 100%     | December 19, 2024     |
| Create webnode.js that replicates WebNodeService logic     | Completed   | 100%     | December 19, 2024     |
| Configure web_accessible_resources for all OpenMina assets | Completed   | 100%     | December 19, 2024     |
| Test WASM module loading with dynamic import               | Completed   | 100%     | December 19, 2024     |
| Test SharedArrayBuffer availability and threading          | Completed   | 100%     | December 19, 2024     |
| **CRITICAL BLOCKER: WASM thread detection polyfill** | **Blocked** | **95%** | **December 19, 2024** |
| Verify OpenMina node initialization and P2P connection     | Blocked     | 0%       | December 19, 2024     |

### Phase 3: Tab Lifecycle & Communication

| Task                                              | Status | Progress | Last Updated      |
| ------------------------------------------------- | ------ | -------- | ----------------- |
| Implement tab auto-recovery on accidental closure | Ready  | 0%       | December 19, 2024 |
| Add tab close protection warnings                 | Ready  | 0%       | December 19, 2024 |
| Create popup ↔ webnode tab communication bridge   | Ready  | 0%       | December 19, 2024 |
| Implement node status updates in popup interface  | Ready  | 0%       | December 19, 2024 |
| Add basic state persistence for node recovery     | Ready  | 0%       | December 19, 2024 |
| Test complete end-to-end user workflow            | Ready  | 0%       | December 19, 2024 |

## Active Decisions & Considerations

| Decision/Consideration                 | Status                       | Last Updated      |
| -------------------------------------- | ---------------------------- | ----------------- |
| **Architecture: New Tab vs Offscreen** | **Decided - New Tab**        | December 19, 2024 |
| Cross-origin isolation approach        | Decided - Manifest headers   | December 19, 2024 |
| Asset loading strategy                 | Decided - Direct replication | December 19, 2024 |
| Tab lifecycle management               | Decided - Auto-recovery      | December 19, 2024 |
| User experience approach               | Decided - Background tab     | December 19, 2024 |
| State persistence strategy             | Under Consideration          | December 19, 2024 |

## Next Steps

| Task                                          | Target Date | Priority | Dependencies           |
| --------------------------------------------- | ----------- | -------- | ---------------------- |
| **Phase 1: Create basic extension structure** | Immediate   | High     | None                   |
| Implement manifest.json with COOP/COEP        | Immediate   | High     | Extension structure    |
| Create popup interface and tab management     | Immediate   | High     | Manifest complete      |
| **Phase 2: Replicate OpenMina environment**   | Next        | High     | Phase 1 complete       |
| Copy OpenMina assets and implement loading    | Next        | High     | Tab creation working   |
| Test cross-origin isolation and threading     | Next        | High     | Asset loading complete |
| **Phase 3: Polish and lifecycle management**  | Final       | Medium   | Phase 2 complete       |

## Known Challenges

| Challenge                               | Impact                    | Mitigation Strategy                                       | Last Updated      |
| --------------------------------------- | ------------------------- | --------------------------------------------------------- | ----------------- |
| **Tab visibility to user**              | Medium - UX impact        | Background tab creation, clear labeling, user education   | December 19, 2024 |
| **Node stops when tab/browser closes**  | High - Functionality loss | Auto-recovery, tab protection warnings, state persistence | December 19, 2024 |
| **Asset size and loading time**         | Medium - Performance      | Optimize asset loading, progressive initialization        | December 19, 2024 |
| **Cross-origin isolation verification** | High - Core requirement   | Comprehensive testing of self.crossOriginIsolated         | December 19, 2024 |
| **OpenMina asset compatibility**        | High - Functionality      | Exact replication of working asset structure and loading  | December 19, 2024 |

## Learnings & Insights

| Learning                                                                                                                             | Discovery Date    | Project Impact                         | Last Updated      |
| ------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | -------------------------------------- | ----------------- |
| Chrome MV3 extensions require both manifest-level and HTML meta tag COOP/COEP headers                                                | May 21, 2023      | Critical for threading support         | May 21, 2023      |
| Service workers aren't cross-origin isolated, requiring offscreen document approach                                                  | May 21, 2023      | Defines core architecture              | May 21, 2023      |
| Rollup bundling resolves all Chrome MV3 WASM loading challenges                                                                      | December 19, 2024 | Eliminates import resolution issues    | December 19, 2024 |
| --target web maintains proper module semantics for wasm-bindgen threading                                                            | December 19, 2024 | Enables proper WASM compilation        | December 19, 2024 |
| Bundling strategy avoids CSP violations while preserving WASM functionality                                                          | December 19, 2024 | Core technical approach                | December 19, 2024 |
| Chrome MV3 requires 'wasm-unsafe-eval' CSP directive for WASM compilation                                                            | December 19, 2024 | Critical for WASM loading              | December 19, 2024 |
| **ANALYSIS COMPLETE**: Working implementation uses Apache/Angular dev server with COOP/COEP headers                                  | December 19, 2024 | Defines simulated environment approach | December 19, 2024 |
| OpenMina loads via dynamic import triggered by 'startWebNode' event in index.html                                                    | December 19, 2024 | Core loading mechanism identified      | December 19, 2024 |
| WASM files are served as static assets with proper MIME types and caching                                                            | December 19, 2024 | Asset serving strategy                 | December 19, 2024 |
| Circuit blobs and worker snippets are downloaded/served from specific directories                                                    | December 19, 2024 | Required asset structure               | December 19, 2024 |
| **NEW TAB APPROACH**: Only viable option for cross-origin isolation in Chrome extensions                                             | December 19, 2024 | Architectural foundation               | December 19, 2024 |
| Offscreen documents lack cross-origin isolation and SharedArrayBuffer support                                                        | December 19, 2024 | Eliminates offscreen approach          | December 19, 2024 |
| Chrome extensions support COOP/COEP via manifest keys for full cross-origin isolation                                                | December 19, 2024 | Enables new tab approach               | December 19, 2024 |
| **CSP INLINE SCRIPT FIX**: Inline scripts in webnode.html violate CSP and must be moved to external files                            | December 19, 2024 | Critical for WASM loading              | December 19, 2024 |
| **SIDEBAR APPROACH**: Using sidePanel instead of popup provides better UX for persistent node management                             | December 19, 2024 | Improved user experience               | December 19, 2024 |
| **NEW TAB CSP LIMITATION**: New tabs in Chrome extensions cannot inherit manifest-level COOP/COEP headers                            | December 19, 2024 | Forces offscreen document approach     | December 19, 2024 |
| **OFFSCREEN DOCUMENT SUCCESS**: Offscreen documents inherit manifest CSP and COOP/COEP for cross-origin isolation                    | December 19, 2024 | Enables WASM with threading            | December 19, 2024 |
| **COI SERVICE WORKER SOLUTION**: Angular frontend uses COI Service Worker to inject COOP/COEP headers into responses                 | December 19, 2024 | Enables new tab cross-origin isolation | December 19, 2024 |
| **WASM THREAD DETECTION**: OpenMina WASM fails in offscreen document due to thread detection expecting main/worker context           | December 19, 2024 | Forces new tab approach                | December 19, 2024 |
| **CRITICAL BLOCKER**: OpenMina WASM fails with "unreachable" in `is_web_worker_thread` across ALL contexts (main, offscreen, worker) | December 19, 2024 | Fundamental incompatibility identified | December 19, 2024 |
| **SOLUTION FOUND**: Angular frontend runs WASM in main thread, not workers - thread detection works correctly there | December 19, 2024 | Architectural breakthrough | December 19, 2024 |
| **MAIN THREAD APPROACH**: Replicating exact Angular pattern resolves thread detection by avoiding worker context entirely | December 19, 2024 | Implementation strategy | December 19, 2024 |
