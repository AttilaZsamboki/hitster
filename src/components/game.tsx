"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpotifyPlayer } from './spotify-player';

export interface Song {
	title: string;
	artist: string;
	year: number;
	released?: string;
};

export interface Timeline {
	[player: string]: Song[]
};

// Parse and clean release dates to get years only
const parseSongData = (song: Song) => {
	const releaseDateMatch = song.released?.match(/\d{4}/);
	return {
		title: song.title,
		artist: song.artist,
		year: releaseDateMatch ? parseInt(releaseDateMatch[0]) : null
	};
};

// Component to display the current player's timeline
const Timeline = ({ guessedSongs }: { guessedSongs: Song[] }) => {
	const sortedSongs = [...guessedSongs].sort((a, b) => a.year - b.year);

	return (
		<div className="flex flex-col gap-2 my-4">
			{sortedSongs.map((song, index) => (
				<div key={index} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
					<span className="text-gray-600">{song.year}</span>
					<span>{song.title} - {song.artist}</span>
				</div>
			))}
		</div>
	);
};

// Main game component
export default function GuessSongGame({ songsData }: { songsData: Song[] }) {
	const [players, setPlayers] = useState<string[]>([]);
	const [currentPlayer, setCurrentPlayer] = useState(0);
	const [currentSong, setCurrentSong] = useState<Song | null>(null);
	const [playerTimelines, setPlayerTimelines] = useState<Timeline>({});

	// Initialize game state
	useEffect(() => {
		if (songsData) {
			getNextSong();
		}
	}, [songsData]);

	// Get a random song that hasn't been used
	const getNextSong = () => {
		const usedSongs = Object.values(playerTimelines).flat();
		const availableSongs = songsData.filter(song =>
			!usedSongs.find(used => used.title === song.title)
		);

		if (availableSongs.length) {
			const randomIndex = Math.floor(Math.random() * availableSongs.length);
			setCurrentSong(parseSongData(availableSongs[randomIndex]) as Song);
		}
	};

	// Add a new player
	const addPlayer = () => {
		const playerName = prompt("Enter player name:");
		if (playerName) {
			setPlayers([...players, playerName]);
			setPlayerTimelines(prev => ({ ...prev, [playerName]: [] }));
		}
	};

	// Handle player's guess
	const makeGuess = (position: string) => {
		const player = players[currentPlayer];
		const timeline = playerTimelines[player];

		// Validate guess
		if (!currentSong) return;
		const isCorrect = validateGuess(timeline, currentSong, position);

		if (isCorrect) {
			// Update player's timeline
			const newTimeline = [...timeline, currentSong];
			setPlayerTimelines(prev => ({
				...prev,
				[player]: newTimeline
			}));

			// Check win condition
			if (newTimeline.length >= 10) {
				alert(`${player} wins!`);
				return;
			}

			// Next turn
			getNextSong();
			setCurrentPlayer((currentPlayer + 1) % players.length);
		} else {
			alert("Incorrect! Next player's turn");
			setCurrentPlayer((currentPlayer + 1) % players.length);
			getNextSong();
		}
	};

	// Validate if the guess is correct based on the timeline
	const validateGuess = (timeline: Song[], song: Song, position: string) => {
		if (timeline.length === 0) return true;

		const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);

		if (position === 'older') {
			return song.year < sortedTimeline[0].year;
		} else if (position === 'newer') {
			return song.year > sortedTimeline[sortedTimeline.length - 1].year;
		} else {
			const index = parseInt(position);
			return song.year > sortedTimeline[index].year &&
				song.year < sortedTimeline[index + 1].year;
		}
	};

	// Generate guess options based on current timeline
	const getGuessOptions = (timeline: Song[]) => {
		if (timeline.length === 0) {
			return [
				<Button key="first" onClick={() => makeGuess('first')}>
					Make First Guess
				</Button>
			];
		}

		const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);
		const options = [
			<Button key="older" onClick={() => makeGuess('older')}>
				Older than {sortedTimeline[0].year}
			</Button>,
			<Button key="newer" onClick={() => makeGuess('newer')}>
				Newer than {sortedTimeline[sortedTimeline.length - 1].year}
			</Button>
		];

		// Add "between" options
		for (let i = 0; i < sortedTimeline.length - 1; i++) {
			options.push(
				<Button key={i} onClick={() => makeGuess(i as unknown as string)}>
					Between {sortedTimeline[i].year} and {sortedTimeline[i + 1].year}
				</Button>
			);
		}

		return options;
	};

	return (
		<div className="max-w-4xl mx-auto p-4">
			<Card>
				<CardHeader>
					<h1 className="text-2xl font-bold">Guess the Song Timeline</h1>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<Button onClick={addPlayer}>Add Player</Button>
					</div>

					{players.length > 0 && currentSong && (
						<div>
							<h2 className="text-xl mb-2">
								Current Player: {players[currentPlayer]}
							</h2>
							<div className="mb-4">
								<h3 className="font-bold">Current Song:</h3>
							</div>
							<div className="space-y-4">
								<div className="p-4 bg-gray-100 rounded">
									<p className="font-bold">{currentSong.title}</p>
									<p>by {currentSong.artist}</p>
								</div>
								<SpotifyPlayer
									title={currentSong.title}
									artist={currentSong.artist}
								/>
							</div>

							<div className="mb-4">
								<Timeline
									guessedSongs={playerTimelines[players[currentPlayer]] || []}
								/>
							</div>

							<div className="flex flex-wrap gap-2">
								{getGuessOptions(playerTimelines[players[currentPlayer]] || [])}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
