import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { db } from "./db";
import { sessions, players, currentSongs, timelines, usedSongs, songPackages, songs } from "./db/schema";
import { eq, sql, and, between } from "drizzle-orm";
import { GameState, Player } from "./types/game";
import { PackageConfig } from "./types/music";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = createServer((req, res) => {
		const parsedUrl = parse(req.url!, true);
		handle(req, res, parsedUrl);
	});

	const io = new Server(server, {
		cors: {
			origin: "*",
		},
		transports: ["websocket", "polling"],
		pingTimeout: 60000,
		pingInterval: 25000,
	});

	async function getGameState(sessionId: string): Promise<GameState | null> {
		try {
			const session = await db.query.sessions.findFirst({
				where: eq(sessions.id, parseInt(sessionId)),
				with: {
					players: true,
					currentPlayer: true,
				},
			});

			if (!session) return null;

			// Get current song if exists
			const currentSong = await db.query.currentSongs.findFirst({
				where: eq(currentSongs.sessionId, parseInt(sessionId)),
			});

			// Map players with their timelines
			const playersWithTimelines = await Promise.all(
				session.players.map(async (player) => {
					const playerTimelines = await db.query.timelines.findMany({
						where: eq(timelines.playerId, player.id),
						orderBy: (timelines, { asc }) => [asc(timelines.position)],
					});
					return {
						id: player.id.toString(),
						name: player.name,
						score: player.score,
						timeline: playerTimelines
							.filter((t) => t.playerId === player.id)
							.map((t) => ({
								title: t.songTitle,
								artist: t.songArtist,
								year: t.songYear,
							})),
					};
				})
			);
			console.log("playersWithTimelines", playersWithTimelines);

			const usedSongsCount = await db.query.usedSongs.findMany({
				where: eq(usedSongs.sessionId, parseInt(sessionId)),
			});

			return {
				sessionId: session.id.toString(),
				sessionName: session.name,
				players: playersWithTimelines as Player[],
				status: session.status as "waiting" | "active" | "finished",
				currentPlayerId: session.currentPlayerId?.toString() || "",
				currentSong: currentSong
					? {
							title: currentSong.songTitle,
							artist: currentSong.songArtist,
							year: currentSong.songYear,
							previewUrl: currentSong.previewUrl || undefined,
							spotifyUrl: currentSong.spotifyUrl || undefined,
					  }
					: undefined,
				totalRounds: session.maxSongs ?? 10,
				currentRound: Math.floor((usedSongsCount.length - 1) / session.players.length) + 1,
				maxSongs: session.maxSongs ?? 10,
			};
		} catch (error) {
			console.error("Error getting game state:", error);
			return null;
		}
	}

	async function updateCurrentSong(sessionId: string) {
		try {
			const session = await db.query.sessions.findFirst({
				where: eq(sessions.id, parseInt(sessionId)),
			});

			const song = await selectRandomSong(session?.packageId ?? null, parseInt(sessionId));
			await db.delete(currentSongs).where(eq(currentSongs.sessionId, parseInt(sessionId)));

			await db.insert(currentSongs).values({
				sessionId: parseInt(sessionId),
				songTitle: song.title,
				songArtist: song.artist,
				songYear: song.year,
				previewUrl: song.previewUrl,
				spotifyUrl: song.spotifyUrl,
			});
		} catch (error) {
			console.error("Error updating current song:", error);
			// Handle the case where no more songs are available
			await db
				.update(sessions)
				.set({ status: "finished" })
				.where(eq(sessions.id, parseInt(sessionId)));
		}
	}

	async function selectRandomSong(packageId: number | null, sessionId: number) {
		let attempts = 0;
		const maxAttempts = 50;

		while (attempts < maxAttempts) {
			// Get package filters if packageId is provided
			const package_ = packageId
				? await db.query.songPackages.findFirst({
						where: eq(songPackages.id, packageId),
				  })
				: null;

			// Build query conditions
			const conditions = [];
			if (package_?.filters) {
				const filters = package_.filters as PackageConfig;
				if (filters.filters.genre) conditions.push(eq(songs.genre, filters.filters.genre));
				if (filters.filters.country) conditions.push(eq(songs.country, filters.filters.country));
				if (filters.filters.artist) conditions.push(eq(songs.artist, filters.filters.artist));
				if (filters.filters.years) {
					conditions.push(
						between(
							songs.released,
							filters.filters.years.start.toString(),
							filters.filters.years.end.toString()
						)
					);
				}
			}

			// Get all matching songs
			const matchingSongs = await db.query.songs.findMany({
				where: conditions.length > 0 ? and(...conditions) : undefined,
				orderBy: (songs, { asc }) => [asc(songs.rank)],
				limit: package_?.limit ?? 50,
			});

			if (matchingSongs.length === 0) {
				throw new Error("No songs match the package filters");
			}

			// Select random song
			const randomSong = matchingSongs[Math.floor(Math.random() * matchingSongs.length)];

			// Check if already used
			const usedSong = await db.query.usedSongs.findFirst({
				where: and(
					eq(usedSongs.sessionId, sessionId),
					eq(usedSongs.songTitle, randomSong.title),
					eq(usedSongs.songArtist, randomSong.artist)
				),
			});

			if (!usedSong) {
				await db.insert(usedSongs).values({
					sessionId,
					songTitle: randomSong.title,
					songArtist: randomSong.artist,
					songYear: parseInt(randomSong.released),
				});

				return {
					title: randomSong.title,
					artist: randomSong.artist,
					year: parseInt(randomSong.released),
					previewUrl: undefined,
					spotifyUrl: undefined,
				};
			}

			attempts++;
		}

		throw new Error("No more unused songs available");
	}

	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.onAny((eventName, ...args) => {
			console.log(`[${socket.id}] Event ${eventName}:`, args);
		});

		socket.on("joinSession", async (sessionId: string) => {
			console.log(`[${socket.id}] Joining session ${sessionId}`);
			socket.join(`session:${sessionId}`);

			const gameState = await getGameState(sessionId);
			if (gameState) {
				console.log(`Emitting state for session ${sessionId}:`, gameState);
				socket.emit("gameStateUpdate", gameState);
			}
		});

		socket.on("makeGuess", async ({ sessionId, playerId, guess }) => {
			try {
				const { position, song, isCorrect } = guess;

				if (isCorrect) {
					// Add song to player's timeline
					await db.insert(timelines).values({
						playerId: parseInt(playerId),
						songTitle: song.title,
						songArtist: song.artist,
						songYear: song.year,
						position: parseInt(position.split(":")[1] || "0"),
					});

					// Update player's score
					await db
						.update(players)
						.set({ score: sql`${players.score} + 1` })
						.where(eq(players.id, parseInt(playerId)));

					// Move to next player
				}
				const session = await db.query.sessions.findFirst({
					where: eq(sessions.id, parseInt(sessionId)),
					with: { players: true },
				});
				if (session) {
					const playerIds = session.players.map((p) => p.id).sort();
					const currentIndex = playerIds.indexOf(parseInt(playerId));
					const nextPlayerId = playerIds[(currentIndex + 1) % playerIds.length];

					await db
						.update(sessions)
						.set({ currentPlayerId: nextPlayerId })
						.where(eq(sessions.id, parseInt(sessionId)));
				}
				await updateCurrentSong(sessionId);

				// Emit updated game state
				const newState = await getGameState(sessionId);
				if (newState) {
					io.to(`session:${sessionId}`).emit("gameStateUpdate", newState);
				}

				// Check for winner
				const winner = await db.query.players.findFirst({
					where: and(eq(players.sessionId, parseInt(sessionId)), eq(players.score, session?.maxSongs ?? 10)),
				});

				if (winner) {
					// Emit winner event
					io.to(`session:${sessionId}`).emit("gameWinner", {
						playerId: winner.id.toString(),
						playerName: winner.name,
					});

					// Update session status
					await db
						.update(sessions)
						.set({ status: "finished" })
						.where(eq(sessions.id, parseInt(sessionId)));
				}

				// Broadcast the guess result to all players
				io.to(`session:${sessionId}`).emit("guessResult", {
					playerId,
					isCorrect: guess.isCorrect,
					songDetails: guess.song,
				});
			} catch (error) {
				console.error("Error processing guess:", error);
			}
		});

		socket.on("startGame", async ({ sessionId }: { sessionId: string }) => {
			console.log("startGame", sessionId);
			try {
				// Select random song

				// Update session status and set first player
				await db
					.update(sessions)
					.set({
						status: "active",
						currentPlayerId: (
							await db.query.players.findFirst({
								where: eq(players.sessionId, parseInt(sessionId)),
							})
						)?.id,
					})
					.where(eq(sessions.id, parseInt(sessionId)));

				await updateCurrentSong(sessionId);

				// Emit updated game state
				const newState = await getGameState(sessionId);
				if (newState) {
					io.to(`session:${sessionId}`).emit("gameStateUpdate", newState);
				}
			} catch (error) {
				console.error("Error starting game:", error);
			}
		});

		socket.on("selectPackage", async ({ sessionId, packageId }) => {
			console.log("selectPackage", sessionId, packageId);
			try {
				await db
					.update(sessions)
					.set({ packageId })
					.where(eq(sessions.id, parseInt(sessionId)));

				const newState = await getGameState(sessionId);
				if (newState) {
					io.to(`session:${sessionId}`).emit("gameStateUpdate", newState);
				}
			} catch (error) {
				console.error("Error selecting package:", error);
			}
		});

		socket.on("disconnect", (reason) => {
			console.log(`Client disconnected (${socket.id}):`, reason);
		});
	});

	const port = process.env.PORT || 3000;
	server.listen(port, () => {
		console.log(`> Server ready on http://localhost:${port}`);
		console.log("> Socket.IO server initialized");
	});
});
