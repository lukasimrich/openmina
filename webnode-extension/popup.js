// popup.js - Following Kaspa NG popup pattern
// Note: We don't import the WASM module directly in popup to avoid conflicts
// The background service worker handles all WASM operations

let localWasmInstance = null
let localRpcInterface = null

// UI Elements
const startBtn = document.getElementById("start-btn")
const statusBtn = document.getElementById("status-btn")
const statusText = document.getElementById("status-text")
const statusDetails = document.getElementById("status-details")
const statusIndicator = document.querySelector(".status-indicator")

// Initialize popup (no local WASM instance to avoid conflicts)
async function initPopup() {
    try {
        console.log("Initializing popup UI...")

        // The popup communicates with the background service worker
        // which handles all WASM operations to avoid initialization conflicts
        console.log("Popup ready - all WASM operations handled by background service worker")
    } catch (error) {
        console.error("Failed to initialize popup:", error)
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
            const details = `Peers: ${status.peers} | Height: ${status.blockHeight} | Sync: ${status.syncProgress}%`
            updateStatus("Running", details, "running")
            statusBtn.disabled = false

            // Update additional UI elements if they exist
            updateDetailedStatus(status)
        } else {
            updateStatus("Error", response.error || "Unknown error", "error")
        }
    } catch (error) {
        console.error("Failed to get status:", error)
        updateStatus("Error", error.message, "error")
    }
}

// Update detailed status information
function updateDetailedStatus(status) {
    // Add more detailed status information to the UI
    const timestamp = new Date(status.timestamp).toLocaleTimeString()
    console.log(`📊 Node Status (${timestamp}):`, {
        peers: status.peers,
        blockHeight: status.blockHeight,
        syncProgress: status.syncProgress + '%',
        lastUpdate: timestamp
    })
}

// Stop node
async function stopNode() {
    try {
        const response = await chrome.runtime.sendMessage({ type: "STOP_NODE" })
        if (response.status === "stopped") {
            updateStatus("Stopped", "Node has been stopped", "idle")
            startBtn.disabled = false
            startBtn.textContent = "Start Node"
            statusBtn.disabled = true
        }
    } catch (error) {
        console.error("Failed to stop node:", error)
        updateStatus("Error", error.message, "error")
    }
}

// Get configuration
async function getConfig() {
    try {
        const response = await chrome.runtime.sendMessage({ type: "GET_CONFIG" })
        if (response.config) {
            console.log("📝 Node Configuration:", response.config)
            return response.config
        } else {
            console.error("Failed to get config:", response.error)
        }
    } catch (error) {
        console.error("Failed to get config:", error)
    }
    return null
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

            // Load and display configuration
            getConfig()
            break

        case "NODE_ERROR":
            updateStatus("Error", message.payload, "error")
            startBtn.disabled = false
            startBtn.textContent = "Start Node"
            break

        case "STATUS_UPDATE":
            // Automatic status updates from background monitoring
            if (message.payload) {
                const status = message.payload
                const details = `Peers: ${status.peers} | Height: ${status.blockHeight} | Sync: ${status.syncProgress}%`
                updateStatus("Running", details, "running")
                updateDetailedStatus(status)
            }
            break
    }
})

// Initialize popup
initPopup()
console.log("OpenMina popup loaded")
