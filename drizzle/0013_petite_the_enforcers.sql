ALTER TABLE "songs" ADD COLUMN "session_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "songs" ADD CONSTRAINT "songs_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
