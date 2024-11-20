ALTER TABLE "song_packages" ADD COLUMN "filters" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "song_packages" DROP COLUMN IF EXISTS "description";