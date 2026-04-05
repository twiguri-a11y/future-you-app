import { motion } from "framer-motion";
import { ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  "Do one thing today that your future self would thank you for.",
  "Spend 5 minutes in silence imagining the life you described.",
  "Write down one decision you can make today that aligns with your vision.",
  "Remove one distraction that pulls you away from who you're becoming.",
  "Tell someone about the version of yourself you're building.",
];

const PROMPTS = [
  "Did your actions today reflect who you want to become?",
  "What's one thing you did today that your future self would be proud of?",
  "Were you aligned with your vision today — even in small ways?",
];

interface StayAlignedSectionProps {
  delay?: number;
}

const StayAlignedSection = ({ delay = 0.8 }: StayAlignedSectionProps) => {
  const navigate = useNavigate();
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="rounded-2xl bg-card shadow-card p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-accent" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-accent">
          Stay aligned today
        </h3>
      </div>

      {/* Small action */}
      <div className="rounded-xl bg-muted/50 p-4">
        <p className="text-sm text-foreground/90 leading-relaxed">{action}</p>
      </div>

      {/* Reflection prompt */}
      <div className="rounded-xl border border-secondary/15 bg-secondary/5 p-4">
        <p className="text-xs font-semibold text-secondary uppercase tracking-wide mb-1.5">
          Reflect
        </p>
        <p className="text-sm text-foreground/80 italic leading-relaxed">
          "{prompt}"
        </p>
      </div>

      {/* Continue button */}
      <Button
        variant="hero"
        className="w-full"
        size="lg"
        onClick={() => navigate("/app/daily")}
      >
        Continue today
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

export default StayAlignedSection;
