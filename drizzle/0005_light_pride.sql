CREATE TABLE IF NOT EXISTS "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"released" text NOT NULL,
	"genre" text,
	"country" text,
	"rank" integer,
	"song_artist_credit" text,
	"cspc" integer,
	"album" text,
	"artist_spotify_id" text
);
--> statement-breakpoint
ALTER TABLE "package_songs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "package_songs" CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_current_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT 'waiting';--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "package_locked" boolean DEFAULT false;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_current_player_id_players_id_fk" FOREIGN KEY ("current_player_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
