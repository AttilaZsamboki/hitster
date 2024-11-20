import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CreateSessionDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onCreateSession: (sessionData: { name: string; maxSongs: number }) => void;
}

export function CreateSessionDialog({ isOpen, onClose, onCreateSession }: CreateSessionDialogProps) {
	const [sessionName, setSessionName] = useState("");
	const [maxSongs, setMaxSongs] = useState(10);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onCreateSession({ name: sessionName, maxSongs });
		setSessionName("");
		setMaxSongs(10);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Create New Session</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Session Name</Label>
						<Input
							id='name'
							value={sessionName}
							onChange={(e) => setSessionName(e.target.value)}
							placeholder='Enter session name'
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='maxSongs'>Songs to Win</Label>
						<Input
							id='maxSongs'
							type='number'
							min={1}
							max={50}
							value={maxSongs}
							onChange={(e) => setMaxSongs(parseInt(e.target.value))}
							required
						/>
						<p className='text-sm text-gray-500'>
							Number of songs a player needs to correctly place to win
						</p>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={onClose}>
							Cancel
						</Button>
						<Button type='submit' disabled={!sessionName}>
							Create Session
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
