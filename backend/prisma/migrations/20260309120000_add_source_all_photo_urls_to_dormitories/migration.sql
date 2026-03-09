-- Add unified source photo list (dormitory + dormitory life + other discovered photos)
ALTER TABLE "dormitories"
ADD COLUMN "source_all_photo_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
