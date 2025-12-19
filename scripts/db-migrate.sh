#!/bin/bash

# Database Migration Script for Production
echo "🗄️ Running database migrations..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please set your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
    exit 1
fi

echo "📋 Database URL found"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate --schema=./packages/db/prisma/schema/schema.prisma

# Push database schema
echo "📤 Pushing database schema..."
npx prisma db push --schema=./packages/db/prisma/schema/schema.prisma

# Optional: Seed database (if you have seed data)
# echo "🌱 Seeding database..."
# npx prisma db seed --schema=./packages/db/prisma/schema/schema.prisma

echo "✅ Database migration complete!"