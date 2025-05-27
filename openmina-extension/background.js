// Background service worker for new tab management with COI service worker
class OpenMinaBackground {
  constructor() {
    this.nodeTabId = null;
    this.nodeStatus = 'offline';
    this.setupMessageHandlers();
    this.setupTabHandlers();
    this.setupStartupHandlers();
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  setupTabHandlers() {
    // Monitor tab closure
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      if (tabId === this.nodeTabId) {
        console.log('OpenMina node tab closed');
        this.nodeTabId = null;
        this.nodeStatus = 'offline';
        this.notifyStatusChange('offline', 'Node stopped (tab closed)');

        // Clear stored tab ID
        chrome.storage.local.set({ nodeTabId: null });
      }
    });

    // Monitor tab updates
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tabId === this.nodeTabId && changeInfo.status === 'complete') {
        console.log('OpenMina node tab loaded');
        this.nodeStatus = 'starting';
        this.notifyStatusChange('starting', 'Node initializing...');
      }
    });
  }

  setupStartupHandlers() {
    // Handle extension action click (for sidebar)
    chrome.action.onClicked.addListener(async (tab) => {
      console.log('Extension action clicked, opening sidebar');
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch (error) {
        console.error('Error opening sidebar:', error);
      }
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      console.log('Browser restarted, checking for existing node...');
      this.checkForExistingNode();
    });

    // Handle extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('Extension installed/updated:', details.reason);
      if (details.reason === 'install') {
        console.log('OpenMina extension installed successfully');
      }
    });
  }

  async checkForExistingNode() {
    try {
      const stored = await chrome.storage.local.get(['nodeTabId']);
      if (stored.nodeTabId) {
        try {
          // Check if the stored tab still exists
          await chrome.tabs.get(stored.nodeTabId);
          this.nodeTabId = stored.nodeTabId;
          this.nodeStatus = 'starting';
          console.log('Found existing node tab:', this.nodeTabId);
        } catch {
          // Tab doesn't exist anymore
          console.log('Stored tab no longer exists');
          await chrome.storage.local.set({ nodeTabId: null });
        }
      }
    } catch (error) {
      console.error('Error checking for existing node:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'START_NODE':
          const result = await this.startNode();
          sendResponse(result);
          break;

        case 'STOP_NODE':
          await this.stopNode();
          sendResponse({ success: true });
          break;

        case 'GET_NODE_STATUS':
          const status = await this.getNodeStatus();
          sendResponse(status);
          break;

        case 'NODE_TAB_LOADED':
          console.log('OpenMina node tab loaded');
          this.nodeStatus = 'ready';
          break;

        case 'NODE_READY':
          // Message from webnode tab when node is ready
          this.nodeStatus = 'online';
          this.notifyStatusChange('online', 'Node running');
          sendResponse({ success: true });
          break;

        case 'NODE_STATUS':
          // Regular status updates from webnode tab
          this.notifyStatusChange('online', 'Node running', message.nodeInfo);
          sendResponse({ success: true });
          break;

        case 'NODE_ERROR':
          // Error from webnode tab
          this.nodeStatus = 'offline';
          this.notifyStatusChange('offline', 'Node error: ' + message.error);
          sendResponse({ success: true });
          break;

        default:
          console.warn('Unknown message type:', message.type);
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    }
  }

  async startNode() {
    try {
      if (this.nodeTabId) {
        // Check if tab still exists
        try {
          await chrome.tabs.get(this.nodeTabId);
          console.log('Node tab already exists:', this.nodeTabId);
          return { success: true, tabId: this.nodeTabId };
        } catch {
          // Tab doesn't exist, create new one
          console.log('Previous tab no longer exists, creating new one');
          this.nodeTabId = null;
        }
      }

      // Create new node tab with COI service worker
      console.log('Creating new OpenMina node tab with COI service worker...');
      const tab = await chrome.tabs.create({
        url: chrome.runtime.getURL('webnode.html'),
        active: false, // Don't steal focus
        pinned: true   // Pin tab to keep it organized
      });

      this.nodeTabId = tab.id;
      this.nodeStatus = 'starting';

      // Store tab ID for recovery
      await chrome.storage.local.set({ nodeTabId: tab.id });

      console.log('Created node tab:', tab.id);
      return { success: true, tabId: tab.id };
    } catch (error) {
      console.error('Error starting node:', error);
      return { success: false, error: error.message };
    }
  }

  async stopNode() {
    if (this.nodeTabId) {
      try {
        console.log('Stopping node, removing tab:', this.nodeTabId);
        await chrome.tabs.remove(this.nodeTabId);
      } catch (error) {
        console.log('Tab already closed or error removing:', error);
      }

      this.nodeTabId = null;
      this.nodeStatus = 'offline';

      // Clear stored tab ID
      await chrome.storage.local.set({ nodeTabId: null });
    }
  }

  async getNodeStatus() {
    if (!this.nodeTabId) {
      return { running: false };
    }

    try {
      // Check if tab still exists
      const tab = await chrome.tabs.get(this.nodeTabId);
      return {
        running: true,
        tabId: this.nodeTabId,
        status: this.nodeStatus,
        url: tab.url
      };
    } catch {
      // Tab doesn't exist
      console.log('Node tab no longer exists');
      this.nodeTabId = null;
      this.nodeStatus = 'offline';
      await chrome.storage.local.set({ nodeTabId: null });
      return { running: false };
    }
  }

  notifyStatusChange(status, message, nodeInfo = null) {
    // Notify popup about status changes
    chrome.runtime.sendMessage({
      type: 'NODE_STATUS_UPDATE',
      status: status,
      message: message,
      nodeInfo: nodeInfo
    }).catch(() => {
      // Popup might not be open, ignore error
      console.log('Popup not open, status update not sent');
    });
  }
}

// Initialize background service
console.log('OpenMina background service worker starting...');
const openMinaBackground = new OpenMinaBackground();

// Check for existing node on startup
openMinaBackground.checkForExistingNode();
