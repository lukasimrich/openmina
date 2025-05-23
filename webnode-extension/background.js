// background.js - Following Kaspa NG pattern
import init from "./openmina_node_web.js"

let nodeInstance = null
let rpcInterface = null

// Load node configuration from web-node-secrets.json
async function loadNodeConfig() {
    try {
        const response = await fetch(chrome.runtime.getURL("config/web-node-secrets.json"))
        const config = await response.json()
        console.log("✅ Configuration loaded:", {
            hasBlockProducerKey: !!config.blockProducerKey,
            seedNodesUrl: config.seedNodesUrl
        })
        return config
    } catch (error) {
        console.warn("⚠️  Using default configuration:", error.message)
        return {
            blockProducerKey: null,
            seedNodesUrl: "https://bootnodes.minaprotocol.com/networks/devnet-webrtc.txt",
        }
    }
}

async function initializeNode() {
    try {
        console.log("🚀 Initializing OpenMina WASM module...")

        // Load configuration first
        const config = await loadNodeConfig()

        // Initialize WASM module (following Kaspa NG pattern)
        console.log("📦 Loading WASM binary...")
        const wasm = await init("./openmina_node_web_bg.wasm")
        console.log("✅ WASM module loaded successfully")

        // Handle the "cursed hack" error (expected behavior)
        window.addEventListener("error", (event) => {
            if (event.message && event.message.includes("Cursed hack to keep workers alive")) {
                console.log("🔧 Worker keep-alive hack triggered (expected behavior)")
                event.preventDefault()
                return false
            }
        })

        // Start node (following OpenMina run() pattern)
        console.log("🌐 Starting OpenMina node with configuration...")
        rpcInterface = await wasm.run(
            config.blockProducerKey,
            config.seedNodesUrl,
            null // genesis config URL - use default devnet
        )

        nodeInstance = wasm
        console.log("🎉 OpenMina node initialized successfully")

        // Start periodic status monitoring
        startStatusMonitoring()

        // Notify popup of successful initialization
        chrome.runtime.sendMessage({
            type: "NODE_INITIALIZED",
            payload: "Node running",
        })
    } catch (error) {
        console.error("❌ Failed to initialize OpenMina node:", error)

        // Provide more detailed error information
        let errorMessage = error.message
        if (error.message.includes("Loading CSS chunk")) {
            errorMessage = "WASM loading error - ensure files are built and accessible"
        } else if (error.message.includes("fetch")) {
            errorMessage = "Network error - check configuration and connectivity"
        }

        chrome.runtime.sendMessage({
            type: "NODE_ERROR",
            payload: errorMessage,
        })
    }
}

// Periodic status monitoring following OpenMina patterns
let statusMonitoringInterval = null

function startStatusMonitoring() {
    if (statusMonitoringInterval) {
        clearInterval(statusMonitoringInterval)
    }

    statusMonitoringInterval = setInterval(async () => {
        if (!rpcInterface) return

        try {
            const status = await rpcInterface.get_status()

            // Extract key metrics following OpenMina status structure
            const metrics = {
                peers: status.p2p?.peers?.length || 0,
                blockHeight: status.transition_frontier?.best_tip?.blockchain_length || 0,
                syncProgress: calculateSyncProgress(status),
                timestamp: Date.now()
            }

            // Update popup with current status
            chrome.runtime.sendMessage({
                type: "STATUS_UPDATE",
                payload: metrics,
            })
        } catch (error) {
            console.error("Status monitoring error:", error)
        }
    }, 5000) // Update every 5 seconds
}

function calculateSyncProgress(status) {
    if (!status || !status.transition_frontier) {
        return 0
    }

    const bestTip = status.transition_frontier.best_tip
    if (!bestTip) {
        return 0
    }

    const currentHeight = bestTip.blockchain_length
    const maxHeight = status.transition_frontier.max_observed_height || currentHeight

    return Math.min(100, Math.round((currentHeight / maxHeight) * 100))
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
                    const metrics = {
                        peers: status.p2p?.peers?.length || 0,
                        blockHeight: status.transition_frontier?.best_tip?.blockchain_length || 0,
                        syncProgress: calculateSyncProgress(status),
                        timestamp: Date.now(),
                        fullStatus: status
                    }
                    sendResponse({ status: metrics })
                }).catch((error) => {
                    sendResponse({ error: `Status query failed: ${error.message}` })
                })
            } else {
                sendResponse({ error: "Node not initialized" })
            }
            break

        case "STOP_NODE":
            if (statusMonitoringInterval) {
                clearInterval(statusMonitoringInterval)
                statusMonitoringInterval = null
            }
            nodeInstance = null
            rpcInterface = null
            sendResponse({ status: "stopped" })
            break

        case "GET_CONFIG":
            loadNodeConfig().then((config) => {
                sendResponse({ config })
            }).catch((error) => {
                sendResponse({ error: `Config load failed: ${error.message}` })
            })
            break

        default:
            sendResponse({ error: "Unknown message type" })
    }

    return true // Keep message channel open for async response
})

console.log("OpenMina background service worker loaded")
