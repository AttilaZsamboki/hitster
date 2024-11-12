import { searchSpotifyTrack } from '@/lib/spotify';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const title = searchParams.get('title');
	const artist = searchParams.get('artist');
	console.log(title, artist)

	if (!title || !artist) {
		return Response.json({ error: 'Missing title or artist' }, { status: 400 });
	}

	try {
		const track = await searchSpotifyTrack(title, artist);
		return Response.json(track);
	} catch (error) {
		return Response.json({ error: error }, { status: 500 });
	}
}
