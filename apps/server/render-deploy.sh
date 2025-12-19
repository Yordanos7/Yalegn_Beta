#!/bin/bash

# Simple deployment script for Render
echo "Installing dependencies..."
npm ci --include=dev

echo "Building packages..."
cd ../../
npm run build

echo "Starting server..."
cd apps/server
npm start