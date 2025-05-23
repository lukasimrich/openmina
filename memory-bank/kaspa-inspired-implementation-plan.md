# OpenMina Chrome Extension: Kaspa NG-Inspired Implementation Plan

_Created: December 19, 2024_

## Executive Summary

This implementation plan adopts the proven architectural patterns from the Kaspa NG Chrome extension, eliminating the complex bundling/offscreen document approach in favor of a simpler, working solution. The Kaspa NG extension successfully runs blockchain WASM in Chrome MV3, providing a direct blueprint for OpenMina.

## Key Architectural Insights from Kaspa NG

### 1. **Direct WASM Loading Pattern**

-   **Background Service Worker**: Loads WASM directly with `import init from '/kaspa-ng.js'`
-   **Popup Integration**: Same WASM loading pattern in popup.js
-   **No Offscreen Document**: Eliminates complex cross-origin isolation requirements
-   **No Complex Bundling**: Uses standard ES module imports

### 2. **Critical Manifest Configuration**

```json
{
    "manifest_version": 3,
    "content_security_policy": {
        "extension_pages": "default-src 'self' 'wasm-unsafe-eval'; connect-src 'self' *"
    },
    "permissions": ["scripting", "alarms", "storage", "activeTab"],
    "host_permissions": ["https://*/*", "http://*/*"]
}
```

**Key Discovery**: `'wasm-unsafe-eval'` CSP directive is essential for WASM loading in Chrome MV3.

### 3. **Simplified Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Background.js  │    │    Popup.js     │    │  Content Script │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ WASM Module │ │    │ │ WASM Module │ │    │ │ API Bridge  │ │
│ │   (Node)    │ │    │ │    (UI)     │ │    │ │  (Inject)   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Phases

### Phase 1: Foundation Setup (Kaspa NG Pattern)

**Objective**: Establish basic Chrome extension structure following Kaspa NG patterns with OpenMina WASM loading.

#### 1.1 Manifest Configuration

```json
{
    "manifest_version": 3,
    "name": "OpenMina Node",
    "version": "0.1.0",
    "description": "OpenMina blockchain node in browser",

    "permissions": ["scripting", "alarms", "storage", "activeTab"],

    "host_permissions": ["https://*/*", "http://*/*"],

    "content_security_policy": {
        "extension_pages": "default-src 'self' 'wasm-unsafe-eval'; connect-src 'self' *"
    },

    "background": {
        "service_worker": "background.js",
        "type": "module"
    },

    "action": {
        "default_popup": "popup.html",
        "default_title": "OpenMina Node"
    },

    "web_accessible_resources": [
        {
            "resources": ["openmina_node_web.js", "openmina_node_web_bg.wasm", "snippets/*"],
            "matches": ["<all_urls>"]
        }
    ]
}
```

#### 1.2 Background Service Worker (background.js)

```javascript
// background.js - Following Kaspa NG pattern
import init from "./openmina_node_web.js"

let nodeInstance = null
let rpcInterface = null

async function initializeNode() {
    try {
        console.log("Initializing OpenMina WASM module...")

        // Initialize WASM module (following Kaspa NG pattern)
        const wasm = await init("./openmina_node_web_bg.wasm")

        // Configure node parameters (based on OpenMina lifecycle)
        const config = {
            blockProducerKey: null, // Non-block-producing node for MVP
            seedNodesUrl: "https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt",
        }

        // Start node (following OpenMina run() pattern)
        rpcInterface = await wasm.run(
            config.blockProducerKey,
            config.seedNodesUrl,
            null // genesis config URL
        )

        nodeInstance = wasm
        console.log("OpenMina node initialized successfully")

        // Notify popup of successful initialization
        chrome.runtime.sendMessage({
            type: "NODE_INITIALIZED",
            payload: "Node running",
        })
    } catch (error) {
        console.error("Failed to initialize OpenMina node:", error)
        chrome.runtime.sendMessage({
            type: "NODE_ERROR",
            payload: error.message,
        })
    }
}

// Message handling for popup communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "INIT_NODE":
            initializeNode()
            sendResponse({ status: "initializing" })
            break

        case "GET_STATUS":
            if (rpcInterface) {
                rpcInterface.get_status().then((status) => {
                    sendResponse({ status })
                })
            } else {
                sendResponse({ error: "Node not initialized" })
            }
            break

        default:
            sendResponse({ error: "Unknown message type" })
    }

    return true // Keep message channel open for async response
})

console.log("OpenMina background service worker loaded")
```

#### 1.3 Popup Interface (popup.html)

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>OpenMina Node</title>
        <style>
            body {
                width: 350px;
                padding: 16px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }

            .header {
                text-align: center;
                margin-bottom: 20px;
            }

            .status-card {
                background: #f5f5f5;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
            }

            .status-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 8px;
            }

            .status-running {
                background: #4caf50;
            }
            .status-error {
                background: #f44336;
            }
            .status-idle {
                background: #9e9e9e;
            }

            button {
                width: 100%;
                padding: 10px;
                border: none;
                border-radius: 6px;
                background: #2196f3;
                color: white;
                cursor: pointer;
                font-size: 14px;
            }

            button:hover {
                background: #1976d2;
            }

            button:disabled {
                background: #cccccc;
                cursor: not-allowed;
            }

            .details {
                font-size: 12px;
                color: #666;
                margin-top: 8px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>OpenMina Node</h2>
        </div>

        <div class="status-card">
            <div id="status-display">
                <span class="status-indicator status-idle"></span>
                <span id="status-text">Node Idle</span>
            </div>
            <div class="details" id="status-details">Click "Start Node" to initialize</div>
        </div>

        <button id="start-btn">Start Node</button>
        <button id="status-btn" style="margin-top: 8px;" disabled>Get Status</button>

        <script src="popup.js" type="module"></script>
    </body>
</html>
```

#### 1.4 Popup Logic (popup.js)

```javascript
// popup.js - Following Kaspa NG popup pattern
import init from "./openmina_node_web.js"

let localWasmInstance = null
let localRpcInterface = null

// UI Elements
const startBtn = document.getElementById("start-btn")
const statusBtn = document.getElementById("status-btn")
const statusText = document.getElementById("status-text")
const statusDetails = document.getElementById("status-details")
const statusIndicator = document.querySelector(".status-indicator")

// Initialize popup WASM instance (for UI interactions)
async function initPopupWasm() {
    try {
        console.log("Initializing popup WASM instance...")
        localWasmInstance = await init("./openmina_node_web_bg.wasm")
        console.log("Popup WASM instance ready")
    } catch (error) {
        console.error("Failed to initialize popup WASM:", error)
    }
}

// Update UI status
function updateStatus(status, details, indicator = "idle") {
    statusText.textContent = status
    statusDetails.textContent = details

    statusIndicator.className = `status-indicator status-${indicator}`
}

// Start node via background script
async function startNode() {
    startBtn.disabled = true
    startBtn.textContent = "Starting..."
    updateStatus("Initializing...", "Starting OpenMina node", "idle")

    try {
        const response = await chrome.runtime.sendMessage({ type: "INIT_NODE" })
        console.log("Node initialization requested:", response)
    } catch (error) {
        console.error("Failed to start node:", error)
        updateStatus("Error", error.message, "error")
        startBtn.disabled = false
        startBtn.textContent = "Start Node"
    }
}

// Get node status
async function getNodeStatus() {
    try {
        const response = await chrome.runtime.sendMessage({ type: "GET_STATUS" })

        if (response.status) {
            const status = response.status
            updateStatus("Running", `Peers: ${status.p2p?.peers?.length || 0}`, "running")
            statusBtn.disabled = false
        } else {
            updateStatus("Error", response.error || "Unknown error", "error")
        }
    } catch (error) {
        console.error("Failed to get status:", error)
        updateStatus("Error", error.message, "error")
    }
}

// Event listeners
startBtn.addEventListener("click", startNode)
statusBtn.addEventListener("click", getNodeStatus)

// Listen for background script messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "NODE_INITIALIZED":
            updateStatus("Running", "Node initialized successfully", "running")
            startBtn.textContent = "Node Running"
            statusBtn.disabled = false
            break

        case "NODE_ERROR":
            updateStatus("Error", message.payload, "error")
            startBtn.disabled = false
            startBtn.textContent = "Start Node"
            break
    }
})

// Initialize popup
initPopupWasm()
console.log("OpenMina popup loaded")
```

### Phase 2: OpenMina WASM Integration

**Objective**: Integrate OpenMina-specific WASM compilation and loading patterns.

#### 2.1 WASM Compilation Setup

Following OpenMina webnode lifecycle documentation:

```bash
# Build OpenMina WASM with proper configuration
cd node/web
cargo +nightly build --release --target wasm32-unknown-unknown

# Generate JavaScript bindings with --target web (like Kaspa NG)
wasm-bindgen --target web --keep-debug \
  --out-dir ../../extension/dist \
  ../../target/wasm32-unknown-unknown/release/openmina_node_web.wasm
```

#### 2.2 Required Supporting Files

Based on OpenMina lifecycle requirements:

```
extension/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── dist/
│   ├── openmina_node_web.js
│   ├── openmina_node_web_bg.wasm
│   └── snippets/
│       ├── wasm_thread-*/worker.js
│       └── p2p-*/worker.js
├── circuit-blobs/
│   └── 3.0.1devnet/
│       ├── block_verifier_index.postcard
│       └── transaction_verifier_index.postcard
└── config/
    └── web-node-secrets.json
```

#### 2.3 Configuration Integration

```javascript
// Enhanced background.js with OpenMina-specific configuration
async function loadNodeConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL("config/web-node-secrets.json"))
        return await response.json()
    } catch (error) {
        console.warn("Using default configuration:", error)
        return {
            blockProducerKey: null,
            seedNodesUrl: "https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt",
        }
    }
}

async function initializeNode() {
    try {
        const config = await loadNodeConfig()
        const wasm = await init("./dist/openmina_node_web_bg.wasm")

        // Use OpenMina's run() function signature
        rpcInterface = await wasm.run(
            config.blockProducerKey,
            config.seedNodesUrl,
            null // genesis config URL - use default devnet
        )

        // Handle the "cursed hack" error (expected behavior)
        window.addEventListener("error", (event) => {
            if (event.message.includes("Cursed hack to keep workers alive")) {
                console.log("Worker keep-alive hack triggered (expected)")
                event.preventDefault()
            }
        })

        nodeInstance = wasm
        rpcInterface = rpc
    } catch (error) {
        console.error("Node initialization failed:", error)
    }
}
```

### Phase 3: Threading Support (If Required)

**Objective**: Enable WebAssembly threading if needed for full OpenMina functionality.

#### 3.1 Cross-Origin Isolation (Conditional)

Only implement if threading is actually required:

```json
// manifest.json additions (only if threading needed)
{
    "cross_origin_opener_policy": {
        "value": "same-origin"
    },
    "cross_origin_embedder_policy": {
        "value": "require-corp"
    }
}
```

#### 3.2 Threading Detection

```javascript
// Check if threading is available and required
function checkThreadingSupport() {
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== "undefined"
    const isCrossOriginIsolated = window.crossOriginIsolated

    console.log("Threading support:", {
        hasSharedArrayBuffer,
        isCrossOriginIsolated,
    })

    return hasSharedArrayBuffer && isCrossOriginIsolated
}
```

## File Structure

```
openmina-chrome-extension/
├── manifest.json                 # Chrome extension manifest
├── background.js                 # Service worker with WASM loading
├── popup.html                    # Extension popup UI
├── popup.js                      # Popup logic and local WASM
├── dist/                         # WASM build output
│   ├── openmina_node_web.js      # Generated JS bindings
│   ├── openmina_node_web_bg.wasm # WASM binary
│   └── snippets/                 # Worker thread snippets
├── circuit-blobs/                # OpenMina circuit verification files
│   └── 3.0.1devnet/
├── config/                       # Configuration files
│   └── web-node-secrets.json
└── icons/                        # Extension icons
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

## Integration with OpenMina Lifecycle

### Node Initialization Flow

1. **WASM Loading**: Direct ES module import (Kaspa NG pattern)
2. **Configuration**: Load from web-node-secrets.json
3. **Node Setup**: Call wasm.run() with OpenMina parameters
4. **RPC Interface**: Store returned RPC interface for status queries
5. **Worker Management**: Handle "cursed hack" errors as expected behavior

### Status Monitoring

```javascript
// Periodic status updates following OpenMina patterns
async function monitorNodeStatus() {
    if (!rpcInterface) return

    try {
        const status = await rpcInterface.get_status()

        // Extract key metrics following OpenMina status structure
        const metrics = {
            peers: status.p2p?.peers?.length || 0,
            blockHeight: status.transition_frontier?.best_tip?.blockchain_length || 0,
            syncProgress: calculateSyncProgress(status),
        }

        // Update UI with current status
        chrome.runtime.sendMessage({
            type: "STATUS_UPDATE",
            payload: metrics,
        })
    } catch (error) {
        console.error("Status monitoring error:", error)
    }
}

// Start monitoring after node initialization
setInterval(monitorNodeStatus, 5000)
```

## Success Criteria

### Phase 1 Success Metrics

-   [ ] Extension loads without CSP violations
-   [ ] WASM module initializes successfully
-   [ ] Basic popup UI displays node status
-   [ ] Background service worker communicates with popup

### Phase 2 Success Metrics

-   [ ] OpenMina WASM compiles and loads
-   [ ] Node initialization completes without errors
-   [ ] RPC interface returns valid status data
-   [ ] Circuit blobs load correctly

### Phase 3 Success Metrics (If Threading Required)

-   [ ] Cross-origin isolation achieved
-   [ ] SharedArrayBuffer available
-   [ ] Worker threads function correctly
-   [ ] Full node synchronization works

## Risk Mitigation

### Known Challenges

1. **"Cursed Hack" Errors**: Expected behavior, not actual errors
2. **Circuit Blob Loading**: Ensure all required files are present
3. **Worker Snippet Paths**: Verify snippet directory structure
4. **Memory Limits**: Monitor WASM memory usage

### Fallback Strategies

1. **Threading Issues**: Start without threading, add incrementally
2. **WASM Loading Failures**: Detailed error logging and user feedback
3. **Network Connectivity**: Graceful handling of seed node failures
4. **Resource Loading**: Retry mechanisms for circuit blobs and config

This plan eliminates the complex bundling approach in favor of the proven Kaspa NG pattern, providing a clear path to a working OpenMina Chrome extension.
