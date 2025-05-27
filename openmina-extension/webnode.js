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

      this.updateStatus('initializing', 'Initializing dedicated worker...');
      this.log('Creating dedicated worker for OpenMina WASM...', 'info');

      // Create dedicated worker (like Angular frontend)
      await this.initializeWorker();

      // Set up tab close protection
      this.setupTabProtection();

    } catch (error) {
      console.error('Error starting node:', error);
      this.log(`❌ Failed to start node: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to start node: ' + error.message);
      this.notifyBackgroundError(error.message);
    }
  }

  async initializeWorker() {
    try {
      this.log('Creating WebNode worker...', 'info');

      // Create the worker
      this.worker = new Worker(chrome.runtime.getURL('webnode-worker.js'));

      // Set up worker message handling
      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.log(`❌ Worker error: ${error.message}`, 'error');
        this.updateStatus('error', 'Worker error: ' + error.message);
      };

      this.log('✅ Worker created successfully', 'success');

      // Initialize WASM in worker
      this.updateStatus('initializing', 'Loading OpenMina WASM in worker...');
      this.log('Initializing WASM in worker...', 'info');

      this.worker.postMessage({
        type: 'INIT_WASM',
        data: {}
      });

    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.log(`❌ Failed to initialize worker: ${error.message}`, 'error');
      throw error;
    }
  }

  handleWorkerMessage(message) {
    const { type, data, error, success } = message;
    console.log('[Main] Received worker message:', type);

    switch (type) {
      case 'WASM_INITIALIZED':
        if (success) {
          this.log('✅ WASM initialized in worker', 'success');
          this.startNodeInWorker();
        } else {
          this.log(`❌ WASM initialization failed: ${error}`, 'error');
          this.updateStatus('error', 'WASM initialization failed');
        }
        break;

      case 'NODE_STARTED':
        if (success) {
          this.log('🎉 OpenMina node started successfully in worker!', 'success');
          this.updateStatus('running', 'Node running and connected');

          // Notify background script
          chrome.runtime.sendMessage({ type: 'NODE_READY' });

          // Start status monitoring
          this.startStatusMonitoring();
        } else {
          this.log(`❌ Node start failed: ${error}`, 'error');
          this.updateStatus('error', 'Node start failed');
        }
        break;

      case 'STATUS_RESPONSE':
        if (data) {
          this.updateNodeInfo(data);
        }
        break;

      case 'ERROR':
        console.error('Worker error:', error);
        this.log(`❌ Worker error: ${error}`, 'error');
        this.updateStatus('error', 'Worker error: ' + error);
        break;

      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  async startNodeInWorker() {
    try {
      this.updateStatus('initializing', 'Starting OpenMina node...');
      this.log('Starting OpenMina node in worker...', 'info');

      // Load configuration
      const config = await this.loadConfiguration();
      this.log(`Using configuration: ${JSON.stringify(config)}`, 'info');

      // Send start command to worker
      this.worker.postMessage({
        type: 'START_NODE',
        data: config
      });

    } catch (error) {
      console.error('Failed to start node in worker:', error);
      this.log(`❌ Failed to start node: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to start node: ' + error.message);
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
        if (this.worker && this.nodeStatus === 'running') {
          // Request status from worker
          this.worker.postMessage({ type: 'GET_STATUS' });
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

    // Send status to background script
    chrome.runtime.sendMessage({
      type: 'NODE_STATUS',
      nodeInfo: {
        peers: peerCount,
        blockHeight: blockHeight,
        syncProgress: syncProgress,
        crossOriginIsolated: self.crossOriginIsolated
      }
    });

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

    if (this.worker) {
      try {
        // Stop node in worker
        this.worker.postMessage({ type: 'STOP_NODE' });
        // Terminate worker
        this.worker.terminate();
        this.worker = null;
      } catch (error) {
        console.log('Error during worker cleanup:', error);
      }
    }
  }
}

// Worker-based approach - no need for main thread WASM loading

// Wait for COI Service Worker to be ready before initializing
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[OpenMina] DOM loaded, starting diagnostics...');

  // Comprehensive diagnostics
  await runDiagnostics();

  // Wait for service worker to be ready
  await waitForServiceWorkerReady();

  console.log('[OpenMina] COI Service Worker ready, initializing OpenMina...');
  window.openMinaWebNode = new OpenMinaWebNode();
});

// Comprehensive diagnostics function
async function runDiagnostics() {
  console.log('=== OPENMINA DIAGNOSTICS START ===');

  // 1. Check current page CSP
  console.log('[DIAG] 1. Checking current page CSP...');
  const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
  console.log('[DIAG] CSP meta tags found:', metaTags.length);
  metaTags.forEach((tag, index) => {
    console.log(`[DIAG] CSP meta tag ${index + 1}:`, tag.content);
  });

  // 2. Check computed CSP from browser
  console.log('[DIAG] 2. Checking browser-reported CSP...');
  try {
    // Try to access CSP via violation reporting
    const testScript = document.createElement('script');
    testScript.textContent = 'console.log("[DIAG] Test script executed - no CSP blocking")';
    document.head.appendChild(testScript);
    document.head.removeChild(testScript);
  } catch (error) {
    console.log('[DIAG] CSP blocked test script:', error);
  }

  // 3. Check cross-origin isolation
  console.log('[DIAG] 3. Cross-origin isolation status:');
  console.log('[DIAG] - crossOriginIsolated:', self.crossOriginIsolated);
  console.log('[DIAG] - SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined');

  // 4. Check service worker status
  console.log('[DIAG] 4. Service Worker status:');
  if ('serviceWorker' in navigator) {
    console.log('[DIAG] - Service Worker supported: YES');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      console.log('[DIAG] - Current registration:', registration);
      if (registration) {
        console.log('[DIAG] - Registration scope:', registration.scope);
        console.log('[DIAG] - Active worker:', registration.active);
        console.log('[DIAG] - Installing worker:', registration.installing);
        console.log('[DIAG] - Waiting worker:', registration.waiting);
      }
      console.log('[DIAG] - Controller:', navigator.serviceWorker.controller);
    } catch (error) {
      console.log('[DIAG] - Error getting registration:', error);
    }
  } else {
    console.log('[DIAG] - Service Worker supported: NO');
  }

  // 5. Check extension context
  console.log('[DIAG] 5. Extension context:');
  console.log('[DIAG] - chrome.runtime available:', typeof chrome !== 'undefined' && chrome.runtime);
  console.log('[DIAG] - Extension ID:', chrome?.runtime?.id);
  console.log('[DIAG] - Current URL:', window.location.href);

  // 6. Check WASM support
  console.log('[DIAG] 6. WASM support:');
  console.log('[DIAG] - WebAssembly available:', typeof WebAssembly !== 'undefined');
  console.log('[DIAG] - WebAssembly.instantiateStreaming available:', typeof WebAssembly.instantiateStreaming !== 'undefined');

  // 7. Try to detect actual CSP policy
  console.log('[DIAG] 7. Attempting to detect active CSP policy...');
  try {
    // Create a test element to see what CSP is actually active
    const testDiv = document.createElement('div');
    testDiv.innerHTML = '<script>window.testCSPWorking = true;</script>';
    document.body.appendChild(testDiv);

    setTimeout(() => {
      console.log('[DIAG] - Inline script execution test:', window.testCSPWorking ? 'ALLOWED' : 'BLOCKED');
      document.body.removeChild(testDiv);
    }, 100);
  } catch (error) {
    console.log('[DIAG] - CSP test error:', error);
  }

  console.log('=== OPENMINA DIAGNOSTICS END ===');
}

// Function to wait for COI service worker to be ready
async function waitForServiceWorkerReady() {
  if (!('serviceWorker' in navigator)) {
    console.log('[OpenMina] Service Worker not supported, proceeding anyway...');
    return;
  }

  // Wait a bit for the service worker to register
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if we have cross-origin isolation
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    if (self.crossOriginIsolated) {
      console.log('[OpenMina] ✅ Cross-origin isolation achieved');
      return;
    }

    console.log(`[OpenMina] Waiting for cross-origin isolation... (attempt ${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    attempts++;
  }

  console.warn('[OpenMina] ⚠️ Cross-origin isolation not achieved, proceeding anyway...');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.openMinaWebNode) {
    window.openMinaWebNode.cleanup();
  }
});
