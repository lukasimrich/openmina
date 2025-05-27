OpenMina Chrome Extension: MVP Implementation Plan (New Tab Simulation Approach)
Overarching Goal: Create a working Chrome extension that opens a new tab with the exact working OpenMina webnode environment, providing full cross-origin isolation and threading support.

Core Strategy: Extension opens a new tab that replicates the proven working OpenMina implementation with proper COOP/COEP headers, SharedArrayBuffer support, and the exact same asset structure and loading mechanism.

Architectural Decision: New Tab vs Offscreen Document

-   ✅ New Tab: Full cross-origin isolation, SharedArrayBuffer support, complete web platform access
-   ❌ Offscreen Document: No cross-origin isolation, no SharedArrayBuffer, limited API access

Critical Requirements: Cross-origin isolation via manifest headers, SharedArrayBuffer for threading, exact replication of working webnode environment.

Core Principles (Laser Focus & Minimalist Approach):

This plan adheres strictly to the following, reinforcing a laser-focused approach:

Working Project First: All decisions prioritize getting a demonstrable, running extension with the threaded WASM for the current, explicitly stated requirements.

Generate Minimal Viable Code:

Generate only the code strictly necessary to fulfill the explicitly stated requirements for each phase, including the minimal setup for the threaded WASM.

Start with the simplest possible implementation that compiles and works for the core request of the current phase.

Constraint: Do not add extra logic, configurations, or placeholders for features not specifically mentioned or immediately required by the current phase's objective.

Ensure the generated code for each phase is immediately runnable.

Include only necessary imports.

Strictly Apply YAGNI (You Aren't Gonna Need It):

Constraint: Do not generate code for anticipated future needs, potential extensions, or hypothetical use cases unless explicitly instructed for the current phase.

Constraint: Do not introduce abstraction layers unless the current request demonstrates a clear, immediate need. Use concrete types and direct API calls.

For threading: Implement only the bare minimum shims, worker scripts, or global properties if and only if the WASM module explicitly requires them for initialization and basic operation.

Minimize Code Volume (Conciseness):

Generate the most concise code that correctly implements the requested functionality.

Constraint: Avoid unnecessary boilerplate or redundant helper functions.

Prefer using built-in Chrome extension APIs and standard JavaScript features.

Flat Structure: Keep the architecture as simple as possible.

Defer Optimizations: Performance tuning (beyond getting it to run), comprehensive robustness (beyond basic error catching for immediate debugging), and advanced maintenance features are out of scope for the MVP.

Leverage Past Learnings: Directly apply solutions to previously encountered problems (CSP, COOP/COEP, module loading, offscreen document setup).

Key Milestones & Implementation Steps
Phase 1: Extension Structure & New Tab with Cross-Origin Isolation

Objective: Create minimal extension that opens a new tab with proper cross-origin isolation, replicating the exact working OpenMina environment.

Rationale: New tab provides full cross-origin isolation via manifest headers, enabling SharedArrayBuffer and complete OpenMina functionality.

manifest.json (New Tab Approach with Cross-Origin Isolation):

```json
{
    "manifest_version": 3,
    "name": "OpenMina Web Node",
    "version": "1.0.0",
    "description": "OpenMina blockchain node running in Chrome",

    "cross_origin_opener_policy": { "value": "same-origin" },
    "cross_origin_embedder_policy": { "value": "require-corp" },

    "permissions": ["tabs", "storage"],
    "action": { "default_popup": "popup.html" },
    "background": { "service_worker": "background.js" },

    "web_accessible_resources": [
        {
            "resources": ["webnode.html", "assets/webnode/**/*"],
            "matches": ["<all_urls>"]
        }
    ]
}
```

Note: The dist/ path contains the bundled ES module and WASM binary. The bundle.js includes all resolved imports and snippets, while the WASM file is served as a static asset.

sidebar.html (Ultra-Simple): (No change from previous plan)

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>OpenMina MVP</title>
    <style>
        body { width: 300px; font-family: sans-serif; padding: 10px; }
        #status { margin-top: 10px; word-wrap: break-word; }
    </style>
</head>
<body>
    <h3>OpenMina Node</h3>
    <button id="initNodeBtn">Initialize Node</button>
    <div id="status">Status: Idle</div>
    <script src="sidebar.js"></script>
</body>
</html>

sidebar.js (Basic Interaction): (No change from previous plan)

// sidebar.js
document.getElementById('initNodeBtn').addEventListener('click', () => {
chrome.runtime.sendMessage({ type: "INIT_WASM_REQUEST" });
document.getElementById('status').textContent = 'Status: Initializing...';
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (sender.id === chrome.runtime.id) {
if (message.type === "NODE_STATUS_UPDATE") {
document.getElementById('status').textContent = `Status: ${message.payload}`;
} else if (message.type === "NODE_ERROR_UPDATE") {
document.getElementById('status').textContent = `Error: ${message.payload}`;
}
}
});

background.js (Service Worker - Minimal Orchestrator): (No change from previous plan)

// background.js
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

async function hasOffscreenDocument() { /_ ... same as before ... _/ }
async function setupOffscreenDocument() { /_ ... same as before ... _/ }

chrome.action.onClicked.addListener((tab) => { /_ ... same as before ... _/ });
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => { /_ ... same as before ... _/ });

(Full code for background.js from previous plan remains unchanged here for brevity)

offscreen.html (WASM Host - COI Critical):

Crucially, this document must achieve cross-origin isolation.

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Offscreen WASM Host</title>
    <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin" />
    <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp" />
</head>
<body>
    <script src="offscreen.js" type="module"></script>
</body>
</html>

offscreen.js (Phase 1 - Verify COI & Readiness):

The primary goal of this phase for offscreen.js is to confirm self.crossOriginIsolated === true.

// offscreen.js (Phase 1 - Focus on COI)
console.log("Offscreen script loaded.");
if (self.crossOriginIsolated) {
console.log("SUCCESS: Offscreen document IS cross-origin isolated. SharedArrayBuffer should be available.");
chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "Offscreen ready & isolated." });
} else {
console.error("CRITICAL FAILURE: Offscreen document IS NOT cross-origin isolated. Threaded WASM will likely fail. Check manifest.json and offscreen.html COOP/COEP headers.");
chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: "Offscreen NOT isolated. Threading impossible." });
// Do not proceed to WASM loading if not isolated.
throw new Error("Offscreen document not cross-origin isolated.");
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message.type === "INIT_WASM_IN_OFFSCREEN") {
if (!self.crossOriginIsolated) {
console.error("Offscreen: Received INIT_WASM_IN_OFFSCREEN, but not cross-origin isolated. Aborting.");
sendResponse({ error: "Not cross-origin isolated."});
return true;
}
console.log("Offscreen: Received INIT_WASM_IN_OFFSCREEN. WASM initialization is part of Phase 2.");
// In Phase 2, initializeWasmNode() will be called HERE.
sendResponse({ status: "Acknowledged. WASM init follows in Phase 2."});
}
return true;
});

// Signal readiness (and COI status) to background
chrome.runtime.sendMessage({ type: "OFFSCREEN_READY_ACK" });

Phase 2: Bundled WASM Loading & Basic Initialization (Bundle Everything Strategy)

Objective: Use a comprehensive bundling approach to resolve all WASM module loading challenges in Chrome MV3. Bundle the WASM, JS glue code, and all snippets into a single ES module that can be loaded safely.

Rationale: Instead of trying to resolve dynamic imports and snippet loading at runtime, pre-bundle everything into a single file that Chrome MV3 can load without CSP violations or import resolution issues.

Strategy: Bundle Everything, Then Load with MV3

Step 1: WASM Compilation with --target web

-   Use wasm-bindgen --target web for proper module semantics
-   This supports wasm-bindgen(module = "...") and snippet imports
-   Command: wasm-bindgen --target web --out-dir pkg ./target/wasm32-unknown-unknown/release/openmina_node_web.wasm

Step 2: Rollup Bundling Configuration

-   Install bundling dependencies:
    npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-wasm rollup-plugin-terser

-   Create index.js entry point:
    import initWasm, { run, build_env } from './pkg/openmina_node_web.js';

    async function init() {
    await initWasm(); // calls the start() method
    run();
    }

    init();

-   Configure rollup.config.js:
    import resolve from '@rollup/plugin-node-resolve';
    import commonjs from '@rollup/plugin-commonjs';
    import { wasm } from '@rollup/plugin-wasm';

    export default {
    input: 'index.js',
    output: {
    file: 'dist/bundle.js',
    format: 'es',
    },
    plugins: [
    resolve(),
    commonjs(),
    wasm(),
    ],
    };

-   Build command: npx rollup -c

Step 3: File Structure & Placement

-   dist/bundle.js - The complete bundled ES module
-   dist/openmina_node_web_bg.wasm - WASM binary (served as static asset)
-   Both files must be in web_accessible_resources

Step 4: Chrome MV3 Loading Implementation

Update manifest.json web_accessible_resources:
{
"web_accessible_resources": [
{
"resources": ["offscreen.html", "sidebar.html", "dist/bundle.js", "dist/openmina_node_web_bg.wasm"],
"matches": ["<all_urls>"]
}
]
}

Create injector.js for content script loading:
const script = document.createElement('script');
script.type = 'module';
script.src = chrome.runtime.getURL('dist/bundle.js');
document.documentElement.appendChild(script);

offscreen.js (Phase 2 - Bundled WASM Integration):

Modify offscreen.js from Phase 1 to load the bundled module instead of individual files.

// offscreen.js (Phase 2 - Bundled WASM Approach)
console.log("Offscreen script loaded (Phase 2 - Bundled WASM Focus).");

// Critical COI Check (repeated for clarity, though initial check should prevent proceeding)
if (!self.crossOriginIsolated) {
console.error("CRITICAL: Attempting Phase 2 WASM load without cross-origin isolation. This will fail.");
chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: "WASM Load Aborted: Not isolated." });
throw new Error("Cannot initialize WASM: Not cross-origin isolated.");
} else {
console.log("Offscreen document IS cross-origin isolated. Proceeding with bundled WASM setup.");
}

async function initializeWasmNode() {
console.log("Offscreen: Attempting to initialize BUNDLED WASM...");
try {
// Load the bundled module that contains everything pre-resolved
const script = document.createElement('script');
script.type = 'module';
script.src = chrome.runtime.getURL('dist/bundle.js');

// Listen for initialization completion from the bundled module
window.addEventListener('openmina-ready', (event) => {
console.log("OpenMina bundled module initialized successfully");
chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "WASM bundled module loaded" });

// Access the initialized WASM functions
if (window.openminaNode) {
console.log("OpenMina Node instance available");
// Test basic functionality
if (typeof window.openminaNode.status === 'function') {
const status = window.openminaNode.status();
console.log("Node status:", status);
chrome.runtime.sendMessage({ type: "NODE_STATUS", payload: JSON.stringify(status) });
} else {
console.log("Node status function not available, but node object exists");
chrome.runtime.sendMessage({ type: "NODE_STATUS", payload: "Node loaded, status pending" });
}
} else {
console.error("OpenMina node not available on window object");
chrome.runtime.sendMessage({ type: "NODE_ERROR", payload: "Node not available after bundle load" });
}
});

// Handle initialization errors
window.addEventListener('openmina-error', (event) => {
console.error("OpenMina bundled module initialization failed:", event.detail);
chrome.runtime.sendMessage({ type: "NODE_ERROR", payload: `Bundle Init Error: ${event.detail}` });
});

document.head.appendChild(script);
console.log("Bundled WASM script injected, waiting for initialization...");

} catch (error) {
console.error("Error during BUNDLED WASM loading:", error);
chrome.runtime.sendMessage({ type: "NODE_ERROR", payload: `Bundle Load Error: ${error.message}` });
}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message.type === "INIT_WASM_IN_OFFSCREEN") {
if (!self.crossOriginIsolated) { // Double check
console.error("Offscreen: Received INIT_WASM_IN_OFFSCREEN, but not isolated. Aborting.");
sendResponse({ error: "Not cross-origin isolated for WASM init."});
return true;
}
console.log("Offscreen: Received INIT_WASM_IN_OFFSCREEN. Calling initializeWasmNode() for threaded WASM.");
initializeWasmNode();
sendResponse({ status: "Threaded WASM initialization started."});
}
return true;
});

// Initial readiness & COI check signal (already sent on load by Phase 1 logic)
// chrome.runtime.sendMessage({ type: "OFFSCREEN_READY_ACK" });

Build Process & Development Workflow:

Step 1: Compile WASM with proper target
cargo build --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir pkg ./target/wasm32-unknown-unknown/release/openmina_node_web.wasm

Step 2: Set up bundling environment
npm init -y
npm install --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-wasm rollup-plugin-terser

Step 3: Create bundling configuration files

-   index.js (entry point)
-   rollup.config.js (bundling configuration)

Step 4: Build bundled module
npx rollup -c

Step 5: Copy files to extension directory

-   Copy dist/bundle.js to extension/dist/
-   Copy dist/openmina_node_web_bg.wasm to extension/dist/

Phase 3: Basic UI Feedback & Integration Testing

Objective: Complete the communication loop between bundled WASM and UI, with comprehensive error handling and status reporting.

Key Milestones:

M1: Sidebar UI & Critically Cross-Origin Isolated Offscreen Document: sidebar.html loads, Phase 1 offscreen.js runs and confirms self.crossOriginIsolated === true. Basic message exchange works. If COI is false, M1 is failed, and this is a blocker.

M2: Bundled WASM Module Successfully Loaded: Phase 2 offscreen.js successfully loads the bundled dist/bundle.js module. The bundle resolves all imports internally and initializes without CSP violations or import resolution errors.

M3: WASM Initialization in Threaded Context: The bundled module successfully initializes the WASM with threading support, and basic functions are accessible via the window object or event system.

M4: Basic Node Interaction & Status Reporting: A core function of the WASM node (e.g., status()) can be called after bundled initialization, and its result is logged and passed back to the sidebar UI.

M5: End-to-End Communication Flow: Sidebar UI can trigger WASM initialization, receive status updates, and display meaningful feedback to the user.

Ruthless Prioritization - What to IGNORE for MVP (YAGNI List - Adjusted for Bundling Strategy):

Advanced Threading Management: No custom worker pools, complex inter-worker communication beyond what the WASM module handles internally, or optimization of thread performance. The bundling approach handles threading requirements automatically.

Complex Build Optimization: Use basic Rollup configuration without advanced optimizations like tree-shaking, code splitting, or minification until the basic bundling works.

Dynamic Module Loading: No runtime module resolution or lazy loading. Everything is pre-bundled into a single module.

Abstraction Layers: Direct use of Chrome extension APIs and bundled WASM functions.

State Persistence: No local storage or session management.

Advanced UI/UX: Basic button and status display only.

Comprehensive Error Handling & Recovery: Basic try/catch and logging, especially around bundle loading and COI checks.

Performance Monitoring/Optimization: Focus on functionality first.

Alternative Loading Strategies: Don't implement fallback loading mechanisms or multiple bundling approaches.

Placeholders for Future Features not strictly required for the bundled WASM to initialize and run.

Benefits of the Bundling Strategy:

✅ Eliminates dynamic import resolution issues in Chrome MV3
✅ Resolves all wasm-bindgen snippet imports at build time
✅ Provides a single, CSP-compliant ES module for loading
✅ Maintains proper module semantics for threading support
✅ Avoids runtime fetch() or cross-origin import complications
✅ Enables proper WASM threading in cross-origin isolated context

This plan now uses a comprehensive bundling strategy that pre-resolves all module loading challenges, making the Chrome MV3 extension loading straightforward and reliable.

## Current Implementation Status (December 19, 2024)

**CRITICAL BLOCKER IDENTIFIED**: Despite successful implementation of all infrastructure components, OpenMina WASM fails with `RuntimeError: unreachable` in thread detection logic across ALL execution contexts.

### ✅ Successfully Implemented

-   Extension structure with manifest, background script, sidebar interface
-   New tab approach with COI Service Worker for cross-origin isolation
-   Content Security Policy with `'wasm-unsafe-eval'` for WASM compilation
-   Complete OpenMina asset integration (47MB+ of WASM files and dependencies)
-   WASM loading mechanism replicating exact Angular frontend pattern
-   Dedicated worker implementation for proper thread context
-   Comprehensive diagnostics and error logging

### ❌ Critical Blocker

**Error**: `RuntimeError: unreachable` in `wasm_thread::wasm32::utils::is_web_worker_thread`
**Impact**: Prevents OpenMina node initialization across all execution contexts
**Root Cause**: Fundamental incompatibility between OpenMina's thread detection logic and Chrome extension environment

### Next Steps Required

1. **Deep WASM Analysis**: Examine OpenMina's thread detection implementation
2. **Browser API Investigation**: Identify missing/modified APIs in extension context
3. **Workaround Development**: Polyfill missing APIs or modify thread detection logic
4. **Alternative Approaches**: Consider single-threaded mode or native messaging

**Requires**: Rust/WASM expertise and access to OpenMina source code for thread detection analysis.
