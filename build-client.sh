#!/bin/bash

# Build React client
echo "Building React client..."
cd VBALL.Client
npm ci
npm run build

# Create volume directory if it doesn't exist
mkdir -p ../nginx-static

# Copy build output to nginx static directory
echo "Copying build files to nginx static directory..."
cp -r build/* ../nginx-static/

echo "Client build completed!"
