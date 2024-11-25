import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface Playlist {
	id: string;
	name: string;
	trackCount: number;
	imageUrl?: string;
}

interface PlaylistSelectorProps {
	onPlaylistSelected: (playlistId: string) => void;
}

export function PlaylistSelector({ onPlaylistSelected }: PlaylistSelectorProps) {
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
		async function fetchPlaylists() {
			try {
				setError(null);
				const response = await fetch("/api/spotify/playlists");

				if (!response.ok) {
					throw new Error("Failed to fetch playlists");
				}

				const data = await response.json();
				setPlaylists(data.playlists);
			} catch (error) {
				console.error("Error fetching playlists:", error);
				setError("Failed to load playlists. Please try again.");
			} finally {
				setLoading(false);
			}
		}

		fetchPlaylists();
	}, []);

	if (loading) {
		return (
			<Card className='p-4'>
				<div className='flex items-center justify-center py-8'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
					<span className='ml-2'>Loading playlists...</span>
				</div>
			</Card>
		);
	}

	if (!isAuthenticated) {
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

	if (error) {
		return (
			<Card className='p-4'>
				<div className='text-center text-red-500 py-4'>
					<p>{error}</p>
					<Button variant='outline' className='mt-2' onClick={() => window.location.reload()}>
						Retry
					</Button>
				</div>
			</Card>
		);
	}

	return (
		<Card className='p-4'>
			<h3 className='font-bold mb-4'>Select Your Playlist</h3>
			<div className='grid gap-4'>
				{playlists.map((playlist) => (
					<Button
						key={playlist.id}
						variant='outline'
						className='w-full flex items-center gap-4 p-4 h-auto'
						onClick={() => onPlaylistSelected(playlist.id)}>
						{playlist.imageUrl && (
							<img src={playlist.imageUrl} alt={playlist.name} className='w-12 h-12 rounded' />
						)}
						<div className='flex-1 text-left'>
							<div className='font-medium'>{playlist.name}</div>
							<div className='text-sm text-gray-500'>{playlist.trackCount} tracks</div>
						</div>
					</Button>
				))}
			</div>
		</Card>
	);
}
