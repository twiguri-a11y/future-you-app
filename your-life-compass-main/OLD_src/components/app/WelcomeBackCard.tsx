import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useState } from "react";

const MESSAGES = [
  "Your future self has been waiting for you. No rush — you're here now.",
  "Something brought you back. That's worth noticing.",
  "Progress isn't a straight line. Picking back up takes quiet courage.",
  "The version of you that you're becoming? Still there. Still rooting for you.",
  "Life got busy. That's okay. Your vision didn't go anywhere.",
  "You may already sense this — coming back after a break means something.",
  "You don't need to be perfect. Showing up is its own kind of strength.",
  "Your streak may have paused, but your growth didn't.",
];

interface WelcomeBackCardProps {
  daysAway: number;
  onDismiss: () => void;
}

const WelcomeBackCard = ({ daysAway, onDismiss }: WelcomeBackCardProps) => {
  const [visible, setVisible] = useState(true);
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 mb-4 relative"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-secondary" />
            <span className="text-xs font-bold text-secondary uppercase tracking-wide">
              Welcome back
            </span>
          </div>

          <p className="text-sm text-foreground/90 leading-relaxed pr-6">
            {message}
          </p>

          {daysAway >= 7 && (
            <p className="text-xs text-muted-foreground mt-3">
              It's been {daysAway} days — and here you are. That says something.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeBackCard;
