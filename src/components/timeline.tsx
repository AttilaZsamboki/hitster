import { Song } from "./game";
import { Button } from "./ui/button";

interface TimelineProps {
	songs: Song[];
	onGuess?: (position: string) => void;
	isCurrentPlayer: boolean;
	currentSong?: Song;
}

export function Timeline({ songs, onGuess, isCurrentPlayer, currentSong }: TimelineProps) {
	const sortedSongs = [...songs].sort((a, b) => a.year - b.year);

	const getGuessOptions = () => {
		if (sortedSongs.length === 0) {
			return [
				<Button key='first' onClick={() => onGuess?.("first")} variant='outline' className='w-full'>
					Place First Song
				</Button>,
			];
		}

		const options = [
			<Button key='older' onClick={() => onGuess?.("older")} variant='outline' className='w-full'>
				Older than {sortedSongs[0].year}
			</Button>,
		];

		// Add between options
		for (let i = 0; i < sortedSongs.length - 1; i++) {
			options.push(
				<Button
					key={`between-${i}`}
					onClick={() => onGuess?.(`between:${i}`)}
					variant='outline'
					className='w-full'>
					Between {sortedSongs[i].year} and {sortedSongs[i + 1].year}
				</Button>
			);
		}

		// Add newer than last option
		options.push(
			<Button
				key='newer'
				onClick={() => onGuess?.(`newer:${sortedSongs.length - 1}`)}
				variant='outline'
				className='w-full'>
				Newer than {sortedSongs[sortedSongs.length - 1].year}
			</Button>
		);

		return options;
	};

	return (
		<div className='space-y-4'>
			{/* Timeline display */}
			<div className='space-y-2'>
				{sortedSongs.map((song, index) => (
					<div key={index} className='flex items-center gap-2 p-2 bg-gray-100 rounded'>
						<span className='text-gray-600 w-16'>{song.year}</span>
						<span>
							{song.title} - {song.artist}
						</span>
					</div>
				))}
			</div>

			{/* Placement buttons */}
			{isCurrentPlayer && onGuess && currentSong && <div className='space-y-2'>{getGuessOptions()}</div>}
		</div>
	);
}
