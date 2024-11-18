import { db } from "@/db";
import { NextResponse } from "next/server";

export async function GET() {
	const packages = await db.query.songPackages.findMany();
	return NextResponse.json(packages);
}
