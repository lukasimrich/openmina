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
  console.log("Offscreen: Attempting to initialize BUNDLED WASM...");
  try {
    // Load the bundled module that contains everything pre-resolved
    const script = document.createElement('script');
    script.type = 'module';
    script.src = chrome.runtime.getURL('dist/bundle.js');
    console.log("Offscreen: Created script element with src:", script.src);

    // Listen for initialization completion from the bundled module
    window.addEventListener('openmina-ready', (event) => {
      console.log("OpenMina bundled module initialized successfully");
      console.log("Event detail:", event.detail);
      console.log("Event detail RpcSender:", event.detail.rpcSender);
      console.log("Event detail buildEnv:", event.detail.buildEnv);
      chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "WASM bundled module loaded" });

      // Access the initialized WASM functions
      if (window.openminaNode) {
        console.log("=== WASM OBJECT INSPECTION ===");
        console.log("window.openminaNode:", window.openminaNode);
        console.log("Type:", typeof window.openminaNode);
        console.log("Constructor:", window.openminaNode.constructor.name);
        console.log("Own properties:", Object.getOwnPropertyNames(window.openminaNode));
        console.log("Prototype:", Object.getPrototypeOf(window.openminaNode));
        console.log("Prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(window.openminaNode)));

        // Check all methods and properties
        const allKeys = [...Object.getOwnPropertyNames(window.openminaNode), ...Object.getOwnPropertyNames(Object.getPrototypeOf(window.openminaNode))];
        const uniqueKeys = [...new Set(allKeys)];
        console.log("All available keys:", uniqueKeys);

        uniqueKeys.forEach(key => {
          try {
            const value = window.openminaNode[key];
            console.log(`- ${key}: ${typeof value} ${typeof value === 'function' ? '(function)' : ''}`);
          } catch (e) {
            console.log(`- ${key}: (error accessing: ${e.message})`);
          }
        });

        console.log("=== END WASM OBJECT INSPECTION ===");
        chrome.runtime.sendMessage({ type: "NODE_STATUS_UPDATE", payload: "WASM object loaded and inspected" });
      } else {
        console.error("OpenMina node not available on window object");
        chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: "Node not available after bundle load" });
      }
    });

    // Handle initialization errors
    window.addEventListener('openmina-error', (event) => {
      console.error("OpenMina bundled module initialization failed:", event.detail);
      chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: `Bundle Init Error: ${event.detail}` });
    });

    console.log("Offscreen: Appending script to document head...");
    document.head.appendChild(script);
    console.log("Bundled WASM script injected, waiting for initialization...");

  } catch (error) {
    console.error("Error during BUNDLED WASM loading:", error);
    console.error("Error stack:", error.stack);
    chrome.runtime.sendMessage({ type: "NODE_ERROR_UPDATE", payload: `Bundle Load Error: ${error.message}` });
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
