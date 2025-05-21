OpenMina Chrome Extension: MVP Implementation Plan (Threaded WASM Focus)
Overarching Goal: Achieve a functional Chrome extension capable of loading and initializing the threaded OpenMina WASM node, with the UI presented in a sidebar. Basic interaction (e.g., fetching node status) should be possible.

Critical Constraint: The only available OpenMina WASM module requires a threading-capable environment.

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
Phase 1: Core Extension, Sidebar UI & Critically Cross-Origin Isolated Offscreen Document Setup

Objective: Establish the minimal extension structure with a sidebar UI, and a correctly configured offscreen document that achieves self.crossOriginIsolated === true. This is non-negotiable for the threaded WASM.

Rationale: The threaded WASM requires SharedArrayBuffer, which is only available in cross-origin isolated contexts.

manifest.json (Minimal & Essential for Sidebar & COI):

manifest_version: 3

name: "OpenMina MVP Ext (Threaded)" (Example)

version: "0.1.0"

description: "MVP for Threaded OpenMina WASM Node with Sidebar UI"

permissions: ["offscreen", "sidePanel"]

side_panel: { "default_path": "sidebar.html" }

background: {"service_worker": "background.js"}

action: { "default_title": "Open OpenMina MVP" }

cross_origin_opener_policy: {"value": "same-origin"} (Essential for COI)

cross_origin_embedder_policy: {"value": "require-corp"} (Essential for COI)

web_accessible_resources: [{ "resources": ["offscreen.html", "sidebar.html", "wasm/*"], "matches": ["<all_urls>"] }]

Note: The wasm/\* path must correctly point to your WASM files (openmina.js, openmina_bg.wasm) and any minimal worker snippet files if the WASM module requires them for its internal threading (see Phase 2).

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

Phase 2: Threaded WASM Loading & Basic Initialization

Objective: Load the OpenMina WASM module and its JS interface. Initialize it, anticipating its threading requirements.

Rationale: With COI hopefully established, attempt to run the threaded WASM. This may involve providing minimal worker scripts or global shims if the WASM expects them.

File Placement (Potentially including worker snippets):

Ensure the main WASM file (openmina_bg.wasm), its JS interface (openmina.js) are in wasm/.

NEW: If your specific OpenMina WASM module (e.g., if compiled with Emscripten pthreads) expects to find worker scripts (e.g., openmina.worker.js), these minimal worker scripts must also be placed in wasm/ and be web-accessible.

A minimal openmina.worker.js might just import the main openmina.js again: importScripts('openmina.js'); or whatever the specific WASM's threading model requires. This is highly dependent on the WASM module itself.

offscreen.js (Phase 2 - Threaded WASM Integration):

Modify offscreen.js from Phase 1. Call initializeWasmNode() when INIT_WASM_IN_OFFSCREEN is received and COI is true.

The initializeWasmNode function must now be prepared for threading.

// offscreen.js (Phase 2 - Modified for Threaded WASM)
console.log("Offscreen script loaded (Phase 2 - Threaded Focus).");

// Critical COI Check (repeated for clarity, though initial check should prevent proceeding)
if (!self.crossOriginIsolated) {
console.error("CRITICAL: Attempting Phase 2 WASM load without cross-origin isolation. This will fail.");
chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: "WASM Load Aborted: Not isolated." });
throw new Error("Cannot initialize WASM: Not cross-origin isolated.");
} else {
console.log("Offscreen document IS cross-origin isolated. Proceeding with threaded WASM setup.");
}

async function initializeWasmNode() {
console.log("Offscreen: Attempting to initialize THREADED WASM...");
try {
// --- Minimal Shims/Globals (YAGNI: Only if WASM errors indicate they are needed) ---
// Example: If WASM checks for 'isWebWorkerThread' or similar for its pthreads model
// self.isWebWorkerThread = false; // Or a function: self.isWebWorkerThread = () => false;
// self.spawnWebWorker = (url) => { /_ minimal implementation or error if unexpected _/ };
// These are HYPOTHETICAL. Only add if errors from the WASM module point to missing globals.
// ------------------------------------------------------------------------------------

        const wasmModule = await import('./wasm/openmina.js'); // Adjust path

        if (typeof wasmModule.default === 'function') {
            // The init function might take an optional path to the .wasm file,
            // or a URL to the worker script if the WASM handles its own worker spawning.
            // Consult your WASM module's documentation for threading init.
            // Example: await wasmModule.default(chrome.runtime.getURL('wasm/openmina_bg.wasm'));
            await wasmModule.default();
        } else if (typeof wasmModule.init === 'function') {
            await wasmModule.init();
        }
        console.log("WASM module script interface initialized/loaded.");

        // The 'run' function might also need specific parameters for threading.
        const node = await wasmModule.run({ /* potential threading config here */ });
        console.log("OpenMina Node instance obtained (threaded).");

        if (node && typeof node.status === 'function') {
            const status = await node.status();
            console.log("Node status:", status);
            chrome.runtime.sendMessage({ type: "NODE_STATUS", payload: JSON.stringify(status) });
        } else {
            console.error("Node object or status function not available as expected.");
            chrome.runtime.sendMessage({ type: "NODE_ERROR", payload: "Node API not as expected after run()." });
        }
    } catch (error) {
        console.error("Error during THREADED WASM initialization or run:", error);
        // Log specific errors like "unreachable" in is_web_worker_thread if they occur.
        chrome.runtime.sendMessage({ type: "NODE_ERROR", payload: `WASM Init/Run Error: ${error.message}` });
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

Phase 3: Basic UI Feedback (No change from previous plan)

Key Milestones:

M1: Sidebar UI & Critically Cross-Origin Isolated Offscreen Document: sidebar.html loads, Phase 1 offscreen.js runs and confirms self.crossOriginIsolated === true. Basic message exchange works. If COI is false, M1 is failed, and this is a blocker.

M2: Threaded WASM Module Loaded & Initialized: Phase 2 offscreen.js successfully imports openmina.js (and its .wasm). The initializeWasmNode function completes the WASM module's own initialization sequence (which may involve its internal threading mechanisms) without runtime errors.

M3: Basic Node Interaction (Threaded Context): A core function of the WASM node (e.g., status()) can be called after threaded initialization, and its result is logged/passed back.

M4: Sidebar UI Displays Node Status: (Same as previous plan)

Ruthless Prioritization - What to IGNORE for MVP (YAGNI List - Adjusted for Threading):

Advanced Threading Management: No custom worker pools, complex inter-worker communication beyond what the WASM module handles internally, or optimization of thread performance. The goal is to enable the existing threaded WASM, not to build a new threading system around it.

Complex Build Scripts: Manually place files, including any minimal required worker snippets.

Abstraction Layers: Direct use of APIs.

State Persistence.

Advanced UI/UX.

Comprehensive Error Handling & Recovery: Basic try/catch and logging, especially around WASM init and COI checks.

Performance Monitoring/Optimization.

Placeholders for Future Features not strictly required for the threaded WASM to init.

This plan now directly confronts the threaded nature of your WASM module from the outset. The success of Phase 1 (achieving cross-origin isolation) is paramount.
