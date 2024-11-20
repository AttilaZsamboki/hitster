import { db } from "@/db";
import { songPackages, songs } from "@/db/schema";
import { and, between, eq } from "drizzle-orm";
import { PackageConfig } from "@/types/music";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const config: PackageConfig = await request.json();

		// Create the package with filters
		const [package_] = await db
			.insert(songPackages)
			.values({
				name: config.name,
				filters: config.filters,
				limit: config.limit,
			})
			.returning();

		// Count matching songs
		const conditions = [];
		if (config.filters.genre) conditions.push(eq(songs.genre, config.filters.genre));
		if (config.filters.country) conditions.push(eq(songs.country, config.filters.country));
		if (config.filters.artist) conditions.push(eq(songs.artist, config.filters.artist));
		if (config.filters.years) {
			conditions.push(
				between(songs.released, config.filters.years.start.toString(), config.filters.years.end.toString())
			);
		}

		const matchingSongs = await db.query.songs.findMany({
			where: conditions.length > 0 ? and(...conditions) : undefined,
		});

		return NextResponse.json({
			...package_,
			songCount: matchingSongs.length,
		});
	} catch (error) {
		console.error("Error creating package:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
	}
}
