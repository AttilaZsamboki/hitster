import { Song } from "@/components/game";

export interface Player {
	id: string;
	name: string;
	score: number;
	timeline: Song[];
}

export interface GameState {
	sessionId: string;
	sessionName: string;
	players: Player[];
	currentSong?: {
		title: string;
		artist: string;
		year: number;
		previewUrl?: string;
		spotifyUrl?: string;
	};
	status: "waiting" | "active" | "finished";
	currentPlayerId: string;
	totalRounds: number;
	currentRound: number;
	maxSongs: number;
}
