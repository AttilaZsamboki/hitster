import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SongGuessFormProps {
	onSubmit: (guesses: { year: number; artist: string; album: string; title: string }) => void;
	disabled?: boolean;
}

export function SongGuessForm({ onSubmit, disabled }: SongGuessFormProps) {
	const [guesses, setGuesses] = useState({
		year: "",
		artist: "",
		album: "",
		title: "",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			year: parseInt(guesses.year),
			artist: guesses.artist,
			album: guesses.album,
			title: guesses.title,
		});
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='text-sm'>Year</label>
					<Input
						type='number'
						value={guesses.year}
						onChange={(e) => setGuesses({ ...guesses, year: e.target.value })}
						disabled={disabled}
					/>
				</div>
				<div>
					<label className='text-sm'>Artist</label>
					<Input
						value={guesses.artist}
						onChange={(e) => setGuesses({ ...guesses, artist: e.target.value })}
						disabled={disabled}
					/>
				</div>
				<div>
					<label className='text-sm'>Album</label>
					<Input
						value={guesses.album}
						onChange={(e) => setGuesses({ ...guesses, album: e.target.value })}
						disabled={disabled}
					/>
				</div>
				<div>
					<label className='text-sm'>Song Title</label>
					<Input
						value={guesses.title}
						onChange={(e) => setGuesses({ ...guesses, title: e.target.value })}
						disabled={disabled}
					/>
				</div>
			</div>
			<Button type='submit' disabled={disabled} className='w-full'>
				Submit Guesses
			</Button>
		</form>
	);
}
