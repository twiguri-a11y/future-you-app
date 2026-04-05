import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateInsight } from "@/lib/dailyInsights";
import { useMemo } from "react";

const DailyCompletionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { mood, alignmentScore, hasIntention, streak } = (location.state as {
    mood?: string;
    alignmentScore?: number;
    hasIntention?: boolean;
    streak?: number;
  }) || {};

  const insight = useMemo(
    () =>
      generateInsight({
        mood: mood || "😐 Neutral",
        alignmentScore: alignmentScore ?? 5,
        hasIntention: hasIntention ?? false,
      }),
    [mood, alignmentScore, hasIntention]
  );

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.6, ease: "easeOut" as const },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        className="flex flex-col items-center text-center max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Success icon */}
        <motion.div
          {...anim(0.2)}
          className="w-14 h-14 rounded-full border-2 border-primary/30 bg-primary/5 flex items-center justify-center mb-8"
        >
          <Check className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </motion.div>

        {/* Acknowledgment */}
        <motion.h1
          {...anim(0.5)}
          className="text-2xl font-display font-semibold text-foreground tracking-tight"
        >
          {insight.acknowledgment}
        </motion.h1>

        {/* Personalized insight */}
        <motion.p
          {...anim(0.9)}
          className="text-sm text-muted-foreground mt-5 leading-relaxed font-body max-w-xs"
        >
          {insight.message}
        </motion.p>

        {/* Reinforcement */}
        {insight.reinforcement && (
          <motion.p
            {...anim(1.3)}
            className="text-xs text-muted-foreground/70 mt-6 font-body italic"
          >
            {insight.reinforcement}
          </motion.p>
        )}

        {/* Streak / journey marker */}
        {streak !== undefined && streak > 0 && (
          <motion.p
            {...anim(1.5)}
            className="text-xs text-muted-foreground/50 mt-8 font-body"
          >
            Day {streak} of your journey
          </motion.p>
        )}

        {/* Continue button */}
        <motion.div {...anim(1.7)} className="mt-10 w-full">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate("/app")}
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DailyCompletionPage;
