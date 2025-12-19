-- Create Admin User
-- Run this in your Supabase SQL Editor

INSERT INTO "user" (
    "_id",
    "email",
    "emailVerified",
    "passwordHash",
    "role",
    "accountType",
    "onboarded",
    "name",
    "username",
    "isActive",
    "isVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    'admin_yordanos_001',
    'yordanos@yalegn.com',
    true,
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.93iHSW', -- This is hashed 'yordi@0721'
    'ADMIN',
    'INDIVIDUAL',
    true,
    'yordanos',
    'yordanos',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT ("_id") DO NOTHING;

-- Create admin profile
INSERT INTO "profiles" (
    "_id",
    "userId",
    "headline",
    "isPublicFreelancer",
    "createdAt",
    "updatedAt"
) VALUES (
    'profile_admin_001',
    'admin_yordanos_001',
    'System Administrator',
    false,
    NOW(),
    NOW()
) ON CONFLICT ("_id") DO NOTHING;

-- Link user to profile
UPDATE "user" 
SET "profileId" = 'profile_admin_001'
WHERE "_id" = 'admin_yordanos_001';