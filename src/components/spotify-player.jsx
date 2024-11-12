'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Music2, ExternalLink } from 'lucide-react';

export function SpotifyPlayer({ title, artist }) {
	const [track, setTrack] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [audioElement, setAudioElement] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
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

	const openInSpotify = () => {
		if (track?.external_urls?.spotify) {
			window.open(track.external_urls.spotify, '_blank');
		}
	};

	if (loading) {
		return (
			<Card className="p-4">
				<div className="flex items-center justify-center space-x-2">
					<Music2 className="h-5 w-5 animate-spin" />
					<span>Finding song...</span>
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="p-4">
				<div className="text-center text-red-500">
					<p>Couldnt find song on Spotify</p>
				</div>
			</Card>
		);
	}

	if (!track) {
		return (
			<Card className="p-4">
				<div className="text-center text-gray-500">
					<p>No Spotify match found</p>
				</div>
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
						className="w-16 h-16 rounded shadow-sm"
					/>
				)}
				<div className="flex-grow min-w-0">
					<h3 className="font-semibold truncate">{track.name}</h3>
					<p className="text-sm text-gray-500 truncate">
						{track.artists.map(a => a.name).join(', ')}
					</p>
				</div>
				<div className="flex items-center space-x-2">
					{track.preview_url ? (
						<Button
							onClick={togglePlay}
							size="icon"
							variant={isPlaying ? "secondary" : "default"}
							title={isPlaying ? "Pause preview" : "Play preview"}
						>
							{isPlaying ? (
								<Pause className="h-5 w-5" />
							) : (
								<Play className="h-5 w-5" />
							)}
						</Button>
					) : null}
					<Button
						onClick={openInSpotify}
						size="icon"
						variant="outline"
						title="Open in Spotify"
					>
						<ExternalLink className="h-5 w-5" />
					</Button>
				</div>
			</div>
			{track.preview_url ? (
				<p className="text-xs text-gray-400 mt-2 text-center">
					30 second preview available
				</p>
			) : (
				<p className="text-xs text-gray-400 mt-2 text-center">
					Full song available on Spotify
				</p>
			)}
		</Card>
	);
}

