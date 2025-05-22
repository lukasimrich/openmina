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
