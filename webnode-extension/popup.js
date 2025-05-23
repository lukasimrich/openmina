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
