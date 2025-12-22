-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SlideType" ADD VALUE 'COVER';
ALTER TYPE "SlideType" ADD VALUE 'CONTENT';
ALTER TYPE "SlideType" ADD VALUE 'ENDING';

-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "subtitle" TEXT;
