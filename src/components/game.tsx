"use client";
import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpotifyPlayer } from "./spotify-player";
import { GameState } from "@/types/game";
import { Timeline } from "@/components/timeline";
import { PackageSelector } from "./package-selector";

export interface Song {
	title: string;
	artist: string;
	year: number;
	released?: string;
}

export interface Timeline {
	[player: string]: Song[];
}

interface JoinSessionResponse {
	playerId: string;
	playerName: string;
}

export default function Game({ sessionId }: { sessionId: string }) {
	const [playerId, setPlayerId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Check if player is already in session (from localStorage)
		const storedPlayerId = localStorage.getItem(`player_${sessionId}`);
		if (storedPlayerId) {
			setPlayerId(storedPlayerId);
			return;
		}

		// If not, prompt for name and join session
		const playerName = prompt("Enter your name to join the session:");
		if (!playerName) {
			setError("Name is required to join the session");
			return;
		}

		joinSession(playerName);
	}, [sessionId]);

	const joinSession = async (playerName: string) => {
		try {
			const response = await fetch(`/api/sessions/${sessionId}/players`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: playerName }),
			});

			if (!response.ok) {
				throw new Error("Failed to join session");
			}

			const data: JoinSessionResponse = await response.json();
			setPlayerId(data.playerId);
			localStorage.setItem(`player_${sessionId}`, data.playerId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to join session");
		}
	};

	if (error) {
		return (
			<Card className='p-4 max-w-md mx-auto mt-8'>
				<h2 className='text-red-500 mb-4'>Error</h2>
				<p>{error}</p>
				<Button onClick={() => window.location.reload()} className='mt-4'>
					Try Again
				</Button>
			</Card>
		);
	}

	if (!playerId) {
		return (
			<Card className='p-4 max-w-md mx-auto mt-8'>
				<h2>Joining session...</h2>
			</Card>
		);
	}

	return (
		<div className='p-4'>
			<GuessSongGame sessionId={sessionId} playerId={playerId} />
		</div>
	);
}

function GuessSongGame({ sessionId, playerId }: { sessionId: string; playerId: string }) {
	const socket = useSocket();
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [socketConnected, setSocketConnected] = useState(false);
	const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

	useEffect(() => {
		if (!socket) {
			console.log("Socket not yet connected...");
			return;
		}

		console.log("Socket connected, joining session:", sessionId);
		setSocketConnected(true);

		// Join session
		socket.emit("joinSession", sessionId);

		// Set up event listeners
		socket.on("gameStateUpdate", (newState: GameState) => {
			console.log("Received game state update:", newState);
			setGameState(newState);
		});

		return () => {
			console.log("Cleaning up game component...");
			socket.off("gameStateUpdate");
			socket.emit("leaveSession", sessionId);
		};
	}, [socket, sessionId]);

	if (!socketConnected) {
		return (
			<Card className='p-4'>
				<h2>Connecting to game...</h2>
			</Card>
		);
	}
	const handleStartGame = () => {
		if (!socket) return;
		socket.emit("startGame", { sessionId });
	};

	if (gameState?.status === "waiting") {
		return (
			<div className='space-y-8'>
				<Card className='p-4'>
					<h2 className='text-xl font-bold mb-4'>Select a Song Package</h2>
					<PackageSelector
						selectedPackageId={selectedPackage || undefined}
						onSelect={(packageId) => {
							if (!socket) return;
							setSelectedPackage(packageId);
							socket.emit("selectPackage", { sessionId, packageId });
						}}
					/>
					{gameState.players.length > 1 ? (
						<Button className='mt-4' disabled={!selectedPackage} onClick={() => handleStartGame()}>
							Start Game
						</Button>
					) : (
						<div className='text-center text-gray-500 py-2'>Waiting for players to join</div>
					)}
				</Card>
			</div>
		);
	}

	const isCurrentPlayersTurn = gameState?.currentPlayerId === playerId;

	const handleGuess = (position: string) => {
		if (!socket || !gameState?.currentSong) return;

		const currentPlayerTimeline = gameState.players.find((p) => p.id === playerId)?.timeline || [];
		const sortedTimeline = [...currentPlayerTimeline].sort((a, b) => a.year - b.year);

		let isCorrect = false;
		const currentSongYear = gameState.currentSong.year;

		if (position === "first" || position === "older") {
			isCorrect = sortedTimeline.length === 0 || currentSongYear <= sortedTimeline[0].year;
		} else if (position.startsWith("newer:")) {
			const index = parseInt(position.split(":")[1]);
			isCorrect = currentSongYear >= sortedTimeline[index].year;
		} else if (position.startsWith("between:")) {
			const index = parseInt(position.split(":")[1]);
			isCorrect =
				currentSongYear >= sortedTimeline[index].year && currentSongYear <= sortedTimeline[index + 1].year;
		}
		if (!isCorrect) {
			alert("Incorrect guess!");
		}

		socket.emit("makeGuess", {
			sessionId,
			playerId,
			guess: {
				position,
				song: gameState.currentSong,
				isCorrect,
			},
		});
	};

	return (
		<div className='space-y-8'>
			{/* Session Info */}
			<Card className='p-4'>
				<h2>Session: {gameState?.sessionName}</h2>
				<div className='flex gap-4 justify-between items-center'>
					<div className='flex gap-4'>
						{gameState?.players.map((player) => (
							<div
								key={player.id}
								className={player.id === gameState?.currentPlayerId ? "font-bold" : ""}>
								{player.name}: {player.score}
							</div>
						))}
					</div>
				</div>
			</Card>

			{/* Current Song (hidden for current player) */}
			{gameState?.currentSong && (
				<SpotifyPlayer
					artist={gameState.currentSong.artist}
					title={gameState.currentSong.title}
					isCurrentPlayersTurn={isCurrentPlayersTurn}
				/>
			)}

			{/* Timeline Display */}
			{gameState?.players.map((player) => (
				<Card key={player.id} className='p-4'>
					<h3 className='font-bold mb-4'>{player.name}s Timeline</h3>
					<Timeline
						songs={player.timeline}
						onGuess={player.id === playerId && isCurrentPlayersTurn ? handleGuess : undefined}
						isCurrentPlayer={player.id === playerId && isCurrentPlayersTurn}
						currentSong={gameState?.currentSong}
					/>
				</Card>
			))}
		</div>
	);
}
