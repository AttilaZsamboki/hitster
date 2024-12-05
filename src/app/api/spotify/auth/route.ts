import { NextResponse } from "next/server";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

export async function GET() {
	const scope =
		"streaming \
               user-read-email \
               user-read-private \
               user-read-playback-state \
               playlist-modify-public \
               playlist-modify-private \
			   playlist-read-collaborative \
               user-library-read \
               user-modify-playback-state";

	const params = new URLSearchParams({
		response_type: "code",
		client_id: process.env.SPOTIFY_CLIENT_ID!,
		scope,
		redirect_uri: REDIRECT_URI,
		state: Math.random().toString(36).substring(7),
	});

	return NextResponse.redirect(`${SPOTIFY_AUTH_URL}?${params.toString()}`);
}
