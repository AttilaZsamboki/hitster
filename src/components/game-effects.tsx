import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { GuessDetails } from "@/types/game";

interface GameEffectsProps {
	isCorrect: boolean | null;
	songDetails?: {
		title: string;
		artist: string;
		year: number;
	};
	guessDetails?: GuessDetails;
	pointsEarned?: number;
	onComplete?: () => void;
}

export function GameEffects({ isCorrect, songDetails, guessDetails, pointsEarned, onComplete }: GameEffectsProps) {
	console.log(guessDetails);
	useEffect(() => {
		if (isCorrect !== null) {
			if (isCorrect) {
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
				});
			}
		}
	}, [isCorrect]);

	return (
		<AnimatePresence onExitComplete={onComplete}>
			{isCorrect !== null && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50`}
					onClick={(e) => {
						// Only trigger if clicking the backdrop
						if (e.target === e.currentTarget) {
							onComplete?.();
						}
					}}>
					<motion.div
						initial={{ y: 50 }}
						animate={{ y: 0 }}
						exit={{ y: 50 }}
						className={`p-6 rounded-lg shadow-xl ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
						<div className='text-center'>
							<motion.div
								animate={
									isCorrect
										? {
												scale: [1, 1.2, 1],
												rotate: [0, 5, -5, 0],
										  }
										: {
												x: [-10, 10, -10, 10, 0],
												transition: { duration: 0.5 },
										  }
								}>
								<h2
									className={`text-2xl font-bold mb-4 ${
										isCorrect ? "text-green-700" : "text-red-700"
									}`}>
									{isCorrect ? "🎉 Correct!" : "❌ Incorrect!"}
								</h2>
							</motion.div>
							{songDetails && (
								<div className='mt-4 space-y-4'>
									<div>
										<p className='text-gray-700'>The song was from:</p>
										<p className='font-bold text-lg'>{songDetails.year}</p>
										<p className='text-sm text-gray-600'>
											{songDetails.title} - {songDetails.artist}
										</p>
									</div>

									{isCorrect && guessDetails && (
										<div className='border-t pt-4'>
											<p className='font-medium mb-2'>Points Earned: {pointsEarned}</p>
											<div className='text-sm space-y-1'>
												<p>✓ Timeline Placement (1 point)</p>
												{guessDetails.yearGuess && <p>✓ Exact Year (+0.5 points)</p>}
												{guessDetails.artistGuess && <p>✓ Artist Name (+0.5 points)</p>}
												{guessDetails.albumGuess && <p>✓ Album Name (+0.5 points)</p>}
												{guessDetails.titleGuess && <p>✓ Song Title (+0.5 points)</p>}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
