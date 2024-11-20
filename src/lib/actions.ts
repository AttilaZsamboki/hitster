"use server";

import { db } from "@/db";
import { currentSongs, players, sessions, timelines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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

	// Finally delete the session
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function pauseSongOnSpotify() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("spotify_access_token");
	await fetch("https://api.spotify.com/v1/me/player/pause", {
		method: "PUT",
		headers: { Authorization: `Bearer ${accessToken?.value}` },
	});
}
