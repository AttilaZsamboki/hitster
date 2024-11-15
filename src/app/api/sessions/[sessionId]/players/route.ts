import { db } from "@/db";
import { players } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
	try {
		const { name } = await request.json();
		const sessionId = parseInt((await params).sessionId);

		// Create new player
		const [player] = await db
			.insert(players)
			.values({
				name,
				sessionId,
				score: 0,
			})
			.returning();

		return NextResponse.json({
			playerId: player.id.toString(),
			playerName: player.name,
		});
	} catch (error) {
		console.error("Error creating player:", error);
		return NextResponse.json({ error: "Failed to join session" }, { status: 500 });
	}
}
