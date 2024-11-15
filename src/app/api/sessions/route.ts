import { db } from "@/db";
import { sessions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
	const activeSessions = await db.query.sessions.findMany({
		where: (sessions, { eq, or }) => or(eq(sessions.status, "active"), eq(sessions.status, "waiting")),
		with: {
			players: true,
		},
	});

	return NextResponse.json(activeSessions);
}

export async function POST(request: Request) {
	const { name } = await request.json();

	const session = await db
		.insert(sessions)
		.values({
			name,
			status: "waiting",
		})
		.returning();

	return NextResponse.json(session[0]);
}
