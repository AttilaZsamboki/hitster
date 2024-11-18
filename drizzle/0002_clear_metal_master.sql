CREATE TABLE IF NOT EXISTS "package_songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"released" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "song_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "current_songs" DROP CONSTRAINT "current_songs_session_id_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "timelines" DROP CONSTRAINT "timelines_player_id_players_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "package_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "package_songs" ADD CONSTRAINT "package_songs_package_id_song_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."song_packages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "current_songs" ADD CONSTRAINT "current_songs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_current_player_id_players_id_fk" FOREIGN KEY ("current_player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_package_id_song_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."song_packages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timelines" ADD CONSTRAINT "timelines_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
