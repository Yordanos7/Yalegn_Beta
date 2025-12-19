#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci --include=dev

echo "Generating Prisma client..."
cd packages/db
DATABASE_URL="postgresql://postgres:QEtIwdgA1qZe4e0s@db.gvnyuwhbfjscwjaxjfuy.supabase.co:5432/postgres" npm run db:generate
cd ../..

echo "Building server..."
npx turbo build --filter=server

echo "Build completed successfully!"