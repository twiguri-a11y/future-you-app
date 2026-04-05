import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const reflectionOptions = ["Not really.", "Not yet.", "Getting there."];

interface ReflectionScreenProps {
  answer: string | null;
  onSelect: (opt: string) => void;
  onContinue: () => void;
}

const ReflectionScreen = ({ answer, onSelect, onContinue }: ReflectionScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key="reflection"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles className="w-6 h-6 text-accent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold leading-tight mb-3"
            >
              Be honest with yourself.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg text-muted-foreground mb-10 leading-relaxed"
            >
              Are you living the life you actually want?
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="grid gap-3"
            >
              {reflectionOptions.map((opt) => (
                <motion.button
                  key={opt}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(opt)}
                  className={`rounded-xl p-4 text-sm font-medium transition-all border text-center ${
                    answer === opt
                      ? "border-accent bg-accent/5 shadow-soft text-foreground"
                      : "border-border bg-card hover:border-accent/30 text-foreground"
                  }`}
                >
                  {opt}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 pt-0 max-w-lg mx-auto w-full">
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          disabled={!answer}
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ReflectionScreen;
