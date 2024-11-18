"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Player } from "@/types/game";
import { Trash2 } from "lucide-react";
import { deleteSession } from "@/lib/actions";

interface Session {
	id: string;
	name: string;
	players: Player[];
}

export default function SessionsList() {
	const [sessions, setSessions] = useState<Session[]>([]);

	useEffect(() => {
		fetch("/api/sessions")
			.then((res) => res.json())
			.then(setSessions);
	}, []);

	const createSession = async () => {
		const name = prompt("Enter session name:");
		if (!name) return;

		const res = await fetch("/api/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});
		const newSession = await res.json();
		setSessions([...sessions, newSession]);
	};

	return (
		<div className='space-y-4'>
			<Button onClick={createSession}>Create New Session</Button>

			<div className='grid gap-4'>
				{sessions.map((session) => (
					<Card key={session.id} className='p-4 flex flex-row justify-between items-center'>
						<div className='flex-col flex justify-between items-start'>
							<h3>{session.name}</h3>
							<p>Players: {session.players?.length}</p>
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
