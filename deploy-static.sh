#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci

echo "Building static export..."
cd apps/web
# Temporarily disable workspace packages for static build
sed -i 's/"@my-better-t-app\/api": "\*",//g' package.json
sed -i 's/"@my-better-t-app\/auth": "\*",//g' package.json
npm install
npm run build

echo "Static build completed!"