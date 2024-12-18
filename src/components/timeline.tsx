import { Song } from "./game";
import { Button } from "./ui/button";
import React from "react";

interface TimelineProps {
	songs: Song[];
	onGuess?: (
		position: string,
		detailedGuesses?: { year: number; artist: string; album: string; title: string }
	) => void;
	isCurrentPlayer: boolean;
	currentSong?: Song;
	isLocalPlayer: boolean;
	detailedGuesses?: { year: number; artist: string; album: string; title: string };
	isButtonClicked: boolean;
	setIsButtonClicked: (value: boolean) => void;
}

export function Timeline({
	songs,
	onGuess,
	isCurrentPlayer,
	currentSong,
	isLocalPlayer,
	detailedGuesses,
	isButtonClicked,
	setIsButtonClicked,
}: TimelineProps) {
	const sortedSongs = [...songs].sort((a, b) => a.year - b.year);

	const handleGuess = (position: string) => {
		if (isButtonClicked) return;
		setIsButtonClicked(true);
		onGuess?.(position, detailedGuesses);
	};

	const getGuessOptions = () => {
		if (sortedSongs.length === 0) {
			return [
				<Button
					key='first'
					onClick={() => handleGuess("first")}
					variant='outline'
					className='w-full'
					disabled={!detailedGuesses}>
					Place First Song
				</Button>,
			];
		}

		const options = [
			<Button
				key='older'
				onClick={() => handleGuess("older")}
				variant='outline'
				className='w-full'
				disabled={!detailedGuesses}>
				Older than {sortedSongs[0].year}
			</Button>,
		];

		// Add between options
		for (let i = 0; i < sortedSongs.length - 1; i++) {
			if (sortedSongs[i].year === sortedSongs[i + 1].year) continue;
			options.push(
				<Button
					key={`between-${i}`}
					onClick={() => handleGuess(`between:${i}`)}
					variant='outline'
					className='w-full'
					disabled={!detailedGuesses}>
					Between {sortedSongs[i].year} and {sortedSongs[i + 1].year}
				</Button>
			);
		}

		// Add newer than last option
		options.push(
			<Button
				key='newer'
				onClick={() => handleGuess(`newer:${sortedSongs.length - 1}`)}
				variant='outline'
				className='w-full'
				disabled={!detailedGuesses}>
				Newer than {sortedSongs[sortedSongs.length - 1].year}
			</Button>
		);

		return options.map((option) =>
			React.cloneElement(option, { disabled: isButtonClicked || option.props.disabled })
		);
	};

	return (
		<div className='space-y-4'>
			{/* Timeline display */}
			<div className='space-y-2'>
				{sortedSongs.map((song, index) => (
					<div
						key={index}
						className={`
							flex items-center gap-2 p-2 rounded
							${isLocalPlayer ? "bg-primary/5 border border-primary/10" : "bg-gray-100"}
							transition-all hover:scale-[1.02]
						`}>
						<span className={`w-16 ${isLocalPlayer ? "text-primary" : "text-gray-600"}`}>{song.year}</span>
						<span className={isLocalPlayer ? "font-medium" : ""}>
							{song.title} - {song.artist}
						</span>
					</div>
				))}
			</div>

			{/* Placement buttons */}
			{isCurrentPlayer && onGuess && currentSong && (
				<div className='space-y-2'>
					{!detailedGuesses && (
						<p className='text-sm text-gray-500 text-center'>
							Fill in your guesses above before placing the song
						</p>
					)}
					{getGuessOptions()}
				</div>
			)}
		</div>
	);
}
