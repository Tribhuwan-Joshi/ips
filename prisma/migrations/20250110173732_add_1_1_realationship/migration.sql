/*
  Warnings:

  - A unique constraint covering the columns `[imageId]` on the table `ImageShare` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ImageShare" DROP CONSTRAINT "ImageShare_imageId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "ImageShare_imageId_key" ON "ImageShare"("imageId");

-- AddForeignKey
ALTER TABLE "ImageShare" ADD CONSTRAINT "ImageShare_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
