// WebNode V2 - Fresh implementation to bypass cache issues
console.log('🚀 WEBNODE V2 LOADED - CACHE BYPASS SUCCESSFUL');

class OpenMinaWebNodeV2 {
  constructor() {
    this.nodeStatus = 'initializing';
    this.rpc = null;
    this.wasmModule = null;
    this.statusInterval = null;
    this.logCount = 0;
    
    console.log('🚀 OpenMinaWebNodeV2 constructor called');
    this.startNode();
  }

  log(message, type = 'info') {
    this.logCount++;
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[OpenMina V2] ${message}`;
    
    console.log(logEntry);
    
    // Also update UI
    const logContainer = document.getElementById('logContainer');
    if (logContainer) {
      const logElement = document.createElement('div');
      logElement.className = `log-entry log-${type}`;
      logElement.textContent = `${timestamp} - ${message}`;
      logContainer.appendChild(logElement);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  }

  async startNode() {
    try {
      this.log('🚀 STARTING OPENMINA V2 - FRESH IMPLEMENTATION', 'info');
      this.log('This bypasses all caching issues', 'success');
      
      // Set up polyfills first
      this.setupWorkerGlobalScopePolyfill();
      
      // Import WASM module
      this.log('Importing WASM module...', 'info');
      const wasmModule = await import('./assets/webnode/pkg/openmina_node_web.js');
      this.log('✅ WASM module imported successfully', 'success');
      
      // Intercept WASM functions
      this.interceptWasmFunctions(wasmModule);
      
      // Initialize WASM
      this.log('Initializing WASM with memory...', 'info');
      const memory = new WebAssembly.Memory({
        initial: 32,
        maximum: 65536,
        shared: true
      });
      
      this.log('About to call wasmModule.default() - CRITICAL MOMENT', 'warning');
      await wasmModule.default(undefined, memory);
      this.log('🎉 WASM INITIALIZED SUCCESSFULLY!', 'success');
      
      this.wasmModule = wasmModule;
      window.webnode = wasmModule;
      
    } catch (error) {
      console.error('V2 WASM initialization failed:', error);
      this.log(`❌ V2 WASM failed: ${error.message}`, 'error');
    }
  }

  setupWorkerGlobalScopePolyfill() {
    this.log('=== V2 POLYFILL SETUP ===', 'info');
    
    if (typeof WorkerGlobalScope === 'undefined') {
      this.log('Creating WorkerGlobalScope polyfill...', 'info');
      
      window.WorkerGlobalScope = function WorkerGlobalScope() {};
      WorkerGlobalScope.prototype = Object.create(EventTarget.prototype);
      WorkerGlobalScope.prototype.constructor = WorkerGlobalScope;
      
      Object.defineProperty(WorkerGlobalScope, Symbol.hasInstance, {
        value: function(instance) {
          const isMainThread = (typeof window !== 'undefined' && instance === window);
          const result = !isMainThread;
          console.log(`[V2 POLYFILL] WorkerGlobalScope check: isMainThread=${isMainThread}, result=${result}`);
          return result;
        }
      });
      
      self.WorkerGlobalScope = window.WorkerGlobalScope;
      this.log('✅ WorkerGlobalScope polyfill created', 'success');
    }
    
    if (typeof DedicatedWorkerGlobalScope === 'undefined') {
      this.log('Creating DedicatedWorkerGlobalScope polyfill...', 'info');
      
      window.DedicatedWorkerGlobalScope = function DedicatedWorkerGlobalScope() {};
      DedicatedWorkerGlobalScope.prototype = Object.create(WorkerGlobalScope.prototype);
      DedicatedWorkerGlobalScope.prototype.constructor = DedicatedWorkerGlobalScope;
      
      Object.defineProperty(DedicatedWorkerGlobalScope, Symbol.hasInstance, {
        value: function(instance) {
          const isMainThread = (typeof window !== 'undefined' && instance === window);
          const result = !isMainThread;
          console.log(`[V2 POLYFILL] DedicatedWorkerGlobalScope check: isMainThread=${isMainThread}, result=${result}`);
          return result;
        }
      });
      
      self.DedicatedWorkerGlobalScope = window.DedicatedWorkerGlobalScope;
      this.log('✅ DedicatedWorkerGlobalScope polyfill created', 'success');
    }
    
    // Test the polyfills
    this.log('Testing polyfills...', 'info');
    this.log(`self instanceof WorkerGlobalScope: ${self instanceof WorkerGlobalScope}`, 'info');
    this.log(`self instanceof DedicatedWorkerGlobalScope: ${self instanceof DedicatedWorkerGlobalScope}`, 'info');
    this.log('=== V2 POLYFILL COMPLETE ===', 'success');
  }

  interceptWasmFunctions(wasmModule) {
    this.log('=== V2 WASM FUNCTION INTERCEPTION ===', 'info');
    
    // Get all function names
    const allFunctions = Object.getOwnPropertyNames(wasmModule);
    const instanceofFunctions = allFunctions.filter(name => name.includes('instanceof'));
    
    this.log(`Total WASM functions: ${allFunctions.length}`, 'info');
    this.log(`instanceof functions: [${instanceofFunctions.join(', ')}]`, 'info');
    
    // Find the actual function names
    const workerGlobalScopeFunc = instanceofFunctions.find(name => 
      name.includes('WorkerGlobalScope')
    );
    const dedicatedWorkerFunc = instanceofFunctions.find(name => 
      name.includes('DedicatedWorkerGlobalScope')
    );
    
    if (workerGlobalScopeFunc) {
      this.log(`🎯 Found WorkerGlobalScope function: ${workerGlobalScopeFunc}`, 'success');
      
      const originalFunc = wasmModule[workerGlobalScopeFunc];
      wasmModule[workerGlobalScopeFunc] = (arg0) => {
        this.log(`🔍 WASM CALL: ${workerGlobalScopeFunc}`, 'warning');
        this.log(`   - arg0: ${arg0}`, 'info');
        this.log(`   - arg0.constructor.name: ${arg0.constructor.name}`, 'info');
        this.log(`   - arg0 === self: ${arg0 === self}`, 'info');
        this.log(`   - arg0 === window: ${arg0 === window}`, 'info');
        
        const result = originalFunc(arg0);
        this.log(`   - RESULT: ${result}`, result ? 'error' : 'success');
        return result;
      };
    } else {
      this.log('❌ WorkerGlobalScope function not found', 'error');
    }
    
    if (dedicatedWorkerFunc) {
      this.log(`🎯 Found DedicatedWorkerGlobalScope function: ${dedicatedWorkerFunc}`, 'success');
      
      const originalFunc = wasmModule[dedicatedWorkerFunc];
      wasmModule[dedicatedWorkerFunc] = (arg0) => {
        this.log(`🔍 WASM CALL: ${dedicatedWorkerFunc}`, 'warning');
        this.log(`   - arg0: ${arg0}`, 'info');
        this.log(`   - arg0.constructor.name: ${arg0.constructor.name}`, 'info');
        this.log(`   - arg0 === self: ${arg0 === self}`, 'info');
        this.log(`   - arg0 === window: ${arg0 === window}`, 'info');
        
        const result = originalFunc(arg0);
        this.log(`   - RESULT: ${result}`, result ? 'error' : 'success');
        return result;
      };
    } else {
      this.log('❌ DedicatedWorkerGlobalScope function not found', 'error');
    }
    
    this.log('=== V2 INTERCEPTION COMPLETE ===', 'success');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 V2 DOM loaded, creating OpenMinaWebNodeV2...');
  window.openMinaNodeV2 = new OpenMinaWebNodeV2();
});
