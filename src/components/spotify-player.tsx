'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music2 } from 'lucide-react';

export function SpotifyPlayer({ title, artist }) {
	const [track, setTrack] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [audioElement, setAudioElement] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		// Cleanup previous audio element when component unmounts
		return () => {
			if (audioElement) {
				audioElement.pause();
				setAudioElement(null);
			}
		};
	}, []);

	useEffect(() => {
		const fetchTrack = async () => {
			try {
				setLoading(true);
				setError(null);

				// Stop any currently playing audio
				if (audioElement) {
					audioElement.pause();
					setAudioElement(null);
					setIsPlaying(false);
				}

				const response = await fetch(`/api/spotify-search?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
				const data = await response.json();

				if (data.error) {
					throw new Error(data.error);
				}

				setTrack(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		if (title && artist) {
			fetchTrack();
		}
	}, [title, artist]);

	const togglePlay = () => {
		if (!track?.preview_url) return;

		if (audioElement) {
			if (isPlaying) {
				audioElement.pause();
				setIsPlaying(false);
			} else {
				audioElement.play();
				setIsPlaying(true);
			}
		} else {
			const audio = new Audio(track.preview_url);
			audio.addEventListener('ended', () => {
				setIsPlaying(false);
			});
			audio.play();
			setAudioElement(audio);
			setIsPlaying(true);
		}
	};

	if (loading) {
		return (
			<Card className="p-4 flex items-center justify-center">
				<span className="animate-spin mr-2">
					<Music2 className="h-5 w-5" />
				</span>
				Loading...
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="p-4 text-red-500">
				Failed to load preview
			</Card>
		);
	}

	if (!track?.preview_url) {
		return (
			<Card className="p-4">
				No preview available
			</Card>
		);
	}

	return (
		<Card className="p-4">
			<div className="flex items-center space-x-4">
				{track.album?.images?.[0] && (
					<img
						src={track.album.images[0].url}
						alt={track.name}
						className="w-16 h-16 rounded"
					/>
				)}
				<div className="flex-grow">
					<h3 className="font-semibold">{track.name}</h3>
					<p className="text-sm text-gray-500">{track.artists[0].name}</p>
				</div>
				<Button
					onClick={togglePlay}
					size="icon"
					variant={isPlaying ? "secondary" : "default"}
				>
					{isPlaying ? (
						<Pause className="h-5 w-5" />
					) : (
						<Play className="h-5 w-5" />
					)}
				</Button>
			</div>
		</Card>
	);
}

