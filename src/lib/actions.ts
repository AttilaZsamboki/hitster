"use server";

import { db } from "@/db";
import { currentSongs, players, sessions, timelines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteSession(sessionId: number) {
	// Delete related current songs first
	await db.delete(currentSongs).where(eq(currentSongs.sessionId, sessionId));

	// Get all players in this session
	const sessionPlayers = await db.query.players.findMany({
		where: eq(players.sessionId, sessionId),
	});

	// Delete timelines for all players
	for (const player of sessionPlayers) {
		await db.delete(timelines).where(eq(timelines.playerId, player.id));
	}

	// Delete all players in the session
	await db.delete(players).where(eq(players.sessionId, sessionId));

	// Finally delete the session
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
