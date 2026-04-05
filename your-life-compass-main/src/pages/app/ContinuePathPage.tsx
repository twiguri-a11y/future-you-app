import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const INSIGHTS = [
  "You've been building momentum quietly. The small choices you've made this week are already shaping your next chapter.",
  "Something shifted recently — not dramatically, but enough. You're closer to alignment than you think.",
  "The version of you that exists six months from now started with days exactly like this one.",
];

const ACTIONS = [
  "Spend 5 quiet minutes imagining your ideal morning one year from now.",
  "Write down one thing you're proud of from this week — no matter how small.",
  "Choose one task today and do it as if your future self asked you to.",
  "Say no to one thing that doesn't serve the person you're becoming.",
  "Take a slow walk and notice three things you're grateful for.",
];

const ContinuePathPage = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const day = new Date().getDate();
  const insight = INSIGHTS[day % INSIGHTS.length];
  const action = ACTIONS[day % ACTIONS.length];

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(() => navigate("/app"), 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">
          Continue Your Path
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-body">
          A moment of clarity, just for you.
        </p>
      </motion.div>

      {/* Content container */}
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Insight card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-border/50 shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-secondary" />
                <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-secondary">
                  Today's Insight
                </span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed font-body italic">
                "{insight}"
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border-secondary/20 bg-secondary/5 shadow-[var(--shadow-card)]">
            <CardContent className="p-6">
              <span className="text-[10px] font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3 block">
                One step today
              </span>
              <p className="text-sm text-foreground font-body font-medium leading-relaxed">
                {action}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col items-center gap-3 mt-4"
        >
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleAccept}
            disabled={accepted}
          >
            {accepted ? "Let's go ✓" : "I'll do this"}
            {!accepted && <ArrowRight className="w-4 h-4" />}
          </Button>

          <button
            onClick={() => navigate("/app")}
            className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Skip for today
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ContinuePathPage;
