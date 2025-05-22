// mina_worker.js - Dedicated Web Worker for OpenMina WASM execution
console.log("Mina Worker: Starting up...");

// Check if we're in a proper worker context
if (typeof importScripts === 'undefined') {
  console.error("Mina Worker: Not running in a Web Worker context!");
  postMessage({ type: 'WASM_ERROR', payload: 'Not in Web Worker context' });
} else {
  console.log("Mina Worker: Running in proper Web Worker context ✓");
}

// Check cross-origin isolation in worker
if (typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated) {
  console.log("Mina Worker: Cross-origin isolated ✓");
} else {
  console.log("Mina Worker: Cross-origin isolation status:", typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : 'undefined');
}

// Global variables for WASM module
let wasmModule = null;
let openminaNode = null;

// Message handler for communication with offscreen document
self.onmessage = async function(event) {
  const { type, payload } = event.data;
  console.log("Mina Worker: Received message:", type, payload);

  switch (type) {
    case 'INIT_WASM':
      await initializeWasm();
      break;

    case 'CALL_WASM_FUNCTION':
      await callWasmFunction(payload);
      break;

    default:
      console.log("Mina Worker: Unknown message type:", type);
  }
};

async function initializeWasm() {
  console.log("Mina Worker: Starting WASM initialization...");

  try {
    // Use importScripts to load the bundled module in worker context
    console.log("Mina Worker: Loading bundled WASM module via importScripts...");

    // Import the IIFE bundle designed for classic workers
    importScripts('./dist/worker-bundle.js');
    console.log("Mina Worker: Bundle script loaded successfully");

    // Wait a bit for the bundle to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if global functions are available after script load
    console.log("Mina Worker: Checking for global WASM functions...");
    console.log("Mina Worker: typeof build_env:", typeof build_env);
    console.log("Mina Worker: typeof run:", typeof run);
    console.log("Mina Worker: typeof main:", typeof main);

    if (typeof build_env === 'function') {
      console.log("Mina Worker: build_env function available globally");

      try {
        const buildEnv = build_env();
        console.log("Mina Worker: Build environment:", buildEnv);

        // Store reference to global WASM functions
        wasmModule = { build_env, run, main };

        // Send success message back to offscreen document
        postMessage({
          type: 'WASM_READY',
          payload: {
            buildEnv,
            availableExports: ['build_env', 'run', 'main'],
            note: "WASM initialized successfully in Web Worker context"
          }
        });

      } catch (buildEnvError) {
        console.error("Mina Worker: build_env() failed:", buildEnvError);
        postMessage({
          type: 'WASM_ERROR',
          payload: `build_env failed: ${buildEnvError.message}`
        });
      }

    } else {
      console.error("Mina Worker: build_env function not available globally");
      console.log("Mina Worker: Available globals:", Object.getOwnPropertyNames(self).filter(name => typeof self[name] === 'function'));
      postMessage({
        type: 'WASM_ERROR',
        payload: 'build_env function not available globally'
      });
    }

  } catch (error) {
    console.error("Mina Worker: WASM initialization failed:", error);
    console.error("Mina Worker: Error stack:", error.stack);
    postMessage({
      type: 'WASM_ERROR',
      payload: `Initialization failed: ${error.message}`
    });
  }
}

async function callWasmFunction(payload) {
  console.log("Mina Worker: Calling WASM function:", payload);

  if (!wasmModule) {
    postMessage({
      type: 'WASM_ERROR',
      payload: 'WASM module not initialized'
    });
    return;
  }

  try {
    // Handle different function calls based on payload
    const { functionName, args } = payload;

    if (typeof wasmModule[functionName] === 'function') {
      const result = await wasmModule[functionName](...(args || []));
      postMessage({
        type: 'WASM_RESULT',
        payload: { functionName, result }
      });
    } else {
      postMessage({
        type: 'WASM_ERROR',
        payload: `Function ${functionName} not available`
      });
    }

  } catch (error) {
    console.error("Mina Worker: Function call failed:", error);
    postMessage({
      type: 'WASM_ERROR',
      payload: `Function call failed: ${error.message}`
    });
  }
}

// Error handler
self.onerror = function(error) {
  console.error("Mina Worker: Unhandled error:", error);
  postMessage({
    type: 'WASM_ERROR',
    payload: `Worker error: ${error.message}`
  });
};

console.log("Mina Worker: Setup complete, waiting for messages...");
