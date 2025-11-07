/*
  Warnings:

  - The `emailVerified` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Made the column `link` on table `portfolio` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "portfolio" ALTER COLUMN "media" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "link" SET NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT,
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "user_emailVerificationToken_key" ON "user"("emailVerificationToken");
