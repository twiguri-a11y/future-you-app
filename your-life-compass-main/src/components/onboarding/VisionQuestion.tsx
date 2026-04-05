import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import VoiceInput from "@/components/app/VoiceInput";

export interface VisionQuestionData {
  question: string;
  placeholder: string;
}

interface VisionQuestionProps {
  questions: VisionQuestionData[];
  step: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
  saving?: boolean;
}

const VisionQuestion = ({
  questions,
  step,
  answer,
  onAnswerChange,
  onNext,
  onBack,
  isLast,
  saving,
}: VisionQuestionProps) => {
  const current = questions[step];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
                  i <= step ? "gradient-hero" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {step + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center p-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-semibold mb-4">
              <Sparkles className="w-3 h-3" />
              Vision Builder
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
              {current.question}
            </h1>

            <Textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder={current.placeholder}
              className="min-h-[140px] text-base resize-none rounded-xl border-border bg-card focus:border-primary/50"
              autoFocus
            />
            <div className="mt-2">
              <VoiceInput onTranscript={(text) => onAnswerChange(answer ? answer + " " + text : text)} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Continue */}
      <div className="p-6 pt-0 max-w-lg mx-auto w-full">
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          disabled={!answer.trim() || saving}
          onClick={onNext}
        >
          {saving ? "Saving..." : isLast ? "Complete" : "Continue"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default VisionQuestion;
