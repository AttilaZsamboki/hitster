import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface WinAnimationProps {
  playerName: string;
  onComplete?: () => void;
}

export function WinAnimation({ playerName, onComplete }: WinAnimationProps) {
  useEffect(() => {
    // Create a more elaborate confetti effect for winning
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 }
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"
      >
        <motion.div
          initial={{ y: -100, scale: 0.8 }}
          animate={{ 
            y: 0, 
            scale: 1,
            transition: { type: "spring", bounce: 0.5 }
          }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              transition: { 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <span className="text-7xl">👑</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mt-4"
          >
            {playerName} Wins!
          </motion.h1>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 