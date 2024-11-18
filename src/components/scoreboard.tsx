import { Player } from "@/types/game";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreboardProps {
	players: Player[];
	currentPlayerId: string;
	currentPlayerName: string;
	localPlayerId: string;
	currentRound: number;
	totalRounds: number;
}

export function Scoreboard({
	players,
	currentPlayerId,
	currentPlayerName,
	localPlayerId,
	currentRound,
	totalRounds,
}: ScoreboardProps) {
	// Sort players to show local player first
	const sortedPlayers = [...players].sort((a, b) => {
		if (a.id === localPlayerId) return -1;
		if (b.id === localPlayerId) return 1;
		return b.score - a.score;
	});

	return (
		<Card className='p-4'>
			<div className='flex justify-between items-center mb-4'>
				<div className='space-y-1'>
					<h2 className='text-xl font-bold'>Scoreboard</h2>
					<div className='text-sm text-gray-500'>Round {currentRound}</div>
				</div>
				{currentPlayerId && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						key={currentPlayerId}
						className='text-primary'>
						Current Turn: {currentPlayerName}
					</motion.div>
				)}
			</div>
			<div className='grid gap-4'>
				<AnimatePresence>
					{sortedPlayers.map((player) => (
						<motion.div
							key={player.id}
							initial={player.id === currentPlayerId ? { scale: 0.95 } : { scale: 1 }}
							animate={player.id === currentPlayerId ? { scale: 1.05 } : { scale: 1 }}
							transition={{ duration: 0.3 }}
							className={`
                flex justify-between items-center p-3 rounded-lg
                ${player.id === localPlayerId ? "bg-primary/10 font-bold" : "bg-gray-100"}
                ${player.id === currentPlayerId ? "ring-2 ring-primary/20 shadow-lg" : ""}
              `}>
							<span>{player.name}</span>
							<span className='text-xl'>
								{player.score}/{totalRounds}
							</span>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</Card>
	);
}
