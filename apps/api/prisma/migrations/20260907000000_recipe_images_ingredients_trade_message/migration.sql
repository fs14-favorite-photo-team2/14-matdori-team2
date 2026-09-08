-- Preserve each existing representative image as the first item.
ALTER TABLE "Recipe" RENAME COLUMN "imageUrl" TO "imageUrls";
ALTER TABLE "Recipe" ALTER COLUMN "imageUrls" TYPE TEXT[]
USING ARRAY["imageUrls"];

-- Existing recipes have no structured ingredient information yet.
ALTER TABLE "Recipe" ADD COLUMN "ingredients" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Recipe" ALTER COLUMN "ingredients" DROP DEFAULT;

ALTER TABLE "TradeOffer" ADD COLUMN "message" VARCHAR(500);
