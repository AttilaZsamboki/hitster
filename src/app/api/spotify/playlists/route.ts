import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const nextPageUrl = searchParams.get("next");

		const cookieStore = await cookies();
		const accessToken = cookieStore.get("spotify_access_token");

		if (!accessToken) {
			return NextResponse.json({ error: "No Spotify access token found" }, { status: 401 });
		}

		let playlistsResponse;
		if (nextPageUrl) {
			// Fetch the next page directly from Spotify
			playlistsResponse = await fetch(nextPageUrl, {
				headers: {
					Authorization: `Bearer ${accessToken.value}`,
				},
			});
		} else {
			// First get the user's profile to get their ID
			const profileResponse = await fetch("https://api.spotify.com/v1/me", {
				headers: {
					Authorization: `Bearer ${accessToken.value}`,
				},
			});

			if (!profileResponse.ok) {
				throw new Error("Failed to fetch Spotify profile");
			}

			const profile = await profileResponse.json();

			// Then fetch their playlists
			playlistsResponse = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists?limit=50`, {
				headers: {
					Authorization: `Bearer ${accessToken.value}`,
				},
			});
		}

		if (!playlistsResponse.ok) {
			throw new Error("Failed to fetch Spotify playlists");
		}

		const playlistsData = await playlistsResponse.json();

		console.log(playlistsData);
		// Transform the data to match our needs
		const playlists = playlistsData.items
			.filter((playlist: string) => !!playlist)
			.map((playlist: { id: string; name: string; tracks: { total: number }; images: { url: string }[] }) => ({
				id: playlist.id,
				name: playlist.name,
				trackCount: playlist.tracks.total,
				imageUrl: playlist.images?.[0]?.url,
			}));

		console.log(playlistsData);
		return NextResponse.json({
			playlists,
			next: playlistsData.next,
		});
	} catch (error) {
		console.error("Error in /api/spotify/playlists:", error);
		return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 });
	}
}
