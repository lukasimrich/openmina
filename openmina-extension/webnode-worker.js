// WebNode Worker - Dedicated worker for OpenMina WASM execution
// This replicates the exact pattern used by the working Angular frontend

console.log('[Worker] OpenMina WebNode Worker starting...');

// Check worker environment
console.log('[Worker] Worker environment check:');
console.log('[Worker] - crossOriginIsolated:', self.crossOriginIsolated);
console.log('[Worker] - SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined');
console.log('[Worker] - WebAssembly available:', typeof WebAssembly !== 'undefined');

// CRITICAL: Debug thread detection globals
console.log('[Worker] === THREAD DETECTION DEBUGGING ===');
console.log('[Worker] - typeof self:', typeof self);
console.log('[Worker] - typeof window:', typeof window);
console.log('[Worker] - typeof globalThis:', typeof globalThis);
console.log('[Worker] - typeof importScripts:', typeof importScripts);
console.log('[Worker] - typeof WorkerGlobalScope:', typeof WorkerGlobalScope);
console.log('[Worker] - typeof DedicatedWorkerGlobalScope:', typeof DedicatedWorkerGlobalScope);
console.log('[Worker] - self === globalThis:', self === globalThis);
console.log('[Worker] - self.constructor.name:', self.constructor.name);

// Test instanceof checks that WASM uses
try {
  console.log('[Worker] - self instanceof WorkerGlobalScope:', self instanceof WorkerGlobalScope);
} catch (e) {
  console.log('[Worker] - WorkerGlobalScope instanceof check failed:', e.message);
}

try {
  console.log('[Worker] - self instanceof DedicatedWorkerGlobalScope:', self instanceof DedicatedWorkerGlobalScope);
} catch (e) {
  console.log('[Worker] - DedicatedWorkerGlobalScope instanceof check failed:', e.message);
}

// Check what globals are available
console.log('[Worker] - Available globals containing "Worker":', Object.getOwnPropertyNames(self).filter(name => name.toLowerCase().includes('worker')));
console.log('[Worker] - Available globals containing "Global":', Object.getOwnPropertyNames(self).filter(name => name.toLowerCase().includes('global')));
console.log('[Worker] === END THREAD DETECTION DEBUGGING ===');

// CRITICAL FIX: Polyfill missing worker detection globals
// The WASM thread detection relies on these instanceof checks
if (typeof WorkerGlobalScope === 'undefined') {
  console.log('[Worker] POLYFILL: Adding missing WorkerGlobalScope');
  self.WorkerGlobalScope = function WorkerGlobalScope() {};
  // Make self an instance of WorkerGlobalScope
  Object.setPrototypeOf(self, WorkerGlobalScope.prototype);
}

if (typeof DedicatedWorkerGlobalScope === 'undefined') {
  console.log('[Worker] POLYFILL: Adding missing DedicatedWorkerGlobalScope');
  self.DedicatedWorkerGlobalScope = function DedicatedWorkerGlobalScope() {};
  // Set up prototype chain: DedicatedWorkerGlobalScope extends WorkerGlobalScope
  DedicatedWorkerGlobalScope.prototype = Object.create(WorkerGlobalScope.prototype);
  DedicatedWorkerGlobalScope.prototype.constructor = DedicatedWorkerGlobalScope;
  // Make self an instance of DedicatedWorkerGlobalScope
  Object.setPrototypeOf(self, DedicatedWorkerGlobalScope.prototype);
}

// Ensure importScripts is available (required for worker detection)
if (typeof importScripts === 'undefined') {
  console.log('[Worker] POLYFILL: Adding missing importScripts');
  self.importScripts = function importScripts(...urls) {
    console.log('[Worker] POLYFILL: importScripts called with:', urls);
    // In Chrome extension context, we can't actually import scripts dynamically
    // But having this function available helps with worker detection
  };
}

// Verify the polyfills work
console.log('[Worker] === POLYFILL VERIFICATION ===');
try {
  console.log('[Worker] - self instanceof WorkerGlobalScope (after polyfill):', self instanceof WorkerGlobalScope);
} catch (e) {
  console.log('[Worker] - WorkerGlobalScope instanceof check still failed:', e.message);
}

try {
  console.log('[Worker] - self instanceof DedicatedWorkerGlobalScope (after polyfill):', self instanceof DedicatedWorkerGlobalScope);
} catch (e) {
  console.log('[Worker] - DedicatedWorkerGlobalScope instanceof check still failed:', e.message);
}
console.log('[Worker] === END POLYFILL VERIFICATION ===');

let webnode = null;
let rpc = null;

// Message handler for communication with main thread
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  console.log('[Worker] Received message:', type);

  try {
    switch (type) {
      case 'INIT_WASM':
        console.log('[Worker] Initializing WASM...');
        await initializeWasm(data);
        self.postMessage({ type: 'WASM_INITIALIZED', success: true });
        break;

      case 'START_NODE':
        console.log('[Worker] Starting OpenMina node...');
        const result = await startNode(data);
        self.postMessage({ type: 'NODE_STARTED', success: true, data: result });
        break;

      case 'GET_STATUS':
        if (rpc) {
          const status = await rpc.status();
          self.postMessage({ type: 'STATUS_RESPONSE', data: status });
        } else {
          self.postMessage({ type: 'STATUS_RESPONSE', error: 'Node not running' });
        }
        break;

      case 'STOP_NODE':
        if (rpc) {
          await rpc.stop();
          rpc = null;
        }
        self.postMessage({ type: 'NODE_STOPPED', success: true });
        break;

      default:
        console.warn('[Worker] Unknown message type:', type);
        self.postMessage({ type: 'ERROR', error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('[Worker] Error handling message:', error);
    self.postMessage({
      type: 'ERROR',
      error: error.message,
      originalType: type
    });
  }
});

// Initialize WASM module - try different initialization approach
async function initializeWasm(config = {}) {
  try {
    console.log('[Worker] Loading WASM module...');

    // Import the WASM module
    const wasmModule = await import('./assets/webnode/pkg/openmina_node_web.js');

    console.log('[Worker] WASM module imported successfully');

    // Try without custom memory first (let WASM use default)
    console.log('[Worker] Initializing WASM with default memory...');
    await wasmModule.default();

    console.log('[Worker] ✅ WASM module initialized successfully');
    webnode = wasmModule;

    return { success: true };

  } catch (error) {
    console.error('[Worker] Failed to initialize WASM:', error);

    // If default initialization fails, try with custom memory
    try {
      console.log('[Worker] Retrying with custom memory...');
      const wasmModule = await import('./assets/webnode/pkg/openmina_node_web.js');

      const memory = new WebAssembly.Memory({
        initial: 32,    // 32 pages (2MB)
        maximum: 65536, // 65536 pages (4GB)
        shared: true    // Critical for threading
      });

      await wasmModule.default(undefined, memory);
      console.log('[Worker] ✅ WASM module initialized with custom memory');
      webnode = wasmModule;

      return { success: true };

    } catch (retryError) {
      console.error('[Worker] Both initialization methods failed:', retryError);
      throw retryError;
    }
  }
}

// Start OpenMina node (exact same pattern as WebNodeService)
async function startNode(config) {
  try {
    if (!webnode) {
      throw new Error('WASM not initialized');
    }

    console.log('[Worker] Starting OpenMina node with config:', config);

    // Use default configuration if not provided
    const nodeConfig = {
      blockProducerKey: config?.blockProducerKey || null,
      seedNodesUrl: config?.seedNodesUrl || 'https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt',
      genesisConfigUrl: config?.genesisConfigUrl || null
    };

    console.log('[Worker] Final node configuration:', nodeConfig);

    // Start the node (exact same call as WebNodeService.startWasm$())
    rpc = await webnode.run(
      nodeConfig.blockProducerKey,
      nodeConfig.seedNodesUrl,
      nodeConfig.genesisConfigUrl
    );

    console.log('[Worker] 🎉 OpenMina node started successfully!');

    return {
      success: true,
      message: 'OpenMina node running in worker'
    };

  } catch (error) {
    console.error('[Worker] Failed to start node:', error);
    throw error;
  }
}

// Error handler
self.addEventListener('error', (event) => {
  console.error('[Worker] Unhandled error:', event.error);
  self.postMessage({
    type: 'ERROR',
    error: event.error?.message || 'Unknown worker error'
  });
});

// Unhandled promise rejection handler
self.addEventListener('unhandledrejection', (event) => {
  console.error('[Worker] Unhandled promise rejection:', event.reason);
  self.postMessage({
    type: 'ERROR',
    error: event.reason?.message || 'Unhandled promise rejection'
  });
});

console.log('[Worker] WebNode Worker ready for messages');
