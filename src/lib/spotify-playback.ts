import { cookies } from "next/headers";

export async function playSongOnSpotify(trackUri: string) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("spotify_access_token");

	if (!accessToken) {
		throw new Error("No Spotify access token found");
	}

	try {
		// Get available devices
		const devicesResponse = await fetch("https://api.spotify.com/v1/me/player/devices", {
			headers: {
				Authorization: `Bearer ${accessToken.value}`,
			},
		});

		const { devices } = await devicesResponse.json();
		const activeDevice = devices.find((d: { is_active: boolean }) => d.is_active) || devices[0];

		if (!activeDevice) {
			throw new Error("No available Spotify devices found");
		}

		// Start playback on the device
		await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${activeDevice.id}`, {
			method: "PUT",
			headers: {
				"Authorization": `Bearer ${accessToken.value}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				uris: [trackUri],
			}),
		});
	} catch (error) {
		console.error("Error playing song on Spotify:", error);
		throw error;
	}
}
