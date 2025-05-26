// Extension popup logic
class OpenMinaPopup {
  constructor() {
    this.nodeTabId = null;
    this.nodeStatus = 'offline';
    this.initializeUI();
    this.checkNodeStatus();
  }

  initializeUI() {
    document.getElementById('startBtn').addEventListener('click', () => this.startNode());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopNode());
    document.getElementById('openDashboard').addEventListener('click', () => this.openDashboard());
  }

  async startNode() {
    try {
      this.updateStatus('starting', 'Starting node...');
      this.updateStartButton(true); // Disable while starting
      
      // Request background script to create node tab
      const response = await chrome.runtime.sendMessage({ 
        type: 'START_NODE' 
      });
      
      if (response.success) {
        this.nodeTabId = response.tabId;
        this.updateStatus('starting', 'Node initializing...');
        this.enableControls(true);
      } else {
        this.updateStatus('offline', 'Failed to start: ' + response.error);
        this.updateStartButton(false);
      }
    } catch (error) {
      console.error('Error starting node:', error);
      this.updateStatus('offline', 'Error: ' + error.message);
      this.updateStartButton(false);
    }
  }

  async stopNode() {
    try {
      this.updateStatus('offline', 'Stopping node...');
      
      await chrome.runtime.sendMessage({ 
        type: 'STOP_NODE' 
      });
      
      this.updateStatus('offline', 'Node stopped');
      this.enableControls(false);
      this.nodeTabId = null;
      this.clearNodeInfo();
    } catch (error) {
      console.error('Error stopping node:', error);
      this.updateStatus('offline', 'Error stopping node');
    }
  }

  async openDashboard() {
    if (this.nodeTabId) {
      try {
        await chrome.tabs.update(this.nodeTabId, { active: true });
        // Close popup after opening dashboard
        window.close();
      } catch (error) {
        console.error('Error opening dashboard:', error);
        // Tab might not exist anymore
        this.checkNodeStatus();
      }
    }
  }

  updateStatus(status, message) {
    const statusEl = document.getElementById('status');
    statusEl.className = `status ${status}`;
    statusEl.textContent = `Status: ${message}`;
    this.nodeStatus = status;
  }

  updateStartButton(disabled) {
    document.getElementById('startBtn').disabled = disabled;
  }

  enableControls(nodeRunning) {
    document.getElementById('startBtn').disabled = nodeRunning;
    document.getElementById('stopBtn').disabled = !nodeRunning;
    document.getElementById('openDashboard').disabled = !nodeRunning;
  }

  async checkNodeStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'GET_NODE_STATUS' 
      });
      
      if (response.running) {
        this.nodeTabId = response.tabId;
        this.updateStatus('online', 'Node running');
        this.enableControls(true);
        
        if (response.nodeInfo) {
          this.updateNodeInfo(response.nodeInfo);
        }
      } else {
        this.updateStatus('offline', 'Node offline');
        this.enableControls(false);
        this.clearNodeInfo();
      }
    } catch (error) {
      console.log('No existing node found or error checking status:', error);
      this.updateStatus('offline', 'Node offline');
      this.enableControls(false);
      this.clearNodeInfo();
    }
  }

  updateNodeInfo(info) {
    if (info) {
      document.getElementById('peerCount').textContent = info.peers || 0;
      document.getElementById('blockHeight').textContent = info.blockHeight || '-';
      document.getElementById('syncProgress').textContent = info.syncProgress ? `${info.syncProgress}%` : '-';
      document.getElementById('coiStatus').textContent = info.crossOriginIsolated ? '✅' : '❌';
    }
  }

  clearNodeInfo() {
    document.getElementById('peerCount').textContent = '0';
    document.getElementById('blockHeight').textContent = '-';
    document.getElementById('syncProgress').textContent = '-';
    document.getElementById('coiStatus').textContent = '-';
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.openMinaPopup = new OpenMinaPopup();
});

// Listen for status updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NODE_STATUS_UPDATE') {
    const popup = window.openMinaPopup;
    if (popup) {
      popup.updateStatus(message.status, message.message);
      if (message.nodeInfo) {
        popup.updateNodeInfo(message.nodeInfo);
      }
      
      // Update controls based on status
      if (message.status === 'online') {
        popup.enableControls(true);
      } else if (message.status === 'offline') {
        popup.enableControls(false);
        popup.clearNodeInfo();
      }
    }
  }
  sendResponse({ received: true });
});
