-- AlterTable
ALTER TABLE "edited_clips" ADD COLUMN     "cutMediaFileId" TEXT;

-- CreateIndex
CREATE INDEX "edited_clips_cutMediaFileId_idx" ON "edited_clips"("cutMediaFileId");

-- AddForeignKey
ALTER TABLE "edited_clips" ADD CONSTRAINT "edited_clips_cutMediaFileId_fkey" FOREIGN KEY ("cutMediaFileId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
