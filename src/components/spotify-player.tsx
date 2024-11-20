"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Music2 } from "lucide-react";
import { pauseSongOnSpotify } from "@/lib/actions";

interface SpotifyPlayerProps {
	title: string;
	artist: string;
	isCurrentPlayersTurn: boolean;
}

export function SpotifyPlayer({ title, artist, isCurrentPlayersTurn }: SpotifyPlayerProps) {
	const [track, setTrack] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		checkSpotifyAuth();
	}, []);

	const checkSpotifyAuth = async () => {
		try {
			const response = await fetch("/api/spotify/check-auth");
			const data = await response.json();
			setIsAuthenticated(data.isAuthenticated);
		} catch (err) {
			console.error("Error checking Spotify auth:", err);
		}
	};

	useEffect(() => {
		setIsPlaying(false);
		if (audioElement) {
			audioElement.pause();
			setAudioElement(null);
			setHasStartedPlaying(false);
		}
	}, [isCurrentPlayersTurn]);

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

				const response = await fetch(
					`/api/spotify-search?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`
				);
				const data = await response.json();

				if (data.error) {
					throw new Error(data.error);
				}

				setTrack(data);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		if (title && artist) {
			fetchTrack();
		}
	}, [title, artist]);

	const togglePlay = async () => {
		if (!track) return;

		if (track.preview_url) {
			// Use preview URL if available
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
				audio.addEventListener("ended", () => {
					setIsPlaying(false);
				});
				audio.play();
				setAudioElement(audio);
				setIsPlaying(true);
				setHasStartedPlaying(true);
			}
		} else if (track.uri && isAuthenticated) {
			try {
				if (isPlaying) {
					await pauseSongOnSpotify();
					setIsPlaying(false);
				} else {
					const response = await fetch("/api/spotify/play", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							uri: track.uri,
						}),
					});

					if (!response.ok) {
						throw new Error("Failed to play track");
					}

					setIsPlaying(true);
					setHasStartedPlaying(true);
				}
			} catch (err) {
				console.error("Error playing track:", err);
				setError("Failed to play track. Please try again.");
			}
		}
	};

	if (loading) {
		return (
			<Card className='p-4'>
				<div className='flex items-center justify-center space-x-2'>
					<Music2 className='h-5 w-5 animate-spin' />
					<span>Finding song...</span>
				</div>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className='p-4'>
				<div className='text-center text-red-500'>
					<p>{error}</p>
				</div>
			</Card>
		);
	}

	if (!track) {
		return (
			<Card className='p-4'>
				<div className='text-center text-gray-500'>
					<p>No Spotify match found</p>
				</div>
			</Card>
		);
	}

	// Current player's view
	if (!track.preview_url && !isAuthenticated) {
		return (
			<Card className='p-4'>
				<div className='text-center'>
					<p className='mb-4'>No preview available for this song</p>
					<Button onClick={() => (window.location.href = "/api/spotify/auth")} variant='outline'>
						Authenticate with Spotify to play full song
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<Card className='p-4'>
			<div className='text-center'>
				<Button
					onClick={togglePlay}
					size='lg'
					className='w-full max-w-xs'
					variant={isPlaying ? "secondary" : "default"}>
					{isPlaying ? (
						<>
							<Pause className='mr-2 h-5 w-5' />
							Pause {track.preview_url ? "Preview" : "Song"}
						</>
					) : (
						<>
							<Play className='mr-2 h-5 w-5' />
							{hasStartedPlaying
								? `Resume ${track.preview_url ? "Preview" : "Song"}`
								: `Start ${track.preview_url ? "Preview" : "Song"}`}
						</>
					)}
				</Button>
			</div>
		</Card>
	);
}
