/*
  Warnings:

  - You are about to drop the column `idBackImage` on the `verifications` table. All the data in the column will be lost.
  - You are about to drop the column `idFrontImage` on the `verifications` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[emailVerificationToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailVerificationExpires" TIMESTAMP(3),
ADD COLUMN     "emailVerificationToken" TEXT;

-- AlterTable
ALTER TABLE "verifications" DROP COLUMN "idBackImage",
DROP COLUMN "idFrontImage";

-- CreateIndex
CREATE UNIQUE INDEX "user_emailVerificationToken_key" ON "user"("emailVerificationToken");
