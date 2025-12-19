-- Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Create enums first
CREATE TYPE "Role" AS ENUM ('PROVIDER', 'SEEKER', 'ADMIN');
CREATE TYPE "Currency" AS ENUM ('ETB', 'USD');
CREATE TYPE "JobType" AS ENUM ('FIXED', 'HOURLY');
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_RECEIVED', 'DELIVERY_PENDING', 'DELIVERED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "VerificationStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'PROPOSAL', 'PAYMENT', 'VERIFICATION', 'SYSTEM');
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'INTERMEDIATE', 'EXPERT');
CREATE TYPE "FreelancerLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR');
CREATE TYPE "DeliveryTime" AS ENUM ('ONE_TO_THREE_DAYS', 'THREE_TO_SEVEN_DAYS', 'ONE_TO_TWO_WEEKS', 'TWO_TO_FOUR_WEEKS');
CREATE TYPE "CategoryEnum" AS ENUM ('TECHNOLOGY', 'CREATIVE', 'BUSINESS_FINANCE', 'HEALTHCARE', 'EDUCATION', 'TRADES_SERVICES', 'HOSPITALITY_RETAIL');

-- Create tables
CREATE TABLE "user" (
    "_id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN DEFAULT false,
    "phone" TEXT,
    "passwordHash" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'PROVIDER',
    "accountType" "AccountType",
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "image" TEXT DEFAULT '/placeholder-avatar.jpg',
    "location" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationId" TEXT,
    "profileId" TEXT,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "walletId" TEXT,
    "lastSeen" TIMESTAMP(3),
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isOpenToWork" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "session" (
    "_id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "account" (
    "_id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "profiles" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "hourlyRate" DOUBLE PRECISION,
    "currency" "Currency" DEFAULT 'ETB',
    "availability" TEXT,
    "experience" JSONB,
    "education" JSONB,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "howHear" TEXT,
    "howHearOther" TEXT,
    "individualFocus" TEXT,
    "organizationPurpose" TEXT,
    "isPublicFreelancer" BOOLEAN NOT NULL DEFAULT false,
    "mainCategory" "CategoryEnum",
    "rateTypePreference" "JobType",
    "experienceLevel" "ExperienceLevel",
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "freelancerLevel" "FreelancerLevel",
    "deliveryTime" "DeliveryTime",

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "skills" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "profile_skills" (
    "_id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "listings" (
    "_id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "deliveryDays" INTEGER,
    "category" "CategoryEnum",
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "orders" (
    "_id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "paymentDetails" JSONB NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "deliveryProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "jobs" (
    "_id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "JobType" NOT NULL DEFAULT 'FIXED',
    "budgetMin" DOUBLE PRECISION,
    "budgetMax" DOUBLE PRECISION,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "deadline" TIMESTAMP(3),
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "proposals" (
    "_id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "price" DOUBLE PRECISION,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "estimatedDays" INTEGER,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "contracts" (
    "_id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "escrowId" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "milestones" (
    "_id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "wallets" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "transactions" (
    "_id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "coin_purchases" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "provider" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coin_purchases_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "conversations" (
    "_id" TEXT NOT NULL,
    "title" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "messages" (
    "_id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "reviews" (
    "_id" TEXT NOT NULL,
    "aboutId" TEXT NOT NULL,
    "byId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "contractId" TEXT,
    "listingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "portfolio" (
    "_id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "notifications" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "payload" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "admin_notes" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "verifications" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "faidaIdNumber" TEXT,
    "idFrontImage" TEXT,
    "idBackImage" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'NONE',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("_id")
);

CREATE TABLE "disputes" (
    "_id" TEXT NOT NULL,
    "contractId" TEXT,
    "raisedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("_id")
);

-- Junction table for many-to-many relationships
CREATE TABLE "_ConversationParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE TABLE "_JobToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE TABLE "_ListingToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Create unique constraints
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
CREATE UNIQUE INDEX "user_emailVerificationToken_key" ON "user"("emailVerificationToken");
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
CREATE UNIQUE INDEX "user_verificationId_key" ON "user"("verificationId");
CREATE UNIQUE INDEX "user_profileId_key" ON "user"("profileId");
CREATE UNIQUE INDEX "user_walletId_key" ON "user"("walletId");

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

CREATE UNIQUE INDEX "profile_skills_profileId_skillId_key" ON "profile_skills"("profileId", "skillId");

CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

CREATE UNIQUE INDEX "jobs_slug_key" ON "jobs"("slug");

CREATE UNIQUE INDEX "contracts_jobId_key" ON "contracts"("jobId");

CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

CREATE UNIQUE INDEX "verifications_userId_key" ON "verifications"("userId");

CREATE UNIQUE INDEX "disputes_contractId_key" ON "disputes"("contractId");

-- Create indexes for performance
CREATE INDEX "user_role_idx" ON "user"("role");
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");

CREATE INDEX "listings_providerId_idx" ON "listings"("providerId");

CREATE INDEX "orders_buyerId_idx" ON "orders"("buyerId");
CREATE INDEX "orders_listingId_idx" ON "orders"("listingId");
CREATE INDEX "orders_sellerId_idx" ON "orders"("sellerId");

CREATE INDEX "jobs_seekerId_idx" ON "jobs"("seekerId");

CREATE INDEX "proposals_jobId_idx" ON "proposals"("jobId");
CREATE INDEX "proposals_providerId_idx" ON "proposals"("providerId");

CREATE INDEX "contracts_jobId_idx" ON "contracts"("jobId");

CREATE INDEX "transactions_walletId_idx" ON "transactions"("walletId");

CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");
CREATE INDEX "messages_fromUserId_toUserId_idx" ON "messages"("fromUserId", "toUserId");

CREATE INDEX "reviews_aboutId_idx" ON "reviews"("aboutId");
CREATE INDEX "reviews_listingId_idx" ON "reviews"("listingId");

CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- Create unique indexes for junction tables
CREATE UNIQUE INDEX "_ConversationParticipants_AB_unique" ON "_ConversationParticipants"("A", "B");
CREATE INDEX "_ConversationParticipants_B_index" ON "_ConversationParticipants"("B");

CREATE UNIQUE INDEX "_JobToSkill_AB_unique" ON "_JobToSkill"("A", "B");
CREATE INDEX "_JobToSkill_B_index" ON "_JobToSkill"("B");

CREATE UNIQUE INDEX "_ListingToSkill_AB_unique" ON "_ListingToSkill"("A", "B");
CREATE INDEX "_ListingToSkill_B_index" ON "_ListingToSkill"("B");

-- Add foreign key constraints
ALTER TABLE "user" ADD CONSTRAINT "user_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "verifications"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user" ADD CONSTRAINT "user_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user" ADD CONSTRAINT "user_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "listings" ADD CONSTRAINT "listings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "jobs" ADD CONSTRAINT "jobs_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "proposals" ADD CONSTRAINT "proposals_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "coin_purchases" ADD CONSTRAINT "coin_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_byId_fkey" FOREIGN KEY ("byId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "verifications" ADD CONSTRAINT "verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "disputes" ADD CONSTRAINT "disputes_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Junction table foreign keys
ALTER TABLE "_ConversationParticipants" ADD CONSTRAINT "_ConversationParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ConversationParticipants" ADD CONSTRAINT "_ConversationParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_JobToSkill" ADD CONSTRAINT "_JobToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "jobs"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_JobToSkill" ADD CONSTRAINT "_JobToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ListingToSkill" ADD CONSTRAINT "_ListingToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ListingToSkill" ADD CONSTRAINT "_ListingToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("_id") ON DELETE CASCADE ON UPDATE CASCADE;