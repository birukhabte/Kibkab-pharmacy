#!/bin/bash

echo "Starting Pharmacy App Backend..."
echo "================================"
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed!"
    echo ""
    echo "Please install Go first:"
    echo "  sudo snap install go --classic"
    echo ""
    echo "Or download from: https://go.dev/dl/"
    exit 1
fi

echo "✓ Go version: $(go version)"
echo ""

# Navigate to backend directory
cd backend

echo "Installing dependencies..."
go mod tidy

echo ""
echo "Starting server..."
echo "Backend will run on: http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

make run
