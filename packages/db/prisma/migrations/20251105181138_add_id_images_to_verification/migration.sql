-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROVIDER', 'SEEKER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('ETB', 'USD');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FIXED', 'HOURLY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'PROPOSAL', 'PAYMENT', 'VERIFICATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'INTERMEDIATE', 'EXPERT');

-- CreateEnum
CREATE TYPE "FreelancerLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "DeliveryTime" AS ENUM ('ONE_TO_THREE_DAYS', 'THREE_TO_SEVEN_DAYS', 'ONE_TO_TWO_WEEKS', 'TWO_TO_FOUR_WEEKS');

-- CreateEnum
CREATE TYPE "CategoryEnum" AS ENUM ('TECHNOLOGY', 'CREATIVE', 'BUSINESS_FINANCE', 'HEALTHCARE', 'EDUCATION', 'TRADES_SERVICES', 'HOSPITALITY_RETAIL');

-- CreateTable
CREATE TABLE "user" (
    "_id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "passwordHash" TEXT,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isOpenToWork" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "skills" (
    "_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "_id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "wallets" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'ETB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "conversations" (
    "_id" TEXT NOT NULL,
    "title" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "reviews" (
    "_id" TEXT NOT NULL,
    "aboutId" TEXT NOT NULL,
    "byId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "portfolio" (
    "_id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media" TEXT[],
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "admin_notes" (
    "_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_notes_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "_id" TEXT NOT NULL,
    "userId" TEXT,
    "faidaIdNumber" TEXT,
    "documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "idFrontImage" TEXT,
    "idBackImage" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'NONE',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "_ListingToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ListingToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_JobToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ConversationParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ConversationParticipants_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_verificationId_key" ON "user"("verificationId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profileId_key" ON "user"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "user_walletId_key" ON "user"("walletId");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "profile_skills_profileId_skillId_key" ON "profile_skills"("profileId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "listings_slug_key" ON "listings"("slug");

-- CreateIndex
CREATE INDEX "listings_providerId_idx" ON "listings"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_slug_key" ON "jobs"("slug");

-- CreateIndex
CREATE INDEX "jobs_seekerId_idx" ON "jobs"("seekerId");

-- CreateIndex
CREATE INDEX "proposals_jobId_idx" ON "proposals"("jobId");

-- CreateIndex
CREATE INDEX "proposals_providerId_idx" ON "proposals"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_jobId_key" ON "contracts"("jobId");

-- CreateIndex
CREATE INDEX "contracts_jobId_idx" ON "contracts"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE INDEX "transactions_walletId_idx" ON "transactions"("walletId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_fromUserId_toUserId_idx" ON "messages"("fromUserId", "toUserId");

-- CreateIndex
CREATE INDEX "reviews_aboutId_idx" ON "reviews"("aboutId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_userId_key" ON "verifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_contractId_key" ON "disputes"("contractId");

-- CreateIndex
CREATE INDEX "_ListingToSkill_B_index" ON "_ListingToSkill"("B");

-- CreateIndex
CREATE INDEX "_JobToSkill_B_index" ON "_JobToSkill"("B");

-- CreateIndex
CREATE INDEX "_ConversationParticipants_B_index" ON "_ConversationParticipants"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "verifications"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coin_purchases" ADD CONSTRAINT "coin_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_aboutId_fkey" FOREIGN KEY ("aboutId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_byId_fkey" FOREIGN KEY ("byId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToSkill" ADD CONSTRAINT "_ListingToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "listings"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ListingToSkill" ADD CONSTRAINT "_ListingToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToSkill" ADD CONSTRAINT "_JobToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "jobs"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JobToSkill" ADD CONSTRAINT "_JobToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConversationParticipants" ADD CONSTRAINT "_ConversationParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "conversations"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ConversationParticipants" ADD CONSTRAINT "_ConversationParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
