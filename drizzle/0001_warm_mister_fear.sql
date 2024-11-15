ALTER TABLE "players" ADD COLUMN "session_id" integer;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "current_player_id" integer;