ALTER TABLE "current_songs" DROP CONSTRAINT "current_songs_song_id_songs_id_fk";
--> statement-breakpoint
ALTER TABLE "current_songs" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "current_songs" ADD COLUMN "artist" text NOT NULL;--> statement-breakpoint
ALTER TABLE "current_songs" ADD COLUMN "album" text NOT NULL;--> statement-breakpoint
ALTER TABLE "current_songs" ADD COLUMN "released" text NOT NULL;--> statement-breakpoint
ALTER TABLE "current_songs" DROP COLUMN IF EXISTS "song_id";