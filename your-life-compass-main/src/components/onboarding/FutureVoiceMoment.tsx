import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MomentShareCard from "@/components/app/MomentShareCard";

interface FutureVoiceMomentProps {
  onRecord: () => void;
  onSkip: () => void;
}

const FutureVoiceMoment = ({ onRecord, onSkip }: FutureVoiceMomentProps) => {
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSecond(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden dark:bg-[#0a0a0a]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative z-10 text-center max-w-md mx-auto"
      >
        {/* Pre-text emotional moment */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-10"
        >
          <p className="text-lg text-foreground/80 font-light leading-relaxed">
            You're not imagining this.
          </p>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={showSecond ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.7 }}
            className="text-lg text-foreground/60 font-light leading-relaxed mt-3"
          >
            You're remembering something you haven't lived yet.
          </motion.p>
        </motion.div>

        {/* Pulsing mic icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.2, type: "spring", stiffness: 150, damping: 20 }}
          className="relative mx-auto mb-10 w-20 h-20"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-accent/20"
          />
          <div className="absolute inset-0 rounded-full bg-accent/10 flex items-center justify-center backdrop-blur-sm border border-accent/20">
            <Mic className="w-8 h-8 text-accent" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.7 }}
          className="text-accent/70 text-sm font-medium tracking-widest uppercase mb-4"
        >
          One last thing
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="text-3xl md:text-4xl font-bold text-foreground dark:text-white leading-tight mb-4"
        >
          Hear your own
          <br />
          future voice.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.7 }}
          className="text-muted-foreground text-base leading-relaxed mb-12"
        >
          Words meant for you — from you.
          <br />
          Say them out loud. Let them land.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.5 }}
          className="space-y-3"
        >
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={onRecord}
          >
            <Mic className="w-5 h-5" />
            Record Now
          </Button>

          <button
            onClick={onSkip}
            className="text-muted-foreground/50 hover:text-muted-foreground text-sm transition-colors"
          >
            Maybe later
          </button>
        </motion.div>

        {/* Subtle share moment — after onboarding completion */}
        <div className="mt-10">
          <MomentShareCard delay={4.5} />
        </div>
      </motion.div>
    </div>
  );
};

export default FutureVoiceMoment;
