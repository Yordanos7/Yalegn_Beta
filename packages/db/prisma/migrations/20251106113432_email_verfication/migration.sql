/*
  Warnings:

  - You are about to drop the `_ConversationParticipants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_JobToSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ListingToSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admin_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `coin_purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `contracts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `disputes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jobs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `listings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portfolio` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile_skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proposals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ConversationParticipants" DROP CONSTRAINT "_ConversationParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ConversationParticipants" DROP CONSTRAINT "_ConversationParticipants_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_JobToSkill" DROP CONSTRAINT "_JobToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_JobToSkill" DROP CONSTRAINT "_JobToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListingToSkill" DROP CONSTRAINT "_ListingToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ListingToSkill" DROP CONSTRAINT "_ListingToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."admin_notes" DROP CONSTRAINT "admin_notes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."coin_purchases" DROP CONSTRAINT "coin_purchases_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contracts" DROP CONSTRAINT "contracts_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."disputes" DROP CONSTRAINT "disputes_contractId_fkey";

-- DropForeignKey
ALTER TABLE "public"."jobs" DROP CONSTRAINT "jobs_seekerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."listings" DROP CONSTRAINT "listings_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."milestones" DROP CONSTRAINT "milestones_contractId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."portfolio" DROP CONSTRAINT "portfolio_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_skills" DROP CONSTRAINT "profile_skills_profileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profile_skills" DROP CONSTRAINT "profile_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "public"."profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."proposals" DROP CONSTRAINT "proposals_jobId_fkey";

-- DropForeignKey
ALTER TABLE "public"."proposals" DROP CONSTRAINT "proposals_providerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_aboutId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_byId_fkey";

-- DropForeignKey
ALTER TABLE "public"."session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_walletId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user" DROP CONSTRAINT "user_verificationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."wallets" DROP CONSTRAINT "wallets_userId_fkey";

-- DropTable
DROP TABLE "public"."_ConversationParticipants";

-- DropTable
DROP TABLE "public"."_JobToSkill";

-- DropTable
DROP TABLE "public"."_ListingToSkill";

-- DropTable
DROP TABLE "public"."account";

-- DropTable
DROP TABLE "public"."admin_notes";

-- DropTable
DROP TABLE "public"."coin_purchases";

-- DropTable
DROP TABLE "public"."contracts";

-- DropTable
DROP TABLE "public"."conversations";

-- DropTable
DROP TABLE "public"."disputes";

-- DropTable
DROP TABLE "public"."jobs";

-- DropTable
DROP TABLE "public"."listings";

-- DropTable
DROP TABLE "public"."messages";

-- DropTable
DROP TABLE "public"."milestones";

-- DropTable
DROP TABLE "public"."notifications";

-- DropTable
DROP TABLE "public"."portfolio";

-- DropTable
DROP TABLE "public"."profile_skills";

-- DropTable
DROP TABLE "public"."profiles";

-- DropTable
DROP TABLE "public"."proposals";

-- DropTable
DROP TABLE "public"."reviews";

-- DropTable
DROP TABLE "public"."session";

-- DropTable
DROP TABLE "public"."skills";

-- DropTable
DROP TABLE "public"."transactions";

-- DropTable
DROP TABLE "public"."user";

-- DropTable
DROP TABLE "public"."verifications";

-- DropTable
DROP TABLE "public"."wallets";

-- DropEnum
DROP TYPE "public"."AccountType";

-- DropEnum
DROP TYPE "public"."CategoryEnum";

-- DropEnum
DROP TYPE "public"."Currency";

-- DropEnum
DROP TYPE "public"."DeliveryTime";

-- DropEnum
DROP TYPE "public"."ExperienceLevel";

-- DropEnum
DROP TYPE "public"."FreelancerLevel";

-- DropEnum
DROP TYPE "public"."JobStatus";

-- DropEnum
DROP TYPE "public"."JobType";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- DropEnum
DROP TYPE "public"."PaymentStatus";

-- DropEnum
DROP TYPE "public"."ProposalStatus";

-- DropEnum
DROP TYPE "public"."Role";

-- DropEnum
DROP TYPE "public"."VerificationStatus";
