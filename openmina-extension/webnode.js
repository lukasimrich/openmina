// WebNode tab logic - replicates WebNodeService
class OpenMinaWebNode {
  constructor() {
    this.nodeStatus = 'initializing';
    this.rpc = null;
    this.statusInterval = null;
    this.logCount = 0;
    
    this.initializeEnvironment();
    this.startNode();
  }

  initializeEnvironment() {
    this.log('Checking browser environment...', 'info');
    
    // Check cross-origin isolation
    const coiStatus = self.crossOriginIsolated;
    const coiElement = document.getElementById('coiStatus');
    coiElement.textContent = coiStatus ? '✅ Enabled' : '❌ Disabled';
    coiElement.className = `info-value ${coiStatus ? 'success' : 'error'}`;
    
    // Check SharedArrayBuffer
    const sabStatus = typeof SharedArrayBuffer !== 'undefined';
    const sabElement = document.getElementById('sabStatus');
    sabElement.textContent = sabStatus ? '✅ Available' : '❌ Not Available';
    sabElement.className = `info-value ${sabStatus ? 'success' : 'error'}`;
    
    if (!coiStatus) {
      this.log('❌ Cross-origin isolation is not enabled', 'error');
      this.updateStatus('error', 'Cross-origin isolation not available - threading disabled');
      return false;
    }
    
    if (!sabStatus) {
      this.log('❌ SharedArrayBuffer is not available', 'error');
      this.updateStatus('error', 'SharedArrayBuffer not available - threading disabled');
      return false;
    }
    
    this.log('✅ Environment checks passed - threading enabled', 'success');
    return true;
  }

  async startNode() {
    try {
      if (!this.initializeEnvironment()) {
        this.notifyBackgroundError('Environment checks failed');
        return;
      }

      this.updateStatus('initializing', 'Loading OpenMina WASM...');
      this.log('Loading OpenMina WASM module...', 'info');
      
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
      this.log(`❌ Failed to start node: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to start node: ' + error.message);
      this.notifyBackgroundError(error.message);
    }
  }

  async onWebNodeLoaded() {
    try {
      this.log('✅ OpenMina WASM loaded successfully', 'success');
      this.log('Initializing WASM module...', 'info');
      
      // Replicate exact WebNodeService memory configuration
      const memory = {
        initial: 32,    // 32 pages (2MB)
        maximum: 65536, // 65536 pages (4GB)
        shared: true    // Critical for threading
      };

      const wasm = window.webnode;
      
      // Initialize WASM module
      this.log('Creating WebAssembly memory...', 'info');
      await wasm.default(undefined, new WebAssembly.Memory(memory));
      this.log('✅ WASM module initialized', 'success');
      
      // Load configuration
      const config = await this.loadConfiguration();
      this.log(`Using configuration: ${JSON.stringify(config)}`, 'info');
      
      // Start the node with same configuration as working implementation
      this.log('🚀 Starting OpenMina node...', 'info');
      this.updateStatus('initializing', 'Starting OpenMina node...');
      
      this.rpc = await wasm.run(
        config.blockProducerKey, // null for non-block-producing node
        config.seedNodesUrl,
        config.genesisConfigUrl
      );
      
      this.log('🎉 OpenMina node started successfully!', 'success');
      this.updateStatus('running', 'Node running and connected');
      
      // Notify background script
      chrome.runtime.sendMessage({ 
        type: 'NODE_READY' 
      });
      
      // Start status monitoring
      this.startStatusMonitoring();
      
    } catch (error) {
      console.error('Error initializing node:', error);
      this.log(`❌ Failed to initialize: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to initialize: ' + error.message);
      this.notifyBackgroundError(error.message);
    }
  }

  async loadConfiguration() {
    try {
      this.log('Loading node configuration...', 'info');
      
      // Try to load configuration from web-node-secrets.json
      const response = await fetch(chrome.runtime.getURL('assets/webnode/web-node-secrets.json'));
      if (response.ok) {
        const config = await response.json();
        this.log('✅ Configuration loaded from web-node-secrets.json', 'success');
        return {
          blockProducerKey: config.blockProducerKey || null,
          seedNodesUrl: config.seedNodesUrl || 'https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt',
          genesisConfigUrl: config.genesisConfigUrl || null
        };
      }
    } catch (error) {
      this.log(`⚠️ Could not load configuration file: ${error.message}`, 'warning');
    }
    
    // Use default configuration
    this.log('Using default configuration', 'info');
    return {
      blockProducerKey: null, // No block production for MVP
      seedNodesUrl: 'https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt',
      genesisConfigUrl: null // Use default
    };
  }

  startStatusMonitoring() {
    this.log('Starting status monitoring...', 'info');
    
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
              syncProgress: this.calculateSyncProgress(status),
              crossOriginIsolated: self.crossOriginIsolated
            }
          });
        }
      } catch (error) {
        console.error('Error getting node status:', error);
        this.log(`⚠️ Status update error: ${error.message}`, 'warning');
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
    
    // Update progress bar
    const progressBar = document.getElementById('syncProgressBar');
    progressBar.style.width = syncProgress + '%';
    
    // Log significant changes
    if (peerCount > 0) {
      this.log(`📡 Connected to ${peerCount} peer(s)`, 'success');
    }
    
    if (blockHeight > 0) {
      this.log(`📦 Current block height: ${blockHeight}`, 'info');
    }
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
    
    if (maxHeight === 0) return 0;
    
    return Math.min(100, Math.round((currentHeight / maxHeight) * 100));
  }

  setupTabProtection() {
    // Warn user before closing tab
    window.addEventListener('beforeunload', (event) => {
      if (this.nodeStatus === 'running') {
        const message = 'Closing this tab will stop your OpenMina node and disconnect from the network. Are you sure?';
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    });
  }

  updateStatus(status, message) {
    const statusEl = document.getElementById('status');
    statusEl.className = `status ${status}`;
    statusEl.textContent = message;
    this.nodeStatus = status;
    this.log(`Status: ${message}`, status === 'error' ? 'error' : 'info');
  }

  log(message, type = 'info') {
    const logsEl = document.getElementById('logs');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    logsEl.appendChild(logEntry);
    
    // Keep only last 100 log entries
    this.logCount++;
    if (this.logCount > 100) {
      logsEl.removeChild(logsEl.firstChild);
      this.logCount--;
    }
    
    // Auto-scroll to bottom
    logsEl.scrollTop = logsEl.scrollHeight;
    
    // Also log to console
    console.log(`[OpenMina] ${message}`);
  }

  notifyBackgroundError(error) {
    chrome.runtime.sendMessage({
      type: 'NODE_ERROR',
      error: error
    }).catch(() => {
      console.log('Could not notify background script of error');
    });
  }

  // Cleanup when tab is being closed
  cleanup() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    
    if (this.rpc) {
      try {
        // Attempt graceful shutdown
        this.rpc.stop();
      } catch (error) {
        console.log('Error during cleanup:', error);
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.openMinaWebNode = new OpenMinaWebNode();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.openMinaWebNode) {
    window.openMinaWebNode.cleanup();
  }
});
