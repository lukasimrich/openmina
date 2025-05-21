# OpenMina Chrome Extension: MVP Implementation Status

_Last Updated: May 21, 2023_

## Current Focus

Building a functional Chrome extension capable of loading and initializing the threaded OpenMina WASM node in a sidebar UI, with basic interaction capabilities.

## Task Status

### Phase 1: Core Extension, Sidebar UI & Cross-Origin Isolated Offscreen Document Setup

| Task                                                                 | Status      | Progress | Last Updated |
| -------------------------------------------------------------------- | ----------- | -------- | ------------ |
| Create manifest.json with required permissions and COOP/COEP headers | Not Started | 0%       | May 21, 2023 |
| Create sidebar.html with basic UI elements                           | Not Started | 0%       | May 21, 2023 |
| Create sidebar.js with message handling                              | Not Started | 0%       | May 21, 2023 |
| Create background.js service worker                                  | Not Started | 0%       | May 21, 2023 |
| Create offscreen.html with COOP/COEP headers                         | Not Started | 0%       | May 21, 2023 |
| Create offscreen.js with cross-origin isolation verification         | Not Started | 0%       | May 21, 2023 |
| Test cross-origin isolation in offscreen document                    | Not Started | 0%       | May 21, 2023 |

### Phase 2: Threaded WASM Loading & Basic Initialization

| Task                                                        | Status      | Progress | Last Updated |
| ----------------------------------------------------------- | ----------- | -------- | ------------ |
| Prepare WASM file structure (openmina.js, openmina_bg.wasm) | Not Started | 0%       | May 21, 2023 |
| Add worker scripts if required by WASM module               | Not Started | 0%       | May 21, 2023 |
| Implement WASM initialization in offscreen.js               | Not Started | 0%       | May 21, 2023 |
| Handle threading requirements for WASM module               | Not Started | 0%       | May 21, 2023 |
| Test WASM module loading and initialization                 | Not Started | 0%       | May 21, 2023 |

### Phase 3: Basic UI Feedback

| Task                                     | Status      | Progress | Last Updated |
| ---------------------------------------- | ----------- | -------- | ------------ |
| Implement status updates from WASM to UI | Not Started | 0%       | May 21, 2023 |
| Add error handling and display in UI     | Not Started | 0%       | May 21, 2023 |
| Test end-to-end communication flow       | Not Started | 0%       | May 21, 2023 |

## Active Decisions & Considerations

| Decision/Consideration     | Status                | Last Updated |
| -------------------------- | --------------------- | ------------ |
| WASM threading approach    | Under Consideration   | May 21, 2023 |
| Worker script requirements | Pending Investigation | May 21, 2023 |
| Error handling strategy    | Not Started           | May 21, 2023 |

## Next Steps

| Task                                           | Target Date | Priority | Dependencies              |
| ---------------------------------------------- | ----------- | -------- | ------------------------- |
| Set up basic extension structure               | TBD         | High     | None                      |
| Implement and test cross-origin isolation      | TBD         | High     | Basic extension structure |
| Investigate WASM module threading requirements | TBD         | High     | None                      |

## Known Challenges

| Challenge                            | Impact                        | Mitigation Strategy                                           | Last Updated |
| ------------------------------------ | ----------------------------- | ------------------------------------------------------------- | ------------ |
| Cross-origin isolation configuration | High - Required for threading | Follow established patterns in manifest.json and HTML headers | May 21, 2023 |
| WASM threading support               | High - Core functionality     | Ensure proper worker scripts and environment setup            | May 21, 2023 |
| Chrome extension CSP restrictions    | Medium                        | Use web_accessible_resources and proper paths                 | May 21, 2023 |

## Learnings & Insights

| Learning                                                                              | Discovery Date | Project Impact                 | Last Updated |
| ------------------------------------------------------------------------------------- | -------------- | ------------------------------ | ------------ |
| Chrome MV3 extensions require both manifest-level and HTML meta tag COOP/COEP headers | May 21, 2023   | Critical for threading support | May 21, 2023 |
| Service workers aren't cross-origin isolated, requiring offscreen document approach   | May 21, 2023   | Defines core architecture      | May 21, 2023 |
