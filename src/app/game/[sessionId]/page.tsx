import GuessSongGame from "@/components/game";
import { Package } from "@/components/package-list";
import { db } from "@/db";
import { songPackages, songs } from "@/db/schema";

export default async function GamePage({ params }: { params: Promise<{ sessionId: string }> }) {
	const genres = await db.selectDistinctOn([songs.genre]).from(songs);
	const artists = await db.selectDistinctOn([songs.artist]).from(songs);
	const countries = await db.selectDistinctOn([songs.country]).from(songs);
	const packages = await db.select().from(songPackages);
	return (
		<GuessSongGame
			sessionId={(await params).sessionId}
			genres={genres.map((g) => g.genre || "")}
			artists={artists.map((a) => a.artist || "")}
			countries={countries.map((c) => c.country || "")}
			packages={packages as Package[]}
		/>
	);
}
