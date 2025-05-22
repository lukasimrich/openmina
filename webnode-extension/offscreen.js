// offscreen.js (Phase 2 - Bundled WASM Approach)
console.log("Offscreen script loaded (Phase 2 - Bundled WASM Focus).");

// Critical COI Check (repeated for clarity, though initial check should prevent proceeding)
if (!self.crossOriginIsolated) {
  console.error("CRITICAL: Attempting Phase 2 WASM load without cross-origin isolation. This will fail.");
  chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: "WASM Load Aborted: Not isolated." });
  throw new Error("Cannot initialize WASM: Not cross-origin isolated.");
} else {
  console.log("Offscreen document IS cross-origin isolated. Proceeding with bundled WASM setup.");
  chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "Offscreen ready & isolated." });
}

async function initializeWasmNode() {
  console.log("Offscreen: Attempting to initialize WASM in Web Worker...");
  try {
    // Create a dedicated Web Worker for WASM execution
    const workerScript = chrome.runtime.getURL('mina_worker.js');
    console.log("Offscreen: Creating Web Worker with script:", workerScript);

    const worker = new Worker(workerScript); // Classic worker for importScripts() support

    // Set up communication with the worker
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      console.log("Offscreen: Received message from worker:", type, payload);

      switch (type) {
        case 'WASM_READY':
          console.log("OpenMina WASM initialized successfully in worker");
          console.log("Worker payload:", payload);
          chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "WASM loaded in worker" });

          // Store worker reference for future communication
          window.openminaWorker = worker;

          // Log available capabilities
          if (payload.buildEnv) {
            console.log("=== WASM BUILD ENVIRONMENT ===");
            console.log("Build environment:", payload.buildEnv);
            console.log("=== END BUILD ENVIRONMENT ===");
          }

          chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "WASM worker ready" });
          break;

        case 'WASM_ERROR':
          console.error("OpenMina WASM initialization failed in worker:", payload);
          chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: `Worker Init Error: ${payload}` });
          break;

        case 'WASM_LOG':
          console.log("Worker log:", payload);
          break;

        default:
          console.log("Unknown message from worker:", type, payload);
      }
    };

    worker.onerror = (error) => {
      console.error("Worker error:", error);
      chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: `Worker Error: ${error.message}` });
    };

    // Initialize the WASM module in the worker
    console.log("Offscreen: Sending INIT command to worker...");
    worker.postMessage({ type: 'INIT_WASM' });

  } catch (error) {
    console.error("Error during Web Worker WASM setup:", error);
    console.error("Error stack:", error.stack);
    chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: `Worker Setup Error: ${error.message}` });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "INIT_WASM_IN_OFFSCREEN") {
    if (!self.crossOriginIsolated) { // Double check
      console.error("Offscreen: Received INIT_WASM_IN_OFFSCREEN, but not isolated. Aborting.");
      sendResponse({ error: "Not cross-origin isolated for WASM init."});
      return true;
    }
    console.log("Offscreen: Received INIT_WASM_IN_OFFSCREEN. Calling initializeWasmNode() for bundled WASM.");
    initializeWasmNode();
    sendResponse({ status: "Bundled WASM initialization started."});
  }
  return true;
});

// Signal readiness (and COI status) to background
chrome.runtime.sendMessage({ type: "OFFSCREEN_READY_ACK" });
