#!/bin/bash

# OpenMina Chrome Extension WASM Build Script
# Following the webnode lifecycle patterns from memory-bank/openmina-webnode-lifecycle.md

set -e

echo "🚀 Building OpenMina WASM for Chrome Extension..."

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v cargo &> /dev/null; then
    echo "❌ Error: cargo not found. Please install Rust."
    exit 1
fi

if ! command -v wasm-bindgen &> /dev/null; then
    echo "❌ Error: wasm-bindgen not found. Please install with:"
    echo "   cargo install wasm-bindgen-cli"
    exit 1
fi

# Check for nightly toolchain
if ! rustup toolchain list | grep -q nightly; then
    echo "❌ Error: Rust nightly toolchain not found. Please install with:"
    echo "   rustup toolchain install nightly"
    exit 1
fi

# Add wasm32 target if not present
rustup target add wasm32-unknown-unknown --toolchain nightly

echo "✅ Prerequisites check complete"

# Navigate to node/web directory
cd "$(dirname "$0")/../node/web"

echo "📦 Building WASM binary..."

# Build OpenMina WASM with proper configuration
# Following the exact command from webnode lifecycle documentation
cargo +nightly build --release --target wasm32-unknown-unknown

echo "🔧 Generating JavaScript bindings..."

# Generate JavaScript bindings with --target web (like Kaspa NG)
# Output to extension directory for direct loading
wasm-bindgen --target web --keep-debug \
  --out-dir ../../webnode-extension/ \
  ../../target/wasm32-unknown-unknown/release/openmina_node_web.wasm

echo "📁 Organizing files..."

# Move files to proper locations if needed
cd ../../webnode-extension

# Ensure the WASM files are in the right place for the extension
if [ -f "openmina_node_web_bg.wasm" ]; then
    echo "✅ WASM binary: openmina_node_web_bg.wasm"
fi

if [ -f "openmina_node_web.js" ]; then
    echo "✅ JS bindings: openmina_node_web.js"
fi

# Check for snippets directory (worker threads)
if [ -d "snippets" ]; then
    echo "✅ Worker snippets directory found"
    ls -la snippets/
else
    echo "⚠️  Worker snippets directory not found - may be created during build"
fi

echo ""
echo "🎉 WASM build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Download circuit blob files (run ./download-circuit-blobs.sh)"
echo "2. Load extension in Chrome (chrome://extensions/)"
echo "3. Test WASM loading in popup"
echo ""
echo "📁 Generated files:"
echo "  - openmina_node_web_bg.wasm (WASM binary)"
echo "  - openmina_node_web.js (JS bindings)"
echo "  - openmina_node_web.d.ts (TypeScript definitions)"
echo "  - snippets/ (Worker thread files)"
