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
