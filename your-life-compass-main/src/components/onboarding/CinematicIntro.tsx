import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CinematicIntroProps {
  onComplete: (wakingAnswer: string) => void;
}

const STEPS = [
  {
    type: "text" as const,
    lines: [
      { text: "This might feel more accurate than you expect.", delay: 0 },
      { text: "Imagine your life exactly as you want it.", delay: 1200 },
    ],
    duration: 4500,
  },
  {
    type: "input" as const,
    content: "Where are you waking up?",
    placeholder: "A quiet place by the water…",
    suggestions: ["By the ocean", "A quiet city loft", "In the mountains", "Somewhere warm"],
  },
  {
    type: "text" as const,
    lines: [
      { text: "That felt specific.", delay: 0 },
      { text: "Most people never get this clear.", delay: 1000 },
    ],
    duration: 4000,
  },
  {
    type: "text" as const,
    lines: [
      { text: "You're not imagining this.", delay: 0 },
      { text: "You're remembering something you haven't lived yet.", delay: 1200 },
    ],
    duration: 4500,
  },
];

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
};

const CinematicIntro = ({ onComplete }: CinematicIntroProps) => {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");

  const current = STEPS[step];

  useEffect(() => {
    if (current.type === "text" && current.duration) {
      const timer = setTimeout(() => {
        if (step < STEPS.length - 1) {
          setStep(step + 1);
        } else {
          onComplete(answer);
        }
      }, current.duration);
      return () => clearTimeout(timer);
    }
  }, [step, current, answer, onComplete]);

  const handleInputSubmit = () => {
    if (answer.trim()) {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Progress dots */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            animate={{
              backgroundColor: i <= step ? "hsl(var(--accent))" : "hsl(var(--muted))",
              scale: i === step ? 1.3 : 1,
            }}
            transition={{ duration: 0.4 }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          {...fadeIn}
          className="max-w-md w-full text-center"
        >
          {current.type === "text" && current.lines ? (
            <div className="space-y-4">
              {current.lines.map((line, i) => (
                <TextLine key={i} text={line.text} delay={line.delay} />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {current.content}
              </h2>

              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={current.placeholder}
                className="text-center text-base h-12 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm"
                onKeyDown={(e) => e.key === "Enter" && handleInputSubmit()}
                autoFocus
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 justify-center">
                {current.suggestions?.map((s) => (
                  <motion.button
                    key={s}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAnswer(s)}
                    className={`px-4 py-2 rounded-full text-sm transition-all border ${
                      answer === s
                        ? "border-accent bg-accent/10 text-foreground"
                        : "border-border/50 text-muted-foreground hover:border-accent/30"
                    }`}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!answer.trim()}
                onClick={handleInputSubmit}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/** A single line of text that fades in after a delay */
const TextLine = ({ text, delay }: { text: string; delay: number }) => {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [delay]);

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="text-xl md:text-2xl font-light leading-relaxed text-foreground/85"
    >
      {text}
    </motion.p>
  );
};

export default CinematicIntro;
