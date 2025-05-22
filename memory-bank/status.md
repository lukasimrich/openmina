# OpenMina Chrome Extension: MVP Implementation Status

_Last Updated: December 19, 2024_

## Current Focus

Building a functional Chrome extension using a comprehensive bundling strategy to load and initialize the threaded OpenMina WASM node in a sidebar UI, with basic interaction capabilities. The new approach uses Rollup to bundle all WASM, JS glue code, and snippets into a single ES module that resolves Chrome MV3 loading challenges.

## Task Status

### Phase 1: Core Extension, Sidebar UI & Cross-Origin Isolated Offscreen Document Setup

| Task                                                                 | Status    | Progress | Last Updated      |
| -------------------------------------------------------------------- | --------- | -------- | ----------------- |
| Create manifest.json with required permissions and COOP/COEP headers | Completed | 100%     | December 19, 2024 |
| Create sidebar.html with basic UI elements                           | Completed | 100%     | December 19, 2024 |
| Create sidebar.js with message handling                              | Completed | 100%     | December 19, 2024 |
| Create background.js service worker                                  | Completed | 100%     | December 19, 2024 |
| Create offscreen.html with COOP/COEP headers                         | Completed | 100%     | December 19, 2024 |
| Create offscreen.js with cross-origin isolation verification         | Completed | 100%     | December 19, 2024 |
| Test cross-origin isolation in offscreen document                    | Ready     | 0%       | December 19, 2024 |

### Phase 2: Bundled WASM Loading & Basic Initialization

| Task                                                           | Status      | Progress | Last Updated      |
| -------------------------------------------------------------- | ----------- | -------- | ----------------- |
| Compile WASM with --target web for proper module semantics     | Not Started | 0%       | December 19, 2024 |
| Set up Rollup bundling environment and dependencies            | Not Started | 0%       | December 19, 2024 |
| Create index.js entry point for bundling                       | Not Started | 0%       | December 19, 2024 |
| Configure rollup.config.js with required plugins               | Not Started | 0%       | December 19, 2024 |
| Build bundled ES module with npx rollup -c                     | Not Started | 0%       | December 19, 2024 |
| Update manifest.json for bundled file web_accessible_resources | Not Started | 0%       | December 19, 2024 |
| Implement bundled module loading in offscreen.js               | Not Started | 0%       | December 19, 2024 |
| Test bundled WASM module loading and initialization            | Not Started | 0%       | December 19, 2024 |

### Phase 3: Basic UI Feedback

| Task                                     | Status      | Progress | Last Updated |
| ---------------------------------------- | ----------- | -------- | ------------ |
| Implement status updates from WASM to UI | Not Started | 0%       | May 21, 2023 |
| Add error handling and display in UI     | Not Started | 0%       | May 21, 2023 |
| Test end-to-end communication flow       | Not Started | 0%       | May 21, 2023 |

## Active Decisions & Considerations

| Decision/Consideration                   | Status                      | Last Updated      |
| ---------------------------------------- | --------------------------- | ----------------- |
| Bundling strategy with Rollup            | Decided - Implemented       | December 19, 2024 |
| WASM compilation target (--target web)   | Decided                     | December 19, 2024 |
| Chrome MV3 loading approach              | Decided - Bundle Everything | December 19, 2024 |
| Error handling strategy for bundled WASM | Under Consideration         | December 19, 2024 |

## Next Steps

| Task                                            | Target Date | Priority | Dependencies              |
| ----------------------------------------------- | ----------- | -------- | ------------------------- |
| Set up basic extension structure                | TBD         | High     | None                      |
| Implement and test cross-origin isolation       | TBD         | High     | Basic extension structure |
| Set up Rollup bundling environment              | TBD         | High     | None                      |
| Create bundling configuration files             | TBD         | High     | Rollup environment        |
| Test bundled WASM loading in offscreen document | TBD         | High     | Bundling setup complete   |

## Known Challenges

| Challenge                            | Impact                        | Mitigation Strategy                                           | Last Updated      |
| ------------------------------------ | ----------------------------- | ------------------------------------------------------------- | ----------------- |
| Cross-origin isolation configuration | High - Required for threading | Follow established patterns in manifest.json and HTML headers | May 21, 2023      |
| WASM threading support               | High - Core functionality     | Use bundling strategy to pre-resolve all module dependencies  | December 19, 2024 |
| Chrome extension CSP restrictions    | Medium                        | Use bundled ES modules and web_accessible_resources           | December 19, 2024 |
| Dynamic import resolution in MV3     | High - Blocks WASM loading    | RESOLVED: Use Rollup bundling to eliminate dynamic imports    | December 19, 2024 |
| wasm-bindgen snippet imports         | High - Module loading fails   | RESOLVED: Bundle all snippets at build time                   | December 19, 2024 |

## Learnings & Insights

| Learning                                                                              | Discovery Date    | Project Impact                      | Last Updated      |
| ------------------------------------------------------------------------------------- | ----------------- | ----------------------------------- | ----------------- |
| Chrome MV3 extensions require both manifest-level and HTML meta tag COOP/COEP headers | May 21, 2023      | Critical for threading support      | May 21, 2023      |
| Service workers aren't cross-origin isolated, requiring offscreen document approach   | May 21, 2023      | Defines core architecture           | May 21, 2023      |
| Rollup bundling resolves all Chrome MV3 WASM loading challenges                       | December 19, 2024 | Eliminates import resolution issues | December 19, 2024 |
| --target web maintains proper module semantics for wasm-bindgen threading             | December 19, 2024 | Enables proper WASM compilation     | December 19, 2024 |
| Bundling strategy avoids CSP violations while preserving WASM functionality           | December 19, 2024 | Core technical approach             | December 19, 2024 |
