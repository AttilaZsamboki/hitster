"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Session {
	id: string;
	name: string;
	players: any[];
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
					<Card key={session.id} className='p-4'>
						<h3>{session.name}</h3>
						<p>Players: {session.players?.length}</p>
						<Link href={`/game/${session.id}`}>
							<Button>Join Session</Button>
						</Link>
					</Card>
				))}
			</div>
		</div>
	);
}
