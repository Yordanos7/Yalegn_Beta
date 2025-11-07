-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "listingId" TEXT;

-- CreateIndex
CREATE INDEX "reviews_listingId_idx" ON "reviews"("listingId");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("_id") ON DELETE SET NULL ON UPDATE CASCADE;
