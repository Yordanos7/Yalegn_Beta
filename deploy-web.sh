#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci --include=dev

echo "Fixing SSR issues..."
./fix-ssr-issues.sh

echo "Generating Prisma client..."
cd packages/db
DATABASE_URL="$DATABASE_URL" npm run db:generate
cd ../..

echo "Building workspace packages..."
npx turbo build --filter=@my-better-t-app/db
npx turbo build --filter=@my-better-t-app/api  
npx turbo build --filter=@my-better-t-app/auth

echo "Building web app..."
npx turbo build --filter=web

echo "Build completed successfully!"