// background.js
const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

async function hasOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });
  return existingContexts.length > 0;
}

async function setupOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }
  
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_PATH,
    reasons: ['WORKERS'],
    justification: 'Required for cross-origin isolated WASM threading'
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "INIT_WASM_REQUEST") {
    console.log("Background: Received INIT_WASM_REQUEST");
    
    try {
      await setupOffscreenDocument();
      console.log("Background: Offscreen document setup complete");
      
      // Forward the request to the offscreen document
      chrome.runtime.sendMessage({ type: "INIT_WASM_IN_OFFSCREEN" });
      
    } catch (error) {
      console.error("Background: Error setting up offscreen document:", error);
      chrome.runtime.sendMessage({ 
        type: "NODE_ERROR_UPDATE", 
        payload: `Setup Error: ${error.message}` 
      });
    }
  }
  
  // Forward status updates from offscreen to sidebar
  if (message.type === "NODE_STATUS_UPDATE" || message.type === "NODE_ERROR_UPDATE") {
    chrome.runtime.sendMessage(message);
  }
});
