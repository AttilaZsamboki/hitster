import { NextResponse } from "next/server";
import { playSongOnSpotify } from "@/lib/spotify-playback";

export async function POST(request: Request) {
	try {
		const { uri } = await request.json();
		await playSongOnSpotify(uri);
		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
	}
}
