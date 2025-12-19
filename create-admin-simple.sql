-- Simple Admin User Creation
-- Run this in Supabase SQL Editor

-- First, let's create the admin user
INSERT INTO "user" (
    "_id",
    "email",
    "name",
    "username",
    "role",
    "accountType",
    "onboarded",
    "isActive",
    "isVerified",
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin_yordanos_001',
    'yordanos@yalegn.com',
    'Yordanos',
    'yordanos',
    'ADMIN',
    'INDIVIDUAL',
    true,
    true,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT ("_id") DO UPDATE SET
    "role" = 'ADMIN',
    "isActive" = true,
    "isVerified" = true;

-- Check if user was created
SELECT "_id", "name", "username", "email", "role" FROM "user" WHERE "username" = 'yordanos';