#!/bin/bash

# Deployment Setup Script
echo "🚀 Setting up deployment for my-better-t-app..."

# Check if required files exist
echo "📋 Checking deployment files..."

if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found"
    exit 1
fi

if [ ! -f "render.yaml" ]; then
    echo "❌ render.yaml not found"
    exit 1
fi

echo "✅ Deployment files found"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build packages
echo "🔨 Building packages..."
npm run build

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate --schema=./packages/db/prisma/schema/schema.prisma

echo "✅ Deployment setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up Supabase database"
echo "2. Deploy to Render"
echo "3. Set environment variables"
echo "4. Run database migrations"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."