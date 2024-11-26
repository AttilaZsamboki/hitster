ALTER TABLE "used_songs" DROP CONSTRAINT "used_songs_song_id_songs_id_fk";
--> statement-breakpoint
ALTER TABLE "used_songs" ALTER COLUMN "song_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "used_songs" ALTER COLUMN "song_id" SET NOT NULL;