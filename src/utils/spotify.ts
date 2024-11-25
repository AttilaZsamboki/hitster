import { Song } from "@/components/game";
import { getSpotifyToken } from "@/lib/spotify";

export async function fetchSpotifyPlaylistTracks(playlistId: string): Promise<Song[]> {
	try {
		const { access_token } = await getSpotifyToken();
		const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
			headers: {
				"Authorization": `Bearer ${access_token}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			console.error("Failed to fetch playlist tracks", response.statusText);
			throw new Error("Failed to fetch playlist tracks");
		}

		const data = await response.json();

		return data.items.map(
			(track: {
				track: { name: string; artists: { name: string }[]; album: { release_date: string; name: string } };
			}) => ({
				title: track.track.name,
				artist: track.track.artists[0].name,
				released: new Date(track.track.album.release_date).getFullYear(),
				album: track.track.album.name,
			})
		);
	} catch (error) {
		console.error("Error fetching playlist tracks:", error);
		return [];
	}
}

export function filterTracksByDecade(tracks: Song[], currentPlayerId: number): Song[] {
	// Get all unique decades from the tracks
	const decades = [...new Set(tracks.map((track) => Math.floor(track.year / 10) * 10))];

	// If there's only one decade, return all tracks
	if (decades.length <= 1) return tracks;

	// Use the player ID to consistently select a decade
	const selectedDecadeIndex = currentPlayerId % decades.length;
	const selectedDecade = decades[selectedDecadeIndex];

	// Filter tracks to only include songs from the selected decade
	return tracks.filter((track) => Math.floor(track.year / 10) * 10 === selectedDecade);
}
