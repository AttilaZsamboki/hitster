CREATE TABLE IF NOT EXISTS "used_songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"song_title" text NOT NULL,
	"song_artist" text NOT NULL,
	"song_year" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "used_songs" ADD CONSTRAINT "used_songs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
