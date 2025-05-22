import initWasm, { run, build_env, main } from './pkg/openmina_node_web.js';

// Log all imported WASM functions at module level
console.log("OpenMina bundled module: Imported WASM functions:");
console.log("- initWasm:", typeof initWasm);
console.log("- run:", typeof run);
console.log("- build_env:", typeof build_env);
console.log("- main:", typeof main);

async function init() {
  console.log("OpenMina bundled module: Starting initialization...");

  // First, let's try to call build_env() without full initialization
  try {
    console.log("OpenMina bundled module: Trying build_env() before full init...");
    const buildEnv = build_env();
    console.log("OpenMina bundled module: Build environment (pre-init):", buildEnv);
  } catch (buildEnvError) {
    console.log("OpenMina bundled module: build_env() failed before init:", buildEnvError.message);
  }

  // Import and log all available WASM exports
  try {
    const wasmExports = await import('./pkg/openmina_node_web.js');
    console.log("OpenMina bundled module: All WASM exports:", Object.keys(wasmExports));
    console.log("OpenMina bundled module: WASM exports object:", wasmExports);
  } catch (importError) {
    console.log("OpenMina bundled module: Failed to import WASM exports:", importError.message);
  }

  try {
    // Initialize the WASM module
    console.log("OpenMina bundled module: Calling initWasm()...");
    const wasmModule = await initWasm();
    console.log("OpenMina bundled module: WASM initialized successfully");
    console.log("OpenMina bundled module: initWasm() returned:", wasmModule);

    // Get build environment info after init
    console.log("OpenMina bundled module: Getting build environment after init...");
    const buildEnv = build_env();
    console.log("OpenMina bundled module: Build environment (post-init):", buildEnv);

    // Start the OpenMina node
    console.log("OpenMina bundled module: Starting node with run()...");
    const rpcSender = await run(null, null, null); // No block producer, default configs

    console.log("OpenMina bundled module: Node started successfully");
    console.log("OpenMina bundled module: RpcSender object:", rpcSender);
    console.log("OpenMina bundled module: RpcSender type:", typeof rpcSender);
    console.log("OpenMina bundled module: RpcSender constructor:", rpcSender.constructor.name);
    console.log("OpenMina bundled module: RpcSender own properties:", Object.getOwnPropertyNames(rpcSender));
    console.log("OpenMina bundled module: RpcSender prototype:", Object.getPrototypeOf(rpcSender));
    console.log("OpenMina bundled module: RpcSender prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(rpcSender)));

    // Check for common methods
    const commonMethods = ['status', 'send', 'call', 'request', 'query'];
    commonMethods.forEach(method => {
      if (typeof rpcSender[method] === 'function') {
        console.log(`OpenMina bundled module: ✓ ${method}() method available`);
      } else {
        console.log(`OpenMina bundled module: ✗ ${method}() method not found`);
      }
    });

    // Make the node available globally for the extension
    window.openminaNode = rpcSender;
    console.log("OpenMina bundled module: Node attached to window.openminaNode");

    // Dispatch success event
    window.dispatchEvent(new CustomEvent('openmina-ready', {
      detail: { rpcSender, buildEnv }
    }));
    console.log("OpenMina bundled module: Success event dispatched");

  } catch (error) {
    console.error("OpenMina bundled module: Initialization failed:", error);
    console.error("OpenMina bundled module: Error type:", error.constructor.name);
    console.error("OpenMina bundled module: Error message:", error.message);

    // Try to call build_env() even after error
    try {
      console.log("OpenMina bundled module: Trying build_env() after error...");
      const buildEnv = build_env();
      console.log("OpenMina bundled module: Build environment (post-error):", buildEnv);
    } catch (buildEnvError) {
      console.log("OpenMina bundled module: build_env() also failed:", buildEnvError.message);
    }

    // Dispatch error event
    window.dispatchEvent(new CustomEvent('openmina-error', {
      detail: error.message || error.toString()
    }));
  }
}

// Start initialization
init();
