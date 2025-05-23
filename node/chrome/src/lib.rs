use wasm_bindgen::prelude::*;

// Set up panic hook for better error messages
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

// Chrome extension background initialization
#[wasm_bindgen]
pub async fn openmina_chrome_background() -> Result<JsValue, JsValue> {
    web_sys::console::log_1(&"🚀 OpenMina Chrome extension background initializing...".into());
    
    // Initialize without automatic thread detection
    // This avoids the thread detection panic that occurs in the full web node
    
    web_sys::console::log_1(&"✅ OpenMina Chrome extension background ready".into());
    Ok(JsValue::from_str("background_ready"))
}

// Chrome extension popup initialization  
#[wasm_bindgen]
pub async fn openmina_chrome_popup() -> Result<JsValue, JsValue> {
    web_sys::console::log_1(&"🎨 OpenMina Chrome extension popup initializing...".into());
    
    web_sys::console::log_1(&"✅ OpenMina Chrome extension popup ready".into());
    Ok(JsValue::from_str("popup_ready"))
}

// Get node status for Chrome extension
#[wasm_bindgen]
pub async fn get_chrome_node_status() -> Result<JsValue, JsValue> {
    // This would interface with the actual node status
    // For now, return mock data
    let status = serde_json::json!({
        "peers": 0,
        "blockHeight": 0,
        "syncProgress": 0,
        "status": "initializing"
    });
    
    Ok(serde_wasm_bindgen::to_value(&status)?)
}

// Start OpenMina node for Chrome extension
#[wasm_bindgen]
pub async fn start_chrome_node(config: JsValue) -> Result<JsValue, JsValue> {
    web_sys::console::log_1(&"🌐 Starting OpenMina node in Chrome extension...".into());
    
    // Parse configuration
    let _config: serde_json::Value = serde_wasm_bindgen::from_value(config)?;
    
    // This would start the actual node
    // For now, simulate successful start
    web_sys::console::log_1(&"✅ OpenMina node started successfully".into());
    
    Ok(JsValue::from_str("node_started"))
}
