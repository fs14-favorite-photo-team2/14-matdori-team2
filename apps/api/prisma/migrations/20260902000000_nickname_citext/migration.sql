-- CreateExtension
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nickname" SET DATA TYPE CITEXT;
