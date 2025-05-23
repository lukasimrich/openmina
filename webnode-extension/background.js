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
