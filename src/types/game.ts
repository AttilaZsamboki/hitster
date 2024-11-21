import { Song } from "@/components/game";

export interface Player {
	id: string;
	name: string;
	score: number;
	timeline: Song[];
}

export interface GuessDetails {
	timelineGuess: boolean;
	yearGuess?: boolean;
	artistGuess?: boolean;
	albumGuess?: boolean;
	titleGuess?: boolean;
}

export interface GameState {
	sessionId: string;
	sessionName: string;
	players: Player[];
	currentSong?: {
		title: string;
		artist: string;
		year: number;
		album: string;
		previewUrl?: string;
		spotifyUrl?: string;
	};
	status: "waiting" | "active" | "finished";
	currentPlayerId: string;
	totalRounds: number;
	currentRound: number;
	maxSongs: number;
	currentGuesses: Record<string, GuessDetails>;
}
