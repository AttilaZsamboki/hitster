ALTER TABLE "current_songs" ADD COLUMN "song_id" integer;--> statement-breakpoint
ALTER TABLE "used_songs" ADD COLUMN "song_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "current_songs" ADD CONSTRAINT "current_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "used_songs" ADD CONSTRAINT "used_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "current_songs" DROP COLUMN IF EXISTS "song_title";--> statement-breakpoint
ALTER TABLE "current_songs" DROP COLUMN IF EXISTS "song_artist";--> statement-breakpoint
ALTER TABLE "current_songs" DROP COLUMN IF EXISTS "song_year";--> statement-breakpoint
ALTER TABLE "current_songs" DROP COLUMN IF EXISTS "preview_url";--> statement-breakpoint
ALTER TABLE "current_songs" DROP COLUMN IF EXISTS "spotify_url";--> statement-breakpoint
ALTER TABLE "used_songs" DROP COLUMN IF EXISTS "song_title";--> statement-breakpoint
ALTER TABLE "used_songs" DROP COLUMN IF EXISTS "song_artist";--> statement-breakpoint
ALTER TABLE "used_songs" DROP COLUMN IF EXISTS "song_year";