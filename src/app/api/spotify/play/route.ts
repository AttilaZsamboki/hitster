import { NextResponse } from "next/server";
import { playSongOnSpotify } from "@/lib/spotify-playback";

export async function POST(request: Request) {
	try {
		const { uri } = await request.json();
		await playSongOnSpotify(uri);
		return NextResponse.json({ success: true });
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
