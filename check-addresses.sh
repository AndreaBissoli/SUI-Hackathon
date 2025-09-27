#!/bin/bash

# EduDeFi Platform - Address Management Helper

echo "🏗️  EduDeFi Platform - Address Helper"
echo "======================================"
echo ""

# Check if sui is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI not found. Please install Sui CLI first."
    echo "   Visit: https://docs.sui.io/guides/developer/getting-started/sui-install"
    exit 1
fi

# Show current active address
echo "📍 Current Active Address:"
CURRENT_ADDR=$(sui client active-address)
echo "   $CURRENT_ADDR"
echo ""

# Show all available addresses
echo "👥 Available Addresses:"
sui client addresses
echo ""

# Show network info
echo "🌐 Network Information:"
sui client active-env
echo ""

# Show gas balance for current address
echo "💰 Gas Balance (Current Address):"
sui client gas
echo ""

echo "🔄 Quick Address Switch Commands:"
echo "   sui client switch --address investor"
echo "   sui client switch --address student"
echo ""

echo "📦 Deploy Contract Command:"
echo "   cd move/edu_defi && sui client publish --gas-budget 100000000"
echo ""

echo "🚀 Ready to test EduDeFi platform!"