-- Add source-oriented fields so Dormitory can store raw data from dormitories.json
ALTER TABLE "dormitories"
ADD COLUMN "source_id" TEXT,
ADD COLUMN "source_url" TEXT,
ADD COLUMN "source_title" TEXT,
ADD COLUMN "source_sections" JSONB,
ADD COLUMN "source_image_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "source_photo_groups" JSONB,
ADD COLUMN "source_external_links" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "source_updated_at" TEXT;

CREATE UNIQUE INDEX "dormitories_source_id_key" ON "dormitories"("source_id");
