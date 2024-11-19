import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const code = searchParams.get("code");
	const state = searchParams.get("state");

	if (!code) {
		return NextResponse.redirect("/error?message=spotify_auth_failed");
	}

	try {
		const response = await fetch("https://accounts.spotify.com/api/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Basic ${Buffer.from(
					`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
				).toString("base64")}`,
			},
			body: new URLSearchParams({
				code,
				redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`,
				grant_type: "authorization_code",
			}),
		});

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error);
		}

		// Store the tokens in cookies
		const cookieStore = await cookies();
		cookieStore.set("spotify_access_token", data.access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: data.expires_in,
		});

		if (data.refresh_token) {
			cookieStore.set("spotify_refresh_token", data.refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
			});
		}

		// Redirect back to the game
		return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/`);
	} catch (error) {
		console.error("Error during Spotify authentication:", error);
		return NextResponse.redirect("/error?message=spotify_auth_failed");
	}
}
