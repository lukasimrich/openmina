// WebNode tab logic - replicates WebNodeService
class OpenMinaWebNode {
  constructor() {
    this.nodeStatus = 'initializing';
    this.rpc = null;
    this.wasmModule = null;
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

      this.updateStatus('initializing', 'Initializing OpenMina WASM...');
      this.log('Starting OpenMina WASM in main thread...', 'info');

      // Initialize WASM in main thread (like Angular frontend)
      await this.initializeWasm();

      // Start the OpenMina node
      await this.startOpenMinaNode();

      // Set up tab close protection
      this.setupTabProtection();

    } catch (error) {
      console.error('Error starting node:', error);
      this.log(`❌ Failed to start node: ${error.message}`, 'error');
      this.updateStatus('error', 'Failed to start node: ' + error.message);
      this.notifyBackgroundError(error.message);
    }
  }

  async initializeWasm() {
    try {
      this.log('Loading OpenMina WASM in main thread (Angular pattern)...', 'info');
      this.updateStatus('initializing', 'Loading OpenMina WASM module...');

      // CRITICAL FIX: Polyfill missing WorkerGlobalScope constructors
      // The WASM thread detection needs these to exist for instanceof checks
      this.setupWorkerGlobalScopePolyfill();

      // Set up WASM function call interception for debugging
      this.log('🚀 WASM FUNCTION INTERCEPTION ENABLED - CACHE REFRESH TEST', 'info');
      this.log('If you see this message, the cache has been refreshed successfully', 'success');

      // Replicate exact Angular frontend pattern
      // Dynamic import of WASM module in main thread
      const wasmModule = await import('./assets/webnode/pkg/openmina_node_web.js');
      this.log('✅ WASM module imported successfully', 'success');

      // CRITICAL: Intercept WASM function calls to see what's actually happening
      this.interceptWasmFunctions(wasmModule);

      // Initialize WASM with memory (like Angular WebNodeService)
      this.updateStatus('initializing', 'Initializing WASM with memory...');
      this.log('Initializing WASM with SharedArrayBuffer memory...', 'info');

      // Create memory exactly like Angular frontend
      const memory = new WebAssembly.Memory({
        initial: 32,    // 32 pages (2MB)
        maximum: 65536, // 65536 pages (4GB)
        shared: true    // Critical for threading
      });

      // Initialize WASM (exact same call as Angular)
      this.log('About to call wasmModule.default() - this is where thread detection happens...', 'info');
      this.log('If this fails with "unreachable", the polyfill needs adjustment', 'warning');

      await wasmModule.default(undefined, memory);
      this.log('✅ WASM initialized successfully in main thread', 'success');
      this.log('🎉 Thread detection polyfill worked! WASM accepts main thread context.', 'success');

      // Store WASM module for later use
      this.wasmModule = wasmModule;
      window.webnode = wasmModule; // Make available globally like Angular

      return wasmModule;

    } catch (error) {
      console.error('Failed to initialize WASM:', error);

      // Enhanced error logging for thread detection issues
      this.log('=== WASM INITIALIZATION FAILURE ANALYSIS ===', 'error');
      this.log(`Error name: ${error.name}`, 'error');
      this.log(`Error message: ${error.message}`, 'error');
      this.log(`Error stack: ${error.stack}`, 'error');

      // Check if this is the thread detection error
      if (error.message.includes('unreachable') && error.stack.includes('is_web_worker_thread')) {
        this.log('CONFIRMED: This is the thread detection error in is_web_worker_thread', 'error');
        this.log('The WASM is failing to determine execution context despite polyfills', 'error');

        // Re-verify our polyfills are still in place
        this.log('RE-VERIFYING POLYFILLS AT ERROR TIME:', 'error');
        this.log(`- typeof WorkerGlobalScope: ${typeof WorkerGlobalScope}`, 'error');
        this.log(`- typeof DedicatedWorkerGlobalScope: ${typeof DedicatedWorkerGlobalScope}`, 'error');

        try {
          this.log(`- self instanceof WorkerGlobalScope: ${self instanceof WorkerGlobalScope}`, 'error');
        } catch (e) {
          this.log(`- instanceof WorkerGlobalScope failed: ${e.message}`, 'error');
        }

        try {
          this.log(`- self instanceof DedicatedWorkerGlobalScope: ${self instanceof DedicatedWorkerGlobalScope}`, 'error');
        } catch (e) {
          this.log(`- instanceof DedicatedWorkerGlobalScope failed: ${e.message}`, 'error');
        }
      }

      this.log('=== END FAILURE ANALYSIS ===', 'error');
      this.log(`❌ Failed to initialize WASM: ${error.message}`, 'error');
      throw error;
    }
  }

  setupWorkerGlobalScopePolyfill() {
    this.log('=== DETAILED THREAD DETECTION ANALYSIS ===', 'info');

    // 1. Analyze current global environment
    this.log('1. CURRENT GLOBAL ENVIRONMENT:', 'info');
    this.log(`   - typeof self: ${typeof self}`, 'info');
    this.log(`   - typeof window: ${typeof window}`, 'info');
    this.log(`   - typeof globalThis: ${typeof globalThis}`, 'info');
    this.log(`   - self === window: ${self === window}`, 'info');
    this.log(`   - self === globalThis: ${self === globalThis}`, 'info');
    this.log(`   - self.constructor.name: ${self.constructor.name}`, 'info');
    this.log(`   - window.constructor.name: ${window.constructor.name}`, 'info');

    // 2. Check existing Worker-related globals
    this.log('2. EXISTING WORKER GLOBALS:', 'info');
    this.log(`   - typeof Worker: ${typeof Worker}`, 'info');
    this.log(`   - typeof WorkerGlobalScope: ${typeof WorkerGlobalScope}`, 'info');
    this.log(`   - typeof DedicatedWorkerGlobalScope: ${typeof DedicatedWorkerGlobalScope}`, 'info');
    this.log(`   - typeof SharedWorkerGlobalScope: ${typeof SharedWorkerGlobalScope}`, 'info');
    this.log(`   - typeof ServiceWorkerGlobalScope: ${typeof ServiceWorkerGlobalScope}`, 'info');
    this.log(`   - typeof importScripts: ${typeof importScripts}`, 'info');

    // 3. Check what globals are available
    const workerRelatedGlobals = Object.getOwnPropertyNames(window).filter(name =>
      name.toLowerCase().includes('worker') || name.toLowerCase().includes('global')
    );
    this.log(`3. WORKER-RELATED GLOBALS: [${workerRelatedGlobals.join(', ')}]`, 'info');

    // 4. Check prototype chains
    this.log('4. PROTOTYPE CHAIN ANALYSIS:', 'info');
    this.log(`   - self.__proto__.constructor.name: ${self.__proto__.constructor.name}`, 'info');
    this.log(`   - window.__proto__.constructor.name: ${window.__proto__.constructor.name}`, 'info');

    // 5. Test current instanceof behavior (before polyfill)
    this.log('5. CURRENT INSTANCEOF BEHAVIOR (BEFORE POLYFILL):', 'info');
    try {
      const result = self instanceof WorkerGlobalScope;
      this.log(`   - self instanceof WorkerGlobalScope: ${result}`, 'info');
    } catch (e) {
      this.log(`   - self instanceof WorkerGlobalScope: ERROR - ${e.message}`, 'error');
    }

    try {
      const result = self instanceof DedicatedWorkerGlobalScope;
      this.log(`   - self instanceof DedicatedWorkerGlobalScope: ${result}`, 'info');
    } catch (e) {
      this.log(`   - self instanceof DedicatedWorkerGlobalScope: ERROR - ${e.message}`, 'error');
    }

    // 6. Apply polyfills if needed
    this.log('6. APPLYING POLYFILLS:', 'info');

    if (typeof WorkerGlobalScope === 'undefined') {
      this.log('   - POLYFILL: Adding missing WorkerGlobalScope constructor', 'info');

      // Create WorkerGlobalScope constructor
      window.WorkerGlobalScope = function WorkerGlobalScope() {};

      // Set up prototype
      WorkerGlobalScope.prototype = Object.create(EventTarget.prototype);
      WorkerGlobalScope.prototype.constructor = WorkerGlobalScope;

      // CRITICAL: Override Symbol.hasInstance to control instanceof behavior
      Object.defineProperty(WorkerGlobalScope, Symbol.hasInstance, {
        value: function(instance) {
          // The WASM checks if 'self' is a WorkerGlobalScope
          // In main thread: self === window, so this should return FALSE
          // In worker thread: self !== window, so this should return TRUE
          const isMainThread = (typeof window !== 'undefined' && instance === window);
          const result = !isMainThread; // false in main thread, true in worker
          console.log(`[POLYFILL] WorkerGlobalScope instanceof check: instance=${instance.constructor.name}, isMainThread=${isMainThread}, result=${result}`);
          console.trace('[POLYFILL] WorkerGlobalScope instanceof call stack');
          return result;
        }
      });

      // Add to global scope
      self.WorkerGlobalScope = window.WorkerGlobalScope;

      this.log(`   - WorkerGlobalScope created: ${typeof WorkerGlobalScope}`, 'success');
    } else {
      this.log('   - WorkerGlobalScope already exists, no polyfill needed', 'info');
    }

    if (typeof DedicatedWorkerGlobalScope === 'undefined') {
      this.log('   - POLYFILL: Adding missing DedicatedWorkerGlobalScope constructor', 'info');

      // Create DedicatedWorkerGlobalScope constructor
      window.DedicatedWorkerGlobalScope = function DedicatedWorkerGlobalScope() {};

      // Set up prototype chain: DedicatedWorkerGlobalScope extends WorkerGlobalScope
      DedicatedWorkerGlobalScope.prototype = Object.create(WorkerGlobalScope.prototype);
      DedicatedWorkerGlobalScope.prototype.constructor = DedicatedWorkerGlobalScope;

      // CRITICAL: Override Symbol.hasInstance to control instanceof behavior
      Object.defineProperty(DedicatedWorkerGlobalScope, Symbol.hasInstance, {
        value: function(instance) {
          // The WASM checks if 'self' is a DedicatedWorkerGlobalScope
          // In main thread: self === window, so this should return FALSE
          // In worker thread: self !== window, so this should return TRUE
          const isMainThread = (typeof window !== 'undefined' && instance === window);
          const result = !isMainThread; // false in main thread, true in worker
          console.log(`[POLYFILL] DedicatedWorkerGlobalScope instanceof check: instance=${instance.constructor.name}, isMainThread=${isMainThread}, result=${result}`);
          console.trace('[POLYFILL] DedicatedWorkerGlobalScope instanceof call stack');
          return result;
        }
      });

      // Add to global scope
      self.DedicatedWorkerGlobalScope = window.DedicatedWorkerGlobalScope;

      this.log(`   - DedicatedWorkerGlobalScope created: ${typeof DedicatedWorkerGlobalScope}`, 'success');
    } else {
      this.log('   - DedicatedWorkerGlobalScope already exists, no polyfill needed', 'info');
    }

    // 7. Verify polyfill results
    this.log('7. POST-POLYFILL VERIFICATION:', 'info');
    this.log(`   - typeof WorkerGlobalScope: ${typeof WorkerGlobalScope}`, 'info');
    this.log(`   - typeof DedicatedWorkerGlobalScope: ${typeof DedicatedWorkerGlobalScope}`, 'info');

    // 8. Test instanceof behavior after polyfill
    this.log('8. INSTANCEOF BEHAVIOR (AFTER POLYFILL):', 'info');
    try {
      const isWorkerGlobal = self instanceof WorkerGlobalScope;
      this.log(`   - self instanceof WorkerGlobalScope: ${isWorkerGlobal} (should be FALSE in main thread)`, isWorkerGlobal ? 'warning' : 'success');
    } catch (e) {
      this.log(`   - self instanceof WorkerGlobalScope: ERROR - ${e.message}`, 'error');
    }

    try {
      const isDedicatedWorker = self instanceof DedicatedWorkerGlobalScope;
      this.log(`   - self instanceof DedicatedWorkerGlobalScope: ${isDedicatedWorker} (should be FALSE in main thread)`, isDedicatedWorker ? 'warning' : 'success');
    } catch (e) {
      this.log(`   - self instanceof DedicatedWorkerGlobalScope: ERROR - ${e.message}`, 'error');
    }

    // 9. Test what WASM will see
    this.log('9. WHAT WASM WILL SEE:', 'info');
    this.log(`   - WorkerGlobalScope constructor available: ${typeof WorkerGlobalScope === 'function'}`, 'info');
    this.log(`   - DedicatedWorkerGlobalScope constructor available: ${typeof DedicatedWorkerGlobalScope === 'function'}`, 'info');

    // Test the exact checks that WASM does
    try {
      // This is what the WASM __wbg_instanceof_WorkerGlobalScope function does
      const wasmWorkerCheck = self instanceof WorkerGlobalScope;
      this.log(`   - WASM WorkerGlobalScope check result: ${wasmWorkerCheck}`, wasmWorkerCheck ? 'warning' : 'success');
    } catch (e) {
      this.log(`   - WASM WorkerGlobalScope check would fail: ${e.message}`, 'error');
    }

    try {
      // This is what the WASM __wbg_instanceof_DedicatedWorkerGlobalScope function does
      const wasmDedicatedCheck = self instanceof DedicatedWorkerGlobalScope;
      this.log(`   - WASM DedicatedWorkerGlobalScope check result: ${wasmDedicatedCheck}`, wasmDedicatedCheck ? 'warning' : 'success');
    } catch (e) {
      this.log(`   - WASM DedicatedWorkerGlobalScope check would fail: ${e.message}`, 'error');
    }

    this.log('=== END THREAD DETECTION ANALYSIS ===', 'info');
  }

  interceptWasmFunctions(wasmModule) {
    this.log('=== INTERCEPTING WASM FUNCTION CALLS ===', 'info');

    // Store original functions
    const originalFunctions = {};

    // Find and intercept the instanceof functions
    if (wasmModule.__wbg_instanceof_WorkerGlobalScope_b32c94246142a6a7) {
      originalFunctions.workerGlobalScope = wasmModule.__wbg_instanceof_WorkerGlobalScope_b32c94246142a6a7;
      wasmModule.__wbg_instanceof_WorkerGlobalScope_b32c94246142a6a7 = (arg0) => {
        this.log('🔍 WASM CALL: __wbg_instanceof_WorkerGlobalScope_b32c94246142a6a7', 'info');
        this.log(`   - arg0: ${arg0}`, 'info');
        this.log(`   - arg0.constructor.name: ${arg0.constructor.name}`, 'info');
        this.log(`   - arg0 === self: ${arg0 === self}`, 'info');
        this.log(`   - arg0 === window: ${arg0 === window}`, 'info');

        const result = originalFunctions.workerGlobalScope(arg0);
        this.log(`   - RESULT: ${result}`, result ? 'warning' : 'success');
        return result;
      };
    } else {
      this.log('❌ __wbg_instanceof_WorkerGlobalScope function not found', 'error');
    }

    if (wasmModule.__wbg_instanceof_DedicatedWorkerGlobalScope_8b4095b33f785a6a) {
      originalFunctions.dedicatedWorkerGlobalScope = wasmModule.__wbg_instanceof_DedicatedWorkerGlobalScope_8b4095b33f785a6a;
      wasmModule.__wbg_instanceof_DedicatedWorkerGlobalScope_8b4095b33f785a6a = (arg0) => {
        this.log('🔍 WASM CALL: __wbg_instanceof_DedicatedWorkerGlobalScope_8b4095b33f785a6a', 'info');
        this.log(`   - arg0: ${arg0}`, 'info');
        this.log(`   - arg0.constructor.name: ${arg0.constructor.name}`, 'info');
        this.log(`   - arg0 === self: ${arg0 === self}`, 'info');
        this.log(`   - arg0 === window: ${arg0 === window}`, 'info');

        const result = originalFunctions.dedicatedWorkerGlobalScope(arg0);
        this.log(`   - RESULT: ${result}`, result ? 'warning' : 'success');
        return result;
      };
    } else {
      this.log('❌ __wbg_instanceof_DedicatedWorkerGlobalScope function not found', 'error');
    }

    // Comprehensive function discovery
    const allFunctions = Object.getOwnPropertyNames(wasmModule);
    const instanceofFunctions = allFunctions.filter(name => name.includes('instanceof'));
    const workerFunctions = allFunctions.filter(name =>
      name.toLowerCase().includes('worker') || name.toLowerCase().includes('global')
    );

    this.log(`🔍 Total WASM functions: ${allFunctions.length}`, 'info');
    this.log(`🔍 All instanceof functions: [${instanceofFunctions.join(', ')}]`, 'info');
    this.log(`🔍 All worker-related functions: [${workerFunctions.join(', ')}]`, 'info');

    // Try to find the actual function names (they might have different hashes)
    const actualWorkerGlobalScopeFunc = instanceofFunctions.find(name =>
      name.includes('WorkerGlobalScope')
    );
    const actualDedicatedWorkerFunc = instanceofFunctions.find(name =>
      name.includes('DedicatedWorkerGlobalScope')
    );

    if (actualWorkerGlobalScopeFunc) {
      this.log(`🎯 Found actual WorkerGlobalScope function: ${actualWorkerGlobalScopeFunc}`, 'success');
    }
    if (actualDedicatedWorkerFunc) {
      this.log(`🎯 Found actual DedicatedWorkerGlobalScope function: ${actualDedicatedWorkerFunc}`, 'success');
    }

    this.log('=== WASM FUNCTION INTERCEPTION COMPLETE ===', 'info');
  }

  setupWasmDebugging() {
    this.log('=== SETTING UP WASM DEBUGGING INTERCEPTION ===', 'info');

    // Store original functions that WASM will call
    const originalInstanceofWorkerGlobalScope = window.WorkerGlobalScope;
    const originalInstanceofDedicatedWorkerGlobalScope = window.DedicatedWorkerGlobalScope;

    // Intercept the instanceof checks that WASM makes
    // This helps us see exactly what the WASM is trying to do

    // Override the global constructors with logging versions
    if (typeof WorkerGlobalScope !== 'undefined') {
      const OriginalWorkerGlobalScope = WorkerGlobalScope;
      window.WorkerGlobalScope = function WorkerGlobalScope() {
        console.log('[WASM DEBUG] WorkerGlobalScope constructor called');
        return OriginalWorkerGlobalScope.apply(this, arguments);
      };

      // Copy prototype and properties
      window.WorkerGlobalScope.prototype = OriginalWorkerGlobalScope.prototype;
      Object.setPrototypeOf(window.WorkerGlobalScope, OriginalWorkerGlobalScope);

      // Override Symbol.hasInstance to log instanceof checks
      Object.defineProperty(window.WorkerGlobalScope, Symbol.hasInstance, {
        value: function(instance) {
          const result = OriginalWorkerGlobalScope[Symbol.hasInstance].call(this, instance);
          console.log(`[WASM DEBUG] WorkerGlobalScope instanceof check: ${instance.constructor.name} instanceof WorkerGlobalScope = ${result}`);
          return result;
        }
      });

      self.WorkerGlobalScope = window.WorkerGlobalScope;
    }

    if (typeof DedicatedWorkerGlobalScope !== 'undefined') {
      const OriginalDedicatedWorkerGlobalScope = DedicatedWorkerGlobalScope;
      window.DedicatedWorkerGlobalScope = function DedicatedWorkerGlobalScope() {
        console.log('[WASM DEBUG] DedicatedWorkerGlobalScope constructor called');
        return OriginalDedicatedWorkerGlobalScope.apply(this, arguments);
      };

      // Copy prototype and properties
      window.DedicatedWorkerGlobalScope.prototype = OriginalDedicatedWorkerGlobalScope.prototype;
      Object.setPrototypeOf(window.DedicatedWorkerGlobalScope, OriginalDedicatedWorkerGlobalScope);

      // Override Symbol.hasInstance to log instanceof checks
      Object.defineProperty(window.DedicatedWorkerGlobalScope, Symbol.hasInstance, {
        value: function(instance) {
          const result = OriginalDedicatedWorkerGlobalScope[Symbol.hasInstance].call(this, instance);
          console.log(`[WASM DEBUG] DedicatedWorkerGlobalScope instanceof check: ${instance.constructor.name} instanceof DedicatedWorkerGlobalScope = ${result}`);
          return result;
        }
      });

      self.DedicatedWorkerGlobalScope = window.DedicatedWorkerGlobalScope;
    }

    // Also intercept any direct calls to instanceof
    const originalInstanceof = Function.prototype.constructor;

    this.log('WASM debugging interception set up - will log all instanceof checks', 'success');
    this.log('=== END WASM DEBUGGING SETUP ===', 'info');
  }

  async startOpenMinaNode() {
    try {
      this.updateStatus('initializing', 'Starting OpenMina node...');
      this.log('Starting OpenMina node in main thread...', 'info');

      if (!this.wasmModule) {
        throw new Error('WASM module not initialized');
      }

      // Load configuration
      const config = await this.loadConfiguration();
      this.log(`Using configuration: ${JSON.stringify(config)}`, 'info');

      // Start the node (exact same call as Angular WebNodeService)
      this.log('Calling wasm.run() with configuration...', 'info');
      this.rpc = await this.wasmModule.run(
        config.blockProducerKey,
        config.seedNodesUrl,
        config.genesisConfigUrl
      );

      this.log('🎉 OpenMina node started successfully in main thread!', 'success');
      this.updateStatus('running', 'Node running and connected');

      // Notify background script
      chrome.runtime.sendMessage({ type: 'NODE_READY' });

      // Start status monitoring
      this.startStatusMonitoring();

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

// Main thread approach - replicates Angular frontend pattern

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
