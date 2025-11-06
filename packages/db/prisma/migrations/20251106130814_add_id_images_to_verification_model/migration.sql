/*
  Warnings:

  - You are about to drop the column `documents` on the `verifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "verifications" DROP COLUMN "documents",
ADD COLUMN     "idBackImage" TEXT,
ADD COLUMN     "idFrontImage" TEXT;
