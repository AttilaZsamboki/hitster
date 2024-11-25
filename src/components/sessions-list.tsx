"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Player } from "@/types/game";
import { Trash2 } from "lucide-react";
import { deleteSession } from "@/lib/actions";
import { CreateSessionDialog } from "./create-session-dialog";

interface Session {
	id: string;
	name: string;
	players: Player[];
	maxSongs: number;
}

export default function SessionsList() {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	useEffect(() => {
		fetch("/api/sessions")
			.then((res) => res.json())
			.then(setSessions);
	}, []);

	const handleCreateSession = async ({
		name,
		maxSongs,
		mode,
	}: {
		name: string;
		maxSongs: number;
		mode: "packages" | "playlists";
	}) => {
		const res = await fetch("/api/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, maxSongs, mode }),
		});
		const newSession = await res.json();
		setSessions([...sessions, newSession]);
	};

	return (
		<div className='space-y-4'>
			<Button onClick={() => setIsCreateDialogOpen(true)}>Create New Session</Button>

			<CreateSessionDialog
				isOpen={isCreateDialogOpen}
				onClose={() => setIsCreateDialogOpen(false)}
				onCreateSession={handleCreateSession}
			/>

			<div className='grid gap-4'>
				{sessions.map((session) => (
					<Card key={session.id} className='p-4 flex flex-row justify-between items-center'>
						<div className='flex-col flex justify-between items-start'>
							<h3>{session.name}</h3>
							<p className='text-sm text-gray-500'>
								Players: {session.players?.length} | Songs to Win: {session.maxSongs}
							</p>
							<Link href={`/game/${session.id}`}>
								<Button>Join Session</Button>
							</Link>
						</div>
						<div className='flex-col flex justify-between items-end'>
							<Button
								className='bg-red-500 hover:bg-red-600 text-white'
								onClick={() => {
									deleteSession(parseInt(session.id));
									setSessions(sessions.filter((s) => s.id !== session.id));
								}}
								variant='outline'>
								<Trash2 className='w-4 h-4' />
							</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
}
