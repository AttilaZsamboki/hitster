import { promises as fs } from "fs";
import path from "path";

export async function getSongs(): Promise<{ title: string; artist: string; released: string }[]> {
	const csvContent = await fs.readFile(path.join(process.cwd(), "src", "data", "songs.csv"), "utf-8");

	// Split the content into lines and remove the header
	const lines = csvContent.split("\n").slice(1);

	return lines
		.map((line) => {
			const matches = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);

			if (!matches) return null;

			const fields = matches.map((field) => {
				field = field.startsWith(",") ? field.slice(1) : field;
				if (field.startsWith('"') && field.endsWith('"')) {
					field = field.slice(1, -1).replace(/""/g, '"');
				}
				return field.trim();
			});

			return {
				title: fields[0],
				artist: fields[1],
				released: fields[2],
			};
		})
		.filter(
			(song): song is { title: string; artist: string; released: string } =>
				!!song && !!song.title && !!song.released
		);
}
