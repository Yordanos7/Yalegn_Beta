#!/bin/bash
set -e

echo "Installing all dependencies..."
npm ci --include=dev

echo "Building workspace packages..."
npx turbo build --filter=@my-better-t-app/db
npx turbo build --filter=@my-better-t-app/api
npx turbo build --filter=@my-better-t-app/auth

echo "Building frontend..."
cd apps/web
npm run build

echo "Frontend build completed successfully!"