# OpenMina Chrome Extension: Detailed Implementation Plan

_Created: December 19, 2024_

## Overview

This document outlines the detailed implementation plan for creating a Chrome extension that opens a new tab with the exact working OpenMina webnode environment, providing full cross-origin isolation and threading support.

## Architecture Summary

```
Chrome Extension
├── Extension Popup (Control Interface)
│   ├── popup.html - User interface
│   ├── popup.js - Tab management logic
│   └── Extension APIs access
├── Background Service Worker
│   ├── background.js - Tab lifecycle management
│   ├── Auto-recovery logic
│   └── State persistence
└── New Tab (OpenMina Environment)
    ├── webnode.html - Replicates working index.html
    ├── webnode.js - Replicates WebNodeService logic
    ├── Cross-origin isolation (COOP/COEP)
    ├── SharedArrayBuffer support
    └── assets/webnode/ - Exact OpenMina asset structure
```

## Phase 1: Extension Structure & New Tab Setup

### 1.1 Create manifest.json

**File:** `manifest.json`

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
  
  "web_accessible_resources": [{
    "resources": ["webnode.html", "assets/webnode/**/*"],
    "matches": ["<all_urls>"]
  }],
  
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

**Key Features:**
- ✅ Cross-origin isolation via COOP/COEP headers
- ✅ Minimal permissions (tabs, storage)
- ✅ Web accessible resources for all OpenMina assets

### 1.2 Create Extension Popup Interface

**File:** `popup.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OpenMina Node</title>
  <style>
    body { width: 300px; font-family: sans-serif; padding: 16px; }
    .status { margin: 12px 0; padding: 8px; border-radius: 4px; }
    .status.offline { background: #fee; color: #c33; }
    .status.starting { background: #fef; color: #a60; }
    .status.online { background: #efe; color: #060; }
    button { width: 100%; padding: 8px; margin: 4px 0; }
    .node-info { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h3>OpenMina Node</h3>
  
  <div id="status" class="status offline">
    Status: Offline
  </div>
  
  <button id="startBtn">Start Node</button>
  <button id="stopBtn" disabled>Stop Node</button>
  <button id="openDashboard" disabled>Open Dashboard</button>
  
  <div class="node-info">
    <div>Peers: <span id="peerCount">0</span></div>
    <div>Block Height: <span id="blockHeight">-</span></div>
    <div>Sync Progress: <span id="syncProgress">-</span></div>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>
```

**File:** `popup.js`

```javascript
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
      }
    } catch (error) {
      this.updateStatus('offline', 'Error: ' + error.message);
    }
  }

  async stopNode() {
    try {
      await chrome.runtime.sendMessage({ 
        type: 'STOP_NODE' 
      });
      this.updateStatus('offline', 'Node stopped');
      this.enableControls(false);
      this.nodeTabId = null;
    } catch (error) {
      console.error('Error stopping node:', error);
    }
  }

  async openDashboard() {
    if (this.nodeTabId) {
      await chrome.tabs.update(this.nodeTabId, { active: true });
    }
  }

  updateStatus(status, message) {
    const statusEl = document.getElementById('status');
    statusEl.className = `status ${status}`;
    statusEl.textContent = `Status: ${message}`;
    this.nodeStatus = status;
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
        this.updateNodeInfo(response.nodeInfo);
      }
    } catch (error) {
      console.log('No existing node found');
    }
  }

  updateNodeInfo(info) {
    if (info) {
      document.getElementById('peerCount').textContent = info.peers || 0;
      document.getElementById('blockHeight').textContent = info.blockHeight || '-';
      document.getElementById('syncProgress').textContent = info.syncProgress || '-';
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OpenMinaPopup();
});

// Listen for status updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NODE_STATUS_UPDATE') {
    // Update UI with node status
    const popup = window.openMinaPopup;
    if (popup) {
      popup.updateStatus(message.status, message.message);
      if (message.nodeInfo) {
        popup.updateNodeInfo(message.nodeInfo);
      }
    }
  }
});
```

### 1.3 Create Background Service Worker

**File:** `background.js`

```javascript
// Background service worker for tab lifecycle management
class OpenMinaBackground {
  constructor() {
    this.nodeTabId = null;
    this.nodeStatus = 'offline';
    this.setupMessageHandlers();
    this.setupTabHandlers();
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

        default:
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
          return { success: true, tabId: this.nodeTabId };
        } catch {
          // Tab doesn't exist, create new one
          this.nodeTabId = null;
        }
      }

      // Create new node tab
      const tab = await chrome.tabs.create({
        url: chrome.runtime.getURL('webnode.html'),
        active: false, // Don't steal focus
        pinned: true   // Pin tab to keep it organized
      });

      this.nodeTabId = tab.id;
      this.nodeStatus = 'starting';

      return { success: true, tabId: tab.id };
    } catch (error) {
      console.error('Error starting node:', error);
      return { success: false, error: error.message };
    }
  }

  async stopNode() {
    if (this.nodeTabId) {
      try {
        await chrome.tabs.remove(this.nodeTabId);
      } catch (error) {
        console.log('Tab already closed or error removing:', error);
      }
      this.nodeTabId = null;
      this.nodeStatus = 'offline';
    }
  }

  async getNodeStatus() {
    if (!this.nodeTabId) {
      return { running: false };
    }

    try {
      // Check if tab still exists
      await chrome.tabs.get(this.nodeTabId);
      return { 
        running: true, 
        tabId: this.nodeTabId,
        status: this.nodeStatus
      };
    } catch {
      // Tab doesn't exist
      this.nodeTabId = null;
      this.nodeStatus = 'offline';
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
    });
  }
}

// Initialize background service
const openMinaBackground = new OpenMinaBackground();
```

### 1.4 Create WebNode Tab (OpenMina Environment)

**File:** `webnode.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>OpenMina Node (Keep Open)</title>
  <style>
    body { 
      font-family: sans-serif; 
      margin: 20px; 
      background: #f5f5f5; 
    }
    .container { 
      max-width: 800px; 
      margin: 0 auto; 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
    }
    .status { 
      padding: 12px; 
      margin: 12px 0; 
      border-radius: 4px; 
      font-weight: bold; 
    }
    .status.initializing { background: #fff3cd; color: #856404; }
    .status.running { background: #d4edda; color: #155724; }
    .status.error { background: #f8d7da; color: #721c24; }
    .warning { 
      background: #fff3cd; 
      border: 1px solid #ffeaa7; 
      padding: 12px; 
      border-radius: 4px; 
      margin: 12px 0; 
    }
    .node-info { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 12px; 
      margin: 16px 0; 
    }
    .info-card { 
      background: #f8f9fa; 
      padding: 12px; 
      border-radius: 4px; 
    }
    .info-label { 
      font-size: 12px; 
      color: #666; 
      text-transform: uppercase; 
    }
    .info-value { 
      font-size: 18px; 
      font-weight: bold; 
      color: #333; 
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔗 OpenMina Web Node</h1>
    
    <div class="warning">
      ⚠️ <strong>Important:</strong> Keep this tab open for your OpenMina node to run. 
      Closing this tab will stop the node.
    </div>
    
    <div id="status" class="status initializing">
      Initializing OpenMina node...
    </div>
    
    <div class="node-info">
      <div class="info-card">
        <div class="info-label">Cross-Origin Isolation</div>
        <div class="info-value" id="coiStatus">Checking...</div>
      </div>
      <div class="info-card">
        <div class="info-label">SharedArrayBuffer</div>
        <div class="info-value" id="sabStatus">Checking...</div>
      </div>
      <div class="info-card">
        <div class="info-label">Connected Peers</div>
        <div class="info-value" id="peerCount">0</div>
      </div>
      <div class="info-card">
        <div class="info-label">Block Height</div>
        <div class="info-value" id="blockHeight">-</div>
      </div>
      <div class="info-card">
        <div class="info-label">Sync Progress</div>
        <div class="info-value" id="syncProgress">0%</div>
      </div>
      <div class="info-card">
        <div class="info-label">Node Status</div>
        <div class="info-value" id="nodeStatus">Starting...</div>
      </div>
    </div>
    
    <div id="logs" style="background: #f8f9fa; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto;">
      <div>OpenMina node starting...</div>
    </div>
  </div>

  <!-- Exact same loading mechanism as working implementation -->
  <script type="module" defer>
    // Replicate exact working loading pattern
    window.addEventListener('startWebNode', () => {
      import(chrome.runtime.getURL('assets/webnode/pkg/openmina_node_web.js'))
        .then((v) => {
          window.webnode = v;
          window.dispatchEvent(new CustomEvent('webNodeLoaded'));
        })
        .catch((error) => {
          console.error('Failed to load OpenMina WASM:', error);
          updateStatus('error', 'Failed to load OpenMina WASM: ' + error.message);
        });
    });
  </script>
  
  <script src="webnode.js"></script>
</body>
</html>
```

## Phase 2: OpenMina Asset Integration & Loading

### 2.1 Asset Structure Setup

**Directory Structure:**
```
extension/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── webnode.html
├── webnode.js
└── assets/
    └── webnode/
        ├── pkg/
        │   ├── openmina_node_web.js
        │   ├── openmina_node_web_bg.wasm
        │   └── snippets/
        │       ├── p2p-d8c981af5e1bb8c5/
        │       │   └── worker.js
        │       └── wasm_thread-8ee53d0673203880/
        │           └── worker.js
        ├── circuit-blobs/
        │   └── 3.0.1devnet/
        │       ├── block_verifier_index.postcard
        │       ├── transaction_verifier_index.postcard
        │       └── ... (other circuit files)
        └── web-node-secrets.json
```

### 2.2 WebNode Logic Implementation

**File:** `webnode.js`

```javascript
// WebNode tab logic - replicates WebNodeService
class OpenMinaWebNode {
  constructor() {
    this.nodeStatus = 'initializing';
    this.rpc = null;
    this.statusInterval = null;
    
    this.initializeEnvironment();
    this.startNode();
  }

  initializeEnvironment() {
    // Check cross-origin isolation
    const coiStatus = self.crossOriginIsolated;
    document.getElementById('coiStatus').textContent = coiStatus ? '✅ Enabled' : '❌ Disabled';
    
    // Check SharedArrayBuffer
    const sabStatus = typeof SharedArrayBuffer !== 'undefined';
    document.getElementById('sabStatus').textContent = sabStatus ? '✅ Available' : '❌ Not Available';
    
    if (!coiStatus || !sabStatus) {
      this.updateStatus('error', 'Cross-origin isolation or SharedArrayBuffer not available');
      return false;
    }
    
    this.log('Environment checks passed');
    return true;
  }

  async startNode() {
    try {
      if (!this.initializeEnvironment()) {
        return;
      }

      this.updateStatus('initializing', 'Loading OpenMina WASM...');
      
      // Trigger the same loading sequence as working implementation
      window.dispatchEvent(new CustomEvent('startWebNode'));
      
      // Wait for webnode loaded event
      window.addEventListener('webNodeLoaded', () => {
        this.onWebNodeLoaded();
      });

      // Set up tab close protection
      this.setupTabProtection();
      
    } catch (error) {
      console.error('Error starting node:', error);
      this.updateStatus('error', 'Failed to start node: ' + error.message);
    }
  }

  async onWebNodeLoaded() {
    try {
      this.log('OpenMina WASM loaded, initializing...');
      
      // Replicate exact WebNodeService memory configuration
      const memory = {
        initial: 32,    // 32 pages (2MB)
        maximum: 65536, // 65536 pages (4GB)
        shared: true    // Critical for threading
      };

      const wasm = window.webnode;
      
      // Initialize WASM module
      await wasm.default(undefined, new WebAssembly.Memory(memory));
      this.log('WASM module initialized');
      
      // Load configuration
      const config = await this.loadConfiguration();
      
      // Start the node with same configuration as working implementation
      this.log('Starting OpenMina node...');
      this.rpc = await wasm.run(
        config.blockProducerKey, // null for non-block-producing node
        config.seedNodesUrl,
        config.genesisConfigUrl
      );
      
      this.log('OpenMina node started successfully!');
      this.updateStatus('running', 'Node running and connected');
      
      // Notify background script
      chrome.runtime.sendMessage({ 
        type: 'NODE_READY' 
      });
      
      // Start status monitoring
      this.startStatusMonitoring();
      
    } catch (error) {
      console.error('Error initializing node:', error);
      this.updateStatus('error', 'Failed to initialize: ' + error.message);
    }
  }

  async loadConfiguration() {
    try {
      // Load configuration from web-node-secrets.json
      const response = await fetch(chrome.runtime.getURL('assets/webnode/web-node-secrets.json'));
      const config = await response.json();
      
      return {
        blockProducerKey: null, // No block production for MVP
        seedNodesUrl: 'https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt',
        genesisConfigUrl: null // Use default
      };
    } catch (error) {
      this.log('Using default configuration');
      return {
        blockProducerKey: null,
        seedNodesUrl: 'https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt',
        genesisConfigUrl: null
      };
    }
  }

  startStatusMonitoring() {
    this.statusInterval = setInterval(async () => {
      try {
        if (this.rpc) {
          const status = await this.rpc.status();
          this.updateNodeInfo(status);
          
          // Send status to background script
          chrome.runtime.sendMessage({
            type: 'NODE_STATUS',
            nodeInfo: {
              peers: status.peers?.length || 0,
              blockHeight: status.transition_frontier?.best_tip?.blockchain_length || 0,
              syncProgress: this.calculateSyncProgress(status)
            }
          });
        }
      } catch (error) {
        console.error('Error getting node status:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  updateNodeInfo(status) {
    const peerCount = status.peers?.length || 0;
    const blockHeight = status.transition_frontier?.best_tip?.blockchain_length || 0;
    const syncProgress = this.calculateSyncProgress(status);
    
    document.getElementById('peerCount').textContent = peerCount;
    document.getElementById('blockHeight').textContent = blockHeight;
    document.getElementById('syncProgress').textContent = syncProgress + '%';
    document.getElementById('nodeStatus').textContent = 'Running';
  }

  calculateSyncProgress(status) {
    if (!status || !status.transition_frontier) {
      return 0;
    }
    
    const bestTip = status.transition_frontier.best_tip;
    if (!bestTip) {
      return 0;
    }
    
    const currentHeight = bestTip.blockchain_length;
    const maxHeight = status.transition_frontier.max_observed_height || currentHeight;
    
    return Math.min(100, Math.round((currentHeight / maxHeight) * 100));
  }

  setupTabProtection() {
    // Warn user before closing tab
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      event.returnValue = 'Closing this tab will stop your OpenMina node. Are you sure?';
      return 'Closing this tab will stop your OpenMina node. Are you sure?';
    });
  }

  updateStatus(status, message) {
    const statusEl = document.getElementById('status');
    statusEl.className = `status ${status}`;
    statusEl.textContent = message;
    this.nodeStatus = status;
    this.log(`Status: ${message}`);
  }

  log(message) {
    const logsEl = document.getElementById('logs');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${timestamp}] ${message}`;
    logsEl.appendChild(logEntry);
    logsEl.scrollTop = logsEl.scrollHeight;
    console.log(`[OpenMina] ${message}`);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OpenMinaWebNode();
});
```

## Phase 3: Tab Lifecycle & Communication

### 3.1 Auto-Recovery Implementation

**Enhanced background.js additions:**

```javascript
// Add to OpenMinaBackground class
async setupAutoRecovery() {
  // Check for existing node state on startup
  const stored = await chrome.storage.local.get(['nodeTabId', 'autoRestart']);
  
  if (stored.autoRestart && stored.nodeTabId) {
    // Try to recover existing tab
    try {
      await chrome.tabs.get(stored.nodeTabId);
      this.nodeTabId = stored.nodeTabId;
      this.nodeStatus = 'starting';
    } catch {
      // Tab doesn't exist, auto-restart if enabled
      this.log('Previous node tab not found, auto-restarting...');
      await this.startNode();
    }
  }
}

async enableAutoRestart(enabled) {
  await chrome.storage.local.set({ autoRestart: enabled });
  if (enabled && this.nodeTabId) {
    await chrome.storage.local.set({ nodeTabId: this.nodeTabId });
  }
}
```

### 3.2 State Persistence

**Enhanced webnode.js additions:**

```javascript
// Add to OpenMinaWebNode class
async saveState() {
  if (this.rpc) {
    try {
      const status = await this.rpc.status();
      const state = {
        timestamp: Date.now(),
        peers: status.peers?.length || 0,
        blockHeight: status.transition_frontier?.best_tip?.blockchain_length || 0,
        syncProgress: this.calculateSyncProgress(status)
      };
      
      await chrome.storage.local.set({ nodeState: state });
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }
}

async loadState() {
  try {
    const stored = await chrome.storage.local.get(['nodeState']);
    if (stored.nodeState) {
      this.log(`Restored state: Block ${stored.nodeState.blockHeight}, ${stored.nodeState.peers} peers`);
      return stored.nodeState;
    }
  } catch (error) {
    console.error('Error loading state:', error);
  }
  return null;
}
```

## Testing Strategy

### Phase 1 Testing
1. **Extension Installation**: Verify extension loads without errors
2. **Popup Interface**: Test all buttons and UI interactions
3. **Tab Creation**: Verify new tab opens with correct URL
4. **Cross-Origin Isolation**: Verify `self.crossOriginIsolated === true`
5. **SharedArrayBuffer**: Verify `typeof SharedArrayBuffer !== 'undefined'`

### Phase 2 Testing
1. **Asset Loading**: Verify all OpenMina assets load correctly
2. **WASM Initialization**: Test WASM module loading and initialization
3. **Node Startup**: Verify OpenMina node starts and connects to peers
4. **P2P Connectivity**: Test peer discovery and connection
5. **Status Updates**: Verify status information flows correctly

### Phase 3 Testing
1. **Tab Recovery**: Test auto-recovery after accidental tab closure
2. **Browser Restart**: Test behavior after browser restart
3. **State Persistence**: Verify state is saved and restored correctly
4. **Communication**: Test popup ↔ webnode tab communication
5. **Error Handling**: Test various error scenarios

## Success Criteria

### MVP Success Criteria
- ✅ Extension installs and loads without errors
- ✅ Cross-origin isolation is achieved (`self.crossOriginIsolated === true`)
- ✅ SharedArrayBuffer is available for threading
- ✅ OpenMina WASM loads and initializes successfully
- ✅ Node connects to at least one peer
- ✅ Basic status information is displayed in popup
- ✅ Tab close protection warns user appropriately

### Full Success Criteria
- ✅ All MVP criteria met
- ✅ Node successfully syncs blockchain data
- ✅ Auto-recovery works after tab/browser closure
- ✅ State persistence maintains progress across sessions
- ✅ Communication between popup and node tab is reliable
- ✅ User experience is intuitive and informative

## Risk Mitigation

### High-Risk Items
1. **Cross-Origin Isolation Failure**: Comprehensive testing of COOP/COEP headers
2. **WASM Loading Issues**: Exact replication of working asset structure
3. **Threading Problems**: Thorough testing of SharedArrayBuffer functionality
4. **User Accidentally Closes Tab**: Clear warnings and auto-recovery

### Contingency Plans
1. **Fallback UI**: If node fails, provide clear error messages and recovery options
2. **Asset Fallbacks**: Include multiple versions of critical assets if needed
3. **Progressive Enhancement**: Start with basic functionality, add features incrementally
4. **User Education**: Clear documentation and onboarding for tab management

## Timeline Estimate

- **Phase 1**: 2-3 days (Extension structure and basic tab creation)
- **Phase 2**: 3-4 days (OpenMina integration and testing)
- **Phase 3**: 2-3 days (Lifecycle management and polish)
- **Testing & Refinement**: 2-3 days
- **Total**: 9-13 days for MVP

This plan provides a comprehensive roadmap for implementing the OpenMina Chrome extension using the new tab approach with full cross-origin isolation support.
