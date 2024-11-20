import { db } from "@/db";
import { songPackages, packageSongs } from "@/db/schema";
import { getFilteredTracks } from "@/lib/lastfm";
import { PackageConfig } from "@/types/music";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const config: PackageConfig = await request.json();

		// Create the package
		const [package_] = await db
			.insert(songPackages)
			.values({
				name: config.name,
				description: `Filters: ${config.filters.genre?.join(", ")} | ${config.filters.years?.start}-${
					config.filters.years?.end
				} | ${config.filters.country || "Any"}`,
			})
			.returning();

		// Get filtered tracks
		const tracks = await getFilteredTracks(config);

		// Store valid tracks
		const validTracks = tracks
			.filter((track) => track.year) // Ensure we have year data
			.map((track) => ({
				packageId: package_.id,
				title: track.title,
				artist: track.artist,
				released: track.year!.toString(),
			}));

		if (validTracks.length > 0) {
			await db.insert(packageSongs).values(validTracks);
		}

		return NextResponse.json({
			...package_,
			songCount: validTracks.length,
		});
	} catch (error: any) {
		console.error("Error creating package:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
