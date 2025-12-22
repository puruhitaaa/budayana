/*
  Warnings:

  - Added the required column `slideType` to the `static_slide` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "static_slide" ADD COLUMN     "slideType" "SlideType" NOT NULL;
