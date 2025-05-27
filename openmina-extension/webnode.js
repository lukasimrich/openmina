// WebNode tab logic - replicates Angular WebNodeService exactly
class OpenMinaWebNode {
  constructor() {
    this.nodeStatus = 'initializing';
    this.rpc = null;
    this.wasmModule = null;
    this.statusInterval = null;
    this.logCount = 0;

    // Replicate exact Angular pattern
    this.initializeEnvironment();
    this.loadWasm();
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

  // Replicate exact Angular WebNodeService.loadWasm$() pattern
  async loadWasm() {
    try {
      if (!this.initializeEnvironment()) {
        this.notifyBackgroundError('Environment checks failed');
        return;
      }

      // Log environment details for debugging
      this.logEnvironmentDetails();

      this.updateStatus('initializing', 'Loading OpenMina WASM module...');
      this.log('🔄 Loading WASM module (Angular pattern)...', 'info');

      // EXACT Angular pattern: dynamic import in main thread
      this.log('📦 Importing ./assets/webnode/pkg/openmina_node_web.js...', 'info');
      const wasmModule = await import('./assets/webnode/pkg/openmina_node_web.js');

      this.log('✅ WASM module imported successfully', 'success');

      // Log WASM module details for debugging
      this.logWasmModuleDetails(wasmModule);

      // Store globally like Angular: window.webnode = v
      window.webnode = wasmModule;
      this.wasmModule = wasmModule;

      // Trigger webNodeLoaded event like Angular
      this.log('📡 Dispatching webNodeLoaded event...', 'info');
      window.dispatchEvent(new CustomEvent('webNodeLoaded'));

      // Now start WASM like Angular WebNodeService.startWasm$()
      await this.startWasm();

    } catch (error) {
      console.error('Error loading WASM:', error);
      this.log(`❌ Failed to load WASM: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to load WASM: ' + error.message);
      this.notifyBackgroundError(error.message);
    }
  }

  // Replicate exact Angular WebNodeService.startWasm$() pattern
  async startWasm() {
    try {
      this.updateStatus('initializing', 'Initializing WASM...');
      this.log('🚀 Starting WASM (Angular WebNodeService.startWasm$() pattern)...', 'info');

      // Get the WASM module (should be available from loadWasm)
      const wasm = window.webnode;
      if (!wasm) {
        throw new Error('WASM module not loaded - window.webnode is undefined');
      }

      this.log('📋 WASM module available, initializing...', 'info');

      // EXACT Angular memory configuration
      const memory = {
        initial: 32,    // 32 pages (2MB)
        maximum: 65536, // 65536 pages (4GB)
        shared: true    // Critical for threading
      };

      this.log('🧠 Creating WebAssembly.Memory with Angular config...', 'info');
      this.log(`Memory config: initial=${memory.initial}, maximum=${memory.maximum}, shared=${memory.shared}`, 'info');

      const wasmMemory = new WebAssembly.Memory(memory);
      this.log('✅ WebAssembly.Memory created successfully', 'success');

      // EXACT Angular call: wasm.default(undefined, new WebAssembly.Memory(this.memory))
      this.log('🔄 Calling wasm.default(undefined, memory) - EXACT Angular pattern...', 'info');
      this.log('This is where thread detection happens in OpenMina WASM', 'info');

      await wasm.default(undefined, wasmMemory);

      this.log('🎉 WASM initialized successfully! Thread detection worked!', 'success');
      this.log('✅ OpenMina WASM is ready for node startup', 'success');

      // Now start the OpenMina node (exact Angular pattern)
      await this.startOpenMinaNode(wasm);

    } catch (error) {
      console.error('Failed to start WASM:', error);
      this.log('=== WASM STARTUP FAILURE ANALYSIS ===', 'error');
      this.log(`Error name: ${error.name}`, 'error');
      this.log(`Error message: ${error.message}`, 'error');
      this.log(`Error stack: ${error.stack}`, 'error');

      // Check if this is the thread detection error
      if (error.message.includes('unreachable')) {
        this.log('🔴 CONFIRMED: Thread detection error in OpenMina WASM', 'error');
        this.log('The WASM cannot determine execution context in Chrome extension', 'error');
        this.log('This is the core blocker that needs investigation', 'error');
      }

      this.log('=== END FAILURE ANALYSIS ===', 'error');
      throw error;
    }
  }

  // Add comprehensive environment logging for debugging
  logEnvironmentDetails() {
    this.log('=== ENVIRONMENT ANALYSIS FOR DEBUGGING ===', 'info');

    // Basic environment
    this.log('1. BASIC ENVIRONMENT:', 'info');
    this.log(`   - typeof self: ${typeof self}`, 'info');
    this.log(`   - typeof window: ${typeof window}`, 'info');
    this.log(`   - typeof globalThis: ${typeof globalThis}`, 'info');
    this.log(`   - self === window: ${self === window}`, 'info');
    this.log(`   - self.constructor.name: ${self.constructor.name}`, 'info');

    // Worker-related globals
    this.log('2. WORKER-RELATED GLOBALS:', 'info');
    this.log(`   - typeof WorkerGlobalScope: ${typeof WorkerGlobalScope}`, 'info');
    this.log(`   - typeof DedicatedWorkerGlobalScope: ${typeof DedicatedWorkerGlobalScope}`, 'info');
    this.log(`   - typeof importScripts: ${typeof importScripts}`, 'info');

    // Test instanceof behavior (what WASM checks)
    this.log('3. INSTANCEOF CHECKS (WHAT WASM DOES):', 'info');
    try {
      const isWorkerGlobal = self instanceof WorkerGlobalScope;
      this.log(`   - self instanceof WorkerGlobalScope: ${isWorkerGlobal}`, 'info');
    } catch (e) {
      this.log(`   - WorkerGlobalScope instanceof failed: ${e.message}`, 'error');
    }

    try {
      const isDedicatedWorker = self instanceof DedicatedWorkerGlobalScope;
      this.log(`   - self instanceof DedicatedWorkerGlobalScope: ${isDedicatedWorker}`, 'info');
    } catch (e) {
      this.log(`   - DedicatedWorkerGlobalScope instanceof failed: ${e.message}`, 'error');
    }

    this.log('=== END ENVIRONMENT ANALYSIS ===', 'info');
  }

  // Log WASM module details for debugging
  logWasmModuleDetails(wasmModule) {
    this.log('=== WASM MODULE ANALYSIS ===', 'info');

    const allFunctions = Object.getOwnPropertyNames(wasmModule);
    const instanceofFunctions = allFunctions.filter(name => name.includes('instanceof'));
    const workerFunctions = allFunctions.filter(name =>
      name.toLowerCase().includes('worker') || name.toLowerCase().includes('global')
    );

    this.log(`📋 Total WASM exports: ${allFunctions.length}`, 'info');
    this.log(`🔍 instanceof functions: [${instanceofFunctions.join(', ')}]`, 'info');
    this.log(`👷 worker-related functions: [${workerFunctions.join(', ')}]`, 'info');

    // Check for the specific thread detection functions
    const workerGlobalScopeFunc = instanceofFunctions.find(name => name.includes('WorkerGlobalScope'));
    const dedicatedWorkerFunc = instanceofFunctions.find(name => name.includes('DedicatedWorkerGlobalScope'));

    if (workerGlobalScopeFunc) {
      this.log(`✅ Found WorkerGlobalScope function: ${workerGlobalScopeFunc}`, 'success');
    } else {
      this.log('❌ WorkerGlobalScope function not found', 'warning');
    }

    if (dedicatedWorkerFunc) {
      this.log(`✅ Found DedicatedWorkerGlobalScope function: ${dedicatedWorkerFunc}`, 'success');
    } else {
      this.log('❌ DedicatedWorkerGlobalScope function not found', 'warning');
    }

    this.log('=== END WASM MODULE ANALYSIS ===', 'info');
  }



  // Replicate exact Angular WebNodeService node startup pattern
  async startOpenMinaNode(wasm) {
    try {
      this.updateStatus('initializing', 'Starting OpenMina node...');
      this.log('🚀 Starting OpenMina node (Angular pattern)...', 'info');

      // Load configuration (Angular gets this from web-node-secrets.json)
      const config = await this.loadConfiguration();
      this.log(`📋 Node configuration: ${JSON.stringify(config)}`, 'info');

      // EXACT Angular call: wasm.run(privateKey, urls.seeds, urls.genesisConfig)
      this.log('🔄 Calling wasm.run() - EXACT Angular WebNodeService pattern...', 'info');
      this.log('Parameters:', 'info');
      this.log(`  - privateKey: ${config.blockProducerKey ? '[REDACTED]' : 'null'}`, 'info');
      this.log(`  - seedNodesUrl: ${config.seedNodesUrl}`, 'info');
      this.log(`  - genesisConfigUrl: ${config.genesisConfigUrl || 'null'}`, 'info');

      this.rpc = await wasm.run(
        config.blockProducerKey,
        config.seedNodesUrl,
        config.genesisConfigUrl
      );

      this.log('🎉 OpenMina node started successfully!', 'success');
      this.log('✅ RPC interface available for node communication', 'success');
      this.updateStatus('running', 'Node running and connected');

      // Store globally like Angular: window.webnode = webnode
      window.webnode = this.rpc;

      // Notify background script
      chrome.runtime.sendMessage({ type: 'NODE_READY' });

      // Start status monitoring
      this.startStatusMonitoring();

      // Set up tab close protection
      this.setupTabProtection();

    } catch (error) {
      console.error('Failed to start OpenMina node:', error);
      this.log(`❌ Failed to start node: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to start node: ' + error.message);
      throw error;
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
        if (this.rpc && this.nodeStatus === 'running') {
          // Get status directly from RPC (like Angular frontend)
          const status = await this.rpc.status();
          this.updateNodeInfo(status);
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

    if (this.rpc) {
      try {
        // Stop node via RPC
        this.rpc.stop();
        this.rpc = null;
      } catch (error) {
        console.log('Error during node cleanup:', error);
      }
    }
  }
}

// Main thread approach - replicates Angular frontend pattern EXACTLY

// Wait for COI Service Worker to be ready before initializing
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[OpenMina] DOM loaded, starting diagnostics...');

  // Comprehensive diagnostics
  await runDiagnostics();

  // Wait for service worker to be ready
  await waitForServiceWorkerReady();

  console.log('[OpenMina] COI Service Worker ready, dispatching startWebNode event...');

  // EXACT Angular pattern: dispatch startWebNode event to trigger loading
  window.dispatchEvent(new CustomEvent('startWebNode'));
});

// EXACT Angular pattern: listen for startWebNode event
window.addEventListener('startWebNode', () => {
  console.log('[OpenMina] startWebNode event received, initializing OpenMina...');
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

  // 6.5. Check thread detection globals (for comparison with worker)
  console.log('[DIAG] 6.5. Main thread globals (for worker comparison):');
  console.log('[DIAG] - typeof self:', typeof self);
  console.log('[DIAG] - typeof window:', typeof window);
  console.log('[DIAG] - typeof globalThis:', typeof globalThis);
  console.log('[DIAG] - typeof importScripts:', typeof importScripts);
  console.log('[DIAG] - typeof WorkerGlobalScope:', typeof WorkerGlobalScope);
  console.log('[DIAG] - typeof DedicatedWorkerGlobalScope:', typeof DedicatedWorkerGlobalScope);
  console.log('[DIAG] - self === window:', self === window);
  console.log('[DIAG] - self.constructor.name:', self.constructor.name);

  try {
    console.log('[DIAG] - self instanceof WorkerGlobalScope:', self instanceof WorkerGlobalScope);
  } catch (e) {
    console.log('[DIAG] - WorkerGlobalScope instanceof check failed:', e.message);
  }

  try {
    console.log('[DIAG] - self instanceof DedicatedWorkerGlobalScope:', self instanceof DedicatedWorkerGlobalScope);
  } catch (e) {
    console.log('[DIAG] - DedicatedWorkerGlobalScope instanceof check failed:', e.message);
  }

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
