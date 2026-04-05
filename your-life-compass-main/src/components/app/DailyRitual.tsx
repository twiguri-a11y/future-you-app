import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Zap, Cloud, Sun, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import VoiceInput from "@/components/app/VoiceInput";
import LifeAreaPicker from "@/components/app/LifeAreaPicker";

const MOODS = [
  { value: "energized", label: "Energized", icon: Zap, color: "text-accent" },
  { value: "calm", label: "Calm", icon: Sun, color: "text-secondary" },
  { value: "neutral", label: "Neutral", icon: Meh, color: "text-muted-foreground" },
  { value: "low", label: "Low", icon: Cloud, color: "text-muted-foreground" },
  { value: "heavy", label: "Heavy", icon: Frown, color: "text-destructive" },
];

interface DailyRitualProps {
  onComplete: () => void;
  todayDone: boolean;
}

const DailyRitual = ({ onComplete, todayDone }: DailyRitualProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState("");
  const [intention, setIntention] = useState("");
  const [reflection, setReflection] = useState("");
  const [lifeArea, setLifeArea] = useState("");
  const [alignmentScore, setAlignmentScore] = useState(5);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from("daily_alignment").upsert(
        {
          user_id: user.id,
          date: todayStr,
          mood,
          intention,
          reflection,
          life_area: lifeArea || null,
          alignment_score: alignmentScore,
        },
        { onConflict: "user_id,date" }
      );
      if (error) throw error;
      toast({ title: "You showed up today", description: "That's what staying aligned looks like." });
      onComplete();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 5;

  const steps = [
    // Step 0: Mood
    <motion.div key="mood" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <h3 className="text-lg font-bold mb-1">How are you showing up today?</h3>
      <p className="text-sm text-muted-foreground mb-5">There's no wrong answer. Just honesty.</p>
      <div className="grid grid-cols-5 gap-2">
        {MOODS.map((m) => {
          const Icon = m.icon;
          const selected = mood === m.value;
          return (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                selected ? "border-primary bg-primary/10 scale-105" : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <Icon className={`w-5 h-5 ${selected ? "text-primary" : m.color}`} />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
      <Button className="w-full mt-5" variant="hero" size="lg" disabled={!mood} onClick={() => setStep(1)}>
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>,

    // Step 1: Intention — one small aligned step
    <motion.div key="intention" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <h3 className="text-lg font-bold mb-1">Take one small aligned step today.</h3>
      <p className="text-sm text-muted-foreground mb-4">What's one thing you could do today that your future self would quietly respect?</p>
      <Textarea
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="e.g. I'll stay present in every conversation today."
        className="min-h-[80px] bg-card border-border"
        maxLength={300}
      />
      <div className="flex items-center justify-between mt-2">
        <VoiceInput onTranscript={(text) => setIntention((prev) => prev ? prev + " " + text : text)} />
        <Button variant="hero" size="lg" disabled={!intention.trim()} onClick={() => setStep(2)}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Life Area
    <motion.div key="lifearea" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <h3 className="text-lg font-bold mb-1">What area of life is this about?</h3>
      <p className="text-sm text-muted-foreground mb-5">Optional — helps you see your balance over time.</p>
      <LifeAreaPicker value={lifeArea} onChange={setLifeArea} />
      <Button className="w-full mt-5" variant="hero" size="lg" onClick={() => setStep(3)}>
        Continue <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>,

    // Step 3: Reflection
    <motion.div key="reflection" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <h3 className="text-lg font-bold mb-1">A quiet moment of gratitude.</h3>
      <p className="text-sm text-muted-foreground mb-4">What's one thing you notice right now that you're grateful for?</p>
      <Textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Something small is enough."
        className="min-h-[80px] bg-card border-border"
        maxLength={300}
      />
      <div className="flex items-center justify-between mt-2">
        <VoiceInput onTranscript={(text) => setReflection((prev) => prev ? prev + " " + text : text)} />
        <Button variant="hero" size="lg" disabled={!reflection.trim()} onClick={() => setStep(4)}>
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 4: Alignment Score — reflection question
    <motion.div key="alignment" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
      <h3 className="text-lg font-bold mb-1">Did today reflect who you want to become?</h3>
      <p className="text-sm text-muted-foreground mb-6">Not a grade — just a feeling.</p>
      <div className="flex items-center justify-center mb-3">
        <span className="text-4xl font-bold text-primary">{alignmentScore}</span>
        <span className="text-lg text-muted-foreground ml-1">/10</span>
      </div>
      <div className="flex justify-between gap-1.5 mb-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            onClick={() => setAlignmentScore(v)}
            className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all ${
              v === alignmentScore
                ? "bg-primary text-primary-foreground scale-110"
                : v <= alignmentScore
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-5">
        <span>Not at all</span>
        <span>Fully aligned</span>
      </div>
      <Button className="w-full" variant="hero" size="lg" disabled={saving} onClick={handleSave}>
        {saving ? "Saving..." : "Complete Ritual"} <Check className="w-4 h-4" />
      </Button>
    </motion.div>,
  ];

  if (todayDone) {
    return null;
  }

  return (
    <div className="py-2">
      <div className="flex items-center justify-center gap-2 mb-5">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-muted"
            }`}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
    </div>
  );
};

export default DailyRitual;
