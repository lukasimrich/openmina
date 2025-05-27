# Next Agent Prompt: OpenMina Chrome Extension Final Resolution

## 🎯 **Mission**

You are taking over a **95% complete** OpenMina Chrome extension project. Your task is to resolve the final critical blocker: a WASM thread detection compatibility issue that prevents OpenMina node initialization.

## 📋 **Current State**

### ✅ **What's Working Perfectly**
- Complete Chrome MV3 extension infrastructure
- Cross-origin isolation with SharedArrayBuffer support
- WASM module loading and preparation
- Comprehensive thread detection polyfill
- All debugging tools and logging infrastructure

### ❌ **Critical Blocker**
- OpenMina WASM fails with `RuntimeError: unreachable` in `is_web_worker_thread`
- Despite polyfill working correctly, WASM initialization still fails
- Error occurs in: `wasm_thread::wasm32::utils::is_web_worker_thread::h233487740e01a168`

## 🔍 **Your Investigation Task**

### **Primary Objective**
Resolve the WASM thread detection failure and achieve successful OpenMina node initialization in the Chrome extension.

### **Specific Steps**

1. **Function Discovery** (High Priority)
   - Load the extension and test current state
   - Enable `webnode-v2.js` implementation to bypass caching
   - Identify actual WASM `instanceof` function names (they may have different hashes)
   - Look for functions like `__wbg_instanceof_WorkerGlobalScope_*`

2. **Call Interception** (Critical)
   - Use the built-in function interception in `webnode-v2.js`
   - Monitor actual WASM function calls during initialization
   - Verify what parameters are being passed to `instanceof` checks
   - Confirm whether our polyfill is being used or bypassed

3. **Root Cause Analysis**
   - Determine why the polyfill isn't preventing the WASM error
   - Check if WASM uses alternative thread detection methods
   - Compare with working Angular frontend behavior

4. **Solution Implementation**
   - Fix the polyfill to properly handle WASM calls
   - OR implement alternative approach (single-threaded mode, different initialization)
   - Test until WASM initialization succeeds

## 📁 **Key Resources**

### **Essential Files**
- **`openmina-extension/webnode-v2.js`**: Fresh implementation with debugging
- **`openmina-extension/test-main-thread.html`**: Isolated testing environment
- **`memory-bank/handoff-documentation.md`**: Complete technical documentation
- **`memory-bank/critical-blocker-analysis.md`**: Detailed error analysis

### **Reference Implementation**
- **Angular Frontend**: Working OpenMina implementation in `frontend/` directory
- **Pull Request #3**: Complete extension implementation

## 🛠️ **Available Tools**

### **Debugging Infrastructure**
- Comprehensive logging system with detailed environment analysis
- WASM function discovery and interception capabilities
- Polyfill verification and testing tools
- Isolated test environment for WASM-only testing

### **Test Commands**
```bash
# Load extension in Chrome
1. Go to chrome://extensions/
2. Enable Developer mode
3. Load unpacked: openmina-extension/
4. Click extension icon → Start Node
5. Monitor console logs

# Enable V2 debugging
1. Edit webnode.html: change src="webnode.js" to src="webnode-v2.js"
2. Reload extension
3. Test again for enhanced logging
```

## 🎯 **Success Criteria**

### **Immediate Success**
- WASM initialization completes: `await wasmModule.default()` succeeds
- No more `RuntimeError: unreachable` in `is_web_worker_thread`
- Console shows: "🎉 WASM initialized successfully!"

### **Complete Success**
- OpenMina node starts and shows "Node running" status
- P2P connections established
- Full blockchain node functionality in Chrome extension

## 🔬 **Investigation Approach**

### **Systematic Debugging**
1. **Verify Current State**: Confirm the exact failure point
2. **Function Discovery**: Find actual WASM function names
3. **Call Monitoring**: Intercept and log real WASM calls
4. **Polyfill Analysis**: Verify polyfill behavior vs WASM expectations
5. **Solution Testing**: Iterate until WASM initialization succeeds

### **Expected Findings**
- WASM function names may differ from expected (different hashes)
- WASM may use additional thread detection methods beyond `instanceof`
- Polyfill may need adjustment for actual WASM call patterns

## 📞 **Support Context**

### **Previous Work**
- Extensive investigation of Chrome extension threading limitations
- Multiple approaches tested (offscreen documents, workers, main thread)
- Comprehensive polyfill implementation with Symbol.hasInstance override
- All infrastructure and debugging tools implemented

### **Key Insights**
- Angular frontend runs same WASM successfully in main thread
- Chrome extension context missing WorkerGlobalScope/DedicatedWorkerGlobalScope
- Polyfill creates correct constructors and returns correct values
- WASM still fails despite polyfill working correctly

## 🚀 **Quick Start**

1. **Review Documentation**: Read `memory-bank/handoff-documentation.md`
2. **Load Extension**: Install from `openmina-extension/` directory
3. **Test Current State**: Observe the WASM failure
4. **Enable Enhanced Debugging**: Switch to `webnode-v2.js`
5. **Analyze Function Calls**: Use built-in interception tools
6. **Implement Fix**: Resolve the thread detection issue
7. **Verify Success**: Achieve OpenMina node initialization

---

**You have all the tools and infrastructure needed. The solution is within reach - focus on understanding the exact WASM function calls and adjusting the polyfill accordingly.**

## 🎯 **Expected Timeline**
- **Investigation**: 2-4 hours to identify root cause
- **Implementation**: 1-2 hours to implement fix
- **Testing**: 1 hour to verify complete functionality
- **Total**: 4-7 hours to complete the project

**The extension is 95% complete. Your mission is to cross the finish line and deliver a fully functional OpenMina Chrome extension.**
