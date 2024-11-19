import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("spotify_access_token");
	const refreshToken = cookieStore.get("spotify_refresh_token");

	const isAuthenticated = !!(accessToken && refreshToken);

	return NextResponse.json({ isAuthenticated });
}
