-- Add sessionId to songs table for temporary playlist song storage
ALTER TABLE "songs" ADD COLUMN "session_id" integer REFERENCES "sessions"("id") ON DELETE CASCADE; 