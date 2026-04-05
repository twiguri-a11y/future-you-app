import { motion, AnimatePresence } from "framer-motion";

interface MilestoneCelebrationProps {
  streak: number;
  onClose: () => void;
}

const milestones: Record<number, { message: string }> = {
  7: {
    message: "You've shown up for seven days.\nYou're starting to think like the person you want to become.",
  },
  14: {
    message: "Two weeks of choosing yourself.\nThis isn't something you're trying — it's something you're doing.",
  },
  21: {
    message: "Twenty-one days.\nThe way you see yourself is quietly changing.",
  },
  30: {
    message: "A full month.\nThis is no longer a goal. It's part of who you are now.",
  },
  60: {
    message: "Sixty days.\nMost people stopped a long time ago. You didn't.",
  },
  90: {
    message: "Ninety days of becoming.\nThe person you imagined is no longer imaginary.",
  },
  365: {
    message: "One year.\nYou didn't just change a habit. You changed who you are.",
  },
};

const MilestoneCelebration = ({ streak, onClose }: MilestoneCelebrationProps) => {
  const milestone = milestones[streak];
  if (!milestone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-background/95 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      >
        {/* Day count */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] mb-8"
        >
          Day {streak}
        </motion.p>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="text-lg text-foreground/90 leading-relaxed text-center max-w-xs whitespace-pre-line"
        >
          {milestone.message}
        </motion.p>

        {/* Subtle dismiss hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="absolute bottom-12 text-xs text-muted-foreground/50"
        >
          tap anywhere to continue
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
};

export const MILESTONE_DAYS = [7, 14, 21, 30, 60, 90, 365];

export default MilestoneCelebration;
