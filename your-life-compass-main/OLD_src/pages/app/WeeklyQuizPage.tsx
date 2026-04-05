import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  TrendingUp,
  ShieldAlert,
  Target,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const REFLECTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-reflection`;

const questions = [
  {
    key: "alignment",
    icon: Compass,
    label: "Vision Alignment",
    question: "How aligned did you feel with your future vision this week?",
    placeholder: "Think about your daily choices, habits, and mindset…",
  },
  {
    key: "progress",
    icon: TrendingUp,
    label: "Progress",
    question: "What progress did you make toward your goals?",
    placeholder: "Even small steps count — what moved the needle?",
  },
  {
    key: "challenges",
    icon: ShieldAlert,
    label: "Challenges",
    question: "What challenges or obstacles did you face?",
    placeholder: "What got in the way? What felt hard?",
  },
  {
    key: "focus",
    icon: Target,
    label: "Next Week",
    question: "What's your main focus for the upcoming week?",
    placeholder: "One intention or priority you want to commit to…",
  },
];

const WeeklyQuizPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    alignment: "",
    progress: "",
    challenges: "",
    focus: "",
  });
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentQ = questions[step];
  const currentAnswer = answers[currentQ?.key] || "";
  const isQuizDone = step >= questions.length;
  const canProceed = currentAnswer.trim().length >= 10;

  const goNext = () => {
    if (step < questions.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      setDirection(1);
      setStep(questions.length);
      generateSummary();
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const generateSummary = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setSummary("");
    setHasGenerated(false);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const resp = await fetch(REFLECTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ answers }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setSummary(full);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setHasGenerated(true);

      // Save to database
      const now = new Date();
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Monday
      const weekStartStr = weekStart.toISOString().split("T")[0];

      await supabase.from("weekly_reflections").upsert(
        {
          user_id: user.id,
          week_start: weekStartStr,
          alignment_answer: answers.alignment,
          progress_answer: answers.progress,
          challenges_answer: answers.challenges,
          focus_answer: answers.focus,
          ai_summary: full,
        },
        { onConflict: "user_id,week_start" }
      );
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [user, answers]);

  const startOver = () => {
    setStep(0);
    setAnswers({ alignment: "", progress: "", challenges: "", focus: "" });
    setSummary("");
    setHasGenerated(false);
    setDirection(-1);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="max-w-lg mx-auto">

      {/* Progress bar */}
      {!isQuizDone && (
        <div className="flex gap-1.5 mb-8">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{
                background:
                  i <= step
                    ? "var(--gradient-hero)"
                    : "hsl(var(--muted))",
              }}
            />
          ))}
        </div>
      )}

      {/* Quiz questions */}
      {!isQuizDone && currentQ && (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="rounded-2xl bg-card shadow-card p-6"
          >
            <div className="flex items-center gap-2 mb-1">
              <currentQ.icon className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-secondary uppercase tracking-wide">
                {currentQ.label}
              </span>
            </div>

            <h2 className="text-lg font-bold mb-4">{currentQ.question}</h2>

            <Textarea
              value={currentAnswer}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [currentQ.key]: e.target.value }))
              }
              placeholder={currentQ.placeholder}
              className="min-h-[120px] resize-none text-sm leading-relaxed"
            />

            <div className="flex justify-between mt-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
                disabled={step === 0}
                className="text-muted-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={goNext}
                disabled={!canProceed}
              >
                {step === questions.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Summary
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Generating state */}
      {isQuizDone && isGenerating && !summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-card shadow-card p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Your future self is reflecting on your week...
          </p>
        </motion.div>
      )}

      {/* Summary */}
      {isQuizDone && summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-card"
          style={{
            background:
              "linear-gradient(160deg, hsl(216 56% 98%) 0%, hsl(249 82% 96%) 40%, hsl(170 62% 92%) 100%)",
          }}
        >
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-hero)" }} />

          <div className="px-6 pt-7 pb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-secondary/20" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-secondary/60 font-semibold">
                Weekly Guidance
              </span>
              <div className="h-px flex-1 bg-secondary/20" />
            </div>

            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap space-y-3">
              {summary.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/30" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
              <div className="h-px flex-1 bg-accent/30" />
            </div>
          </div>

          {hasGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-6 pb-6"
            >
              <Button variant="outline" className="w-full" onClick={startOver}>
                <RotateCcw className="w-4 h-4" />
                Start New Reflection
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default WeeklyQuizPage;
