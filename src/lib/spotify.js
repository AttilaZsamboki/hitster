export const getSpotifyToken = async () => {
	const response = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "client_credentials",
			client_id: process.env.SPOTIFY_CLIENT_ID ?? "",
			client_secret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
		}),
	});

	return response.json();
};

export async function searchSpotifyTrack(title, artist) {
	const { access_token } = await getSpotifyToken();

	const searchQuery = encodeURIComponent(`${title} ${artist}`);
	const response = await fetch(`https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});

	const data = await response.json();
	return data.tracks?.items[0] || null;
}
