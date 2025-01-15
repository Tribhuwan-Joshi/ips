/*
  Warnings:

  - You are about to drop the `ImageShare` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `publicLink` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ImageShare" DROP CONSTRAINT "ImageShare_imageId_fkey";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "publicLink" TEXT NOT NULL;

-- DropTable
DROP TABLE "ImageShare";
