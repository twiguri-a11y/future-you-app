import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronRight, SkipForward } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PROMPTS = [
  { category: "Identity", question: "If you removed every label others have given you, who would remain?" },
  { category: "Identity", question: "What belief about yourself are you ready to let go of?" },
  { category: "Values", question: "What do you defend even when it costs you something?" },
  { category: "Values", question: "When was the last time you acted against your own values?" },
  { category: "Fear", question: "What are you avoiding that your future self would thank you for facing?" },
  { category: "Fear", question: "What would you do differently if failure didn't exist?" },
  { category: "Purpose", question: "What work would you do even if nobody ever saw it?" },
  { category: "Purpose", question: "What problem in the world makes you feel personally responsible?" },
  { category: "Growth", question: "What's the hardest truth you've accepted about yourself this year?" },
  { category: "Growth", question: "What version of yourself are you grieving as you grow?" },
  { category: "Clarity", question: "If you could only keep three things in your life, what would they be?" },
  { category: "Clarity", question: "What are you holding onto that no longer serves who you're becoming?" },
];

const pick = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

const DeepPage = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(pick);
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const nextPrompt = () => {
    let next = pick();
    while (next.question === prompt.question && PROMPTS.length > 1) next = pick();
    setPrompt(next);
    setResponse("");
    setStep((s) => s + 1);
  };

  const handleSave = async () => {
    if (!user || !response.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("reflections").insert({
        user_id: user.id,
        prompt: prompt.question,
        response: response.trim(),
        category: prompt.category.toLowerCase(),
      });
      if (error) throw error;
      toast({ title: "Reflection saved", description: "This moment is captured." });
      nextPrompt();
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 },
  });

  return (
    <div className="px-6 py-8 max-w-md mx-auto space-y-6 pb-24">
      <motion.div {...anim(0)}>
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-secondary" />
          <h1 className="font-display text-2xl font-semibold text-foreground">Deep</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Take a moment when you're ready — no pressure.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-border bg-card p-5 space-y-5"
        >
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-secondary font-body font-medium">
              {prompt.category}
            </span>
            <h2 className="font-display text-lg font-semibold text-foreground mt-2 leading-snug">
              {prompt.question}
            </h2>
          </div>

          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Take your time. There's no rush."
            rows={5}
            maxLength={1000}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none leading-relaxed"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={nextPrompt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-body font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>

            <div className="flex-1" />

            <button
              onClick={handleSave}
              disabled={!response.trim() || saving}
              className="flex items-center gap-1.5 bg-foreground text-background font-body font-medium text-xs px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save & Next"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DeepPage;
