#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building frontend..."
cd apps/web
npm run build

echo "Frontend build completed successfully!"