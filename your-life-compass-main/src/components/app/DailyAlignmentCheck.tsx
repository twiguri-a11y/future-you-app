import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const QUESTION = "Are you acting with intention today or reacting?";

const RESPONSES: Record<string, string[]> = {
  fully: [
    "Nice — you're showing up with intention today.",
    "You're on track. Keep moving like this.",
    "This is what alignment feels like.",
    "You're leading your day, not following it.",
  ],
  mostly: [
    "You're close — one small shift can change everything.",
    "Almost there. Trust the direction you're heading.",
    "A small adjustment is all it takes today.",
    "You're aware, and that's already half the work.",
  ],
  somewhat: [
    "Pause. Reset. Choose one intentional step.",
    "It's okay to feel off — noticing it is the first move.",
    "One conscious choice can turn this around.",
    "You're not lost. You just need a moment.",
  ],
  not: [
    "Start small. One action can shift everything.",
    "Today isn't defined yet. You still get to choose.",
    "Even showing up here is a step forward.",
    "Reset. Breathe. Pick one thing that matters.",
  ],
};

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const OPTIONS = [
  { key: "fully", label: "Fully aligned" },
  { key: "mostly", label: "Mostly aligned" },
  { key: "somewhat", label: "A bit off" },
  { key: "not", label: "Not aligned" },
] as const;

type AlignmentKey = (typeof OPTIONS)[number]["key"];
const SCORE_MAP: Record<AlignmentKey, number> = { fully: 10, mostly: 7, somewhat: 4, not: 2 };

interface DailyAlignmentCheckProps {
  delay?: number;
  onComplete?: () => void;
}

const DailyAlignmentCheck = ({ delay = 0, onComplete }: DailyAlignmentCheckProps) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<AlignmentKey | null>(null);
  const responseRef = useRef<string | null>(null);

  const handleSelect = async (key: AlignmentKey) => {
    // Pick a new response only when changing selection
    if (key !== selected) {
      responseRef.current = pick(RESPONSES[key]);
    }
    setSelected(key);
    if (user) {
      const todayStr = new Date().toISOString().slice(0, 10);
      await supabase.from("daily_alignment").upsert(
        { user_id: user.id, date: todayStr, alignment_score: SCORE_MAP[key], mood: key },
        { onConflict: "user_id,date" }
      );
    }
    onComplete?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-card border border-border shadow-sm p-5"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Compass className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-bold text-sm text-foreground">Alignment Check-In</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{QUESTION}</p>

      <div className="flex flex-col gap-1">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => handleSelect(opt.key)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-foreground hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && responseRef.current && (
          <motion.p
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="mt-3 text-sm text-primary font-medium leading-relaxed px-1"
          >
            {responseRef.current}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyAlignmentCheck;
