-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "imagePublicIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
