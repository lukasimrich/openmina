#!/bin/bash

# OpenMina Chrome Extension Circuit Blobs Download Script
# Based on the circuit blob requirements from memory-bank/openmina-webnode-lifecycle.md

set -e

echo "📦 Downloading OpenMina Circuit Blobs..."

# Set the base URL for OpenMina circuit blobs
OPENMINA_BASE_URL="https://github.com/openmina"
CIRCUITS_BASE_URL="$OPENMINA_BASE_URL/circuit-blobs/releases/download"
CIRCUITS_VERSION="3.0.1devnet"

# Required circuit blob files for devnet
DEVNET_CIRCUIT_FILES=(
    "block_verifier_index.postcard"
    "transaction_verifier_index.postcard"
    "step-step-proving-key-blockchain-snark-step-0-55f640777b6486a6fd3fdbc3fcffcc60_gates.json"
    "step-step-proving-key-blockchain-snark-step-0-55f640777b6486a6fd3fdbc3fcffcc60_internal_vars.bin"
    "step-step-proving-key-blockchain-snark-step-0-55f640777b6486a6fd3fdbc3fcffcc60_rows_rev.bin"
    "step-step-proving-key-transaction-snark-merge-1-ba1d52dfdc2dd4d2e61f6c66ff2a5b2f_gates.json"
    "step-step-proving-key-transaction-snark-merge-1-ba1d52dfdc2dd4d2e61f6c66ff2a5b2f_internal_vars.bin"
    "step-step-proving-key-transaction-snark-merge-1-ba1d52dfdc2dd4d2e61f6c66ff2a5b2f_rows_rev.bin"
    "wrap-wrap-proving-key-blockchain-snark-bbecaf158ca543ec8ac9e7144400e669_gates.json"
    "wrap-wrap-proving-key-blockchain-snark-bbecaf158ca543ec8ac9e7144400e669_internal_vars.bin"
    "wrap-wrap-proving-key-blockchain-snark-bbecaf158ca543ec8ac9e7144400e669_rows_rev.bin"
    "wrap-wrap-proving-key-transaction-snark-b9a01295c8cc9bda6d12142a581cd305_gates.json"
    "wrap-wrap-proving-key-transaction-snark-b9a01295c8cc9bda6d12142a581cd305_internal_vars.bin"
    "wrap-wrap-proving-key-transaction-snark-b9a01295c8cc9bda6d12142a581cd305_rows_rev.bin"
)

DOWNLOAD_DIR="circuit-blobs/$CIRCUITS_VERSION"

echo "📁 Creating directory: $DOWNLOAD_DIR"
mkdir -p "$DOWNLOAD_DIR"

echo "🌐 Downloading from: $CIRCUITS_BASE_URL/$CIRCUITS_VERSION"
echo ""

# Download each required file
for FILE in "${DEVNET_CIRCUIT_FILES[@]}"; do
    if [[ -f "$DOWNLOAD_DIR/$FILE" ]]; then
        echo "✅ $FILE already exists, skipping download."
    else
        echo "⬇️  Downloading $FILE..."
        
        # Download with retry logic
        if curl -s -L --retry 3 --retry-delay 5 -o "$DOWNLOAD_DIR/$FILE" "$CIRCUITS_BASE_URL/$CIRCUITS_VERSION/$FILE"; then
            echo "✅ $FILE downloaded successfully"
        else
            echo "❌ Failed to download $FILE after 3 attempts"
            echo "   URL: $CIRCUITS_BASE_URL/$CIRCUITS_VERSION/$FILE"
            exit 1
        fi
    fi
done

echo ""
echo "📊 Download Summary:"
echo "📁 Directory: $DOWNLOAD_DIR"
echo "📦 Files downloaded: ${#DEVNET_CIRCUIT_FILES[@]}"

# Verify all files exist and show sizes
echo ""
echo "📋 File verification:"
for FILE in "${DEVNET_CIRCUIT_FILES[@]}"; do
    if [[ -f "$DOWNLOAD_DIR/$FILE" ]]; then
        SIZE=$(du -h "$DOWNLOAD_DIR/$FILE" | cut -f1)
        echo "✅ $FILE ($SIZE)"
    else
        echo "❌ $FILE (missing)"
    fi
done

echo ""
echo "🎉 Circuit blobs download complete!"
echo ""
echo "📋 Next steps:"
echo "1. Build WASM (run ./build-wasm.sh)"
echo "2. Load extension in Chrome"
echo "3. Test OpenMina node initialization"
echo ""
echo "💡 Note: These files are required for OpenMina's zero-knowledge proof verification"
