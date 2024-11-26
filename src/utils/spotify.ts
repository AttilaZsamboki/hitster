import { Song } from "@/components/game";
import { getSpotifyToken } from "@/lib/spotify";

export async function fetchSpotifyPlaylistTracks(playlistId: string): Promise<Song[]> {
	try {
		const { access_token } = await getSpotifyToken();
		let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
		const allTracks: Song[] = [];
		let page = 1;

		while (url && page < 20) {
			const response = await fetch(url, {
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

			const tracks = data.items.map(
				(track: {
					track: {
						id: string;
						name: string;
						artists: { name: string }[];
						album: { release_date: string; name: string };
					};
				}) => ({
					id: track.track.id,
					title: track.track.name,
					artist: track.track.artists[0].name,
					released: new Date(track.track.album.release_date).getFullYear(),
					album: track.track.album.name,
				})
			);

			allTracks.push(...tracks);
			url = data.next;
			page++;
		}

		return allTracks;
	} catch (error) {
		console.error("Error fetching playlist tracks:", error);
		return [];
	}
}
