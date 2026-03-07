-- Add parsed dormitory metadata for UI chips/filters
ALTER TABLE "dormitories"
ADD COLUMN "amenities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
