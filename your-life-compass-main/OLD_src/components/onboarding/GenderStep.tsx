import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export type Gender = "male" | "female" | "neutral";

const options: { value: Gender; labelKey: string; fallback: string }[] = [
  { value: "male", labelKey: "onboarding.genderMale", fallback: "Male" },
  { value: "female", labelKey: "onboarding.genderFemale", fallback: "Female" },
  { value: "neutral", labelKey: "onboarding.genderNeutral", fallback: "Prefer not to say" },
];

interface GenderStepProps {
  selected: Gender | null;
  onSelect: (g: Gender) => void;
  onContinue: () => void;
}

const GenderStep = ({ selected, onSelect, onContinue }: GenderStepProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key="gender"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-8"
            >
              <User className="w-6 h-6 text-accent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold leading-tight mb-2"
            >
              {t("onboarding.genderTitle") !== "onboarding.genderTitle"
                ? t("onboarding.genderTitle")
                : "How should we address you?"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-lg text-muted-foreground mb-10 leading-relaxed"
            >
              {t("onboarding.genderSubtext") !== "onboarding.genderSubtext"
                ? t("onboarding.genderSubtext")
                : "This helps us personalize your experience."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="grid gap-3"
            >
              {options.map((opt) => (
                <motion.button
                  key={opt.value}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(opt.value)}
                  className={`rounded-xl p-4 text-sm font-medium transition-all border text-center ${
                    selected === opt.value
                      ? "border-accent bg-accent/5 shadow-soft text-foreground"
                      : "border-border bg-card hover:border-accent/30 text-foreground"
                  }`}
                >
                  {t(opt.labelKey) !== opt.labelKey ? t(opt.labelKey) : opt.fallback}
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
          disabled={!selected}
          onClick={onContinue}
        >
          {t("onboarding.continue") !== "onboarding.continue" ? t("onboarding.continue") : "Continue"}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default GenderStep;
