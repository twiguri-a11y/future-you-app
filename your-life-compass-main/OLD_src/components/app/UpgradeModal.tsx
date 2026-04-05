import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, Brain, Mic, BarChart3, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePremium } from "@/contexts/PremiumContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const TRIGGER_HEADLINES: Record<string, { headline: string; subtext: string }> = {
  limit: {
    headline: "Want more space to grow?",
    subtext: "Unlock unlimited tasks and keep your momentum going.",
  },
  momentum: {
    headline: "You're building something real.",
    subtext: "Unlock more flexibility to match your progress.",
  },
  insights: {
    headline: "See deeper patterns.",
    subtext: "Get weekly insights with deeper analysis of your growth.",
  },
  general: {
    headline: "Go deeper with your growth.",
    subtext: "More clarity. More flexibility. More progress.",
  },
};

const FEATURES = [
  { icon: TrendingUp, label: "Unlimited daily tasks" },
  { icon: Sparkles, label: "Multiple visions & hero images" },
  { icon: Brain, label: "Advanced AI personalization" },
  { icon: BarChart3, label: "Weekly insights & life balance" },
  { icon: Mic, label: "Enhanced voice input" },
  { icon: Crown, label: "Priority support" },
];

const UpgradeModal = () => {
  const { showUpgradeModal, closeUpgrade, upgradeTrigger, setPremium } = usePremium();
  const { t } = useLanguage();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");

  const content = TRIGGER_HEADLINES[upgradeTrigger] || TRIGGER_HEADLINES.general;

  const handleUpgrade = () => {
    // UI-only: simulate premium activation
    setPremium(true);
    closeUpgrade();
  };

  return (
    <AnimatePresence>
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeUpgrade()}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative gradient-hero p-6 pb-8 text-center">
              <button
                onClick={closeUpgrade}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-primary-foreground">{content.headline}</h2>
              <p className="text-sm text-primary-foreground/80 mt-1">{content.subtext}</p>
            </div>

            <div className="p-6">
              {/* Plan toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setPlan("monthly")}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                    plan === "monthly"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-lg font-bold text-foreground">$10</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </button>
                <button
                  onClick={() => setPlan("yearly")}
                  className={`flex-1 p-3 rounded-xl border text-center transition-all relative ${
                    plan === "yearly"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    SAVE 40%
                  </div>
                  <p className="text-lg font-bold text-foreground">$6</p>
                  <p className="text-xs text-muted-foreground">/month, billed yearly</p>
                </button>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                      <f.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-sm text-foreground">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleUpgrade}
              >
                Continue Becoming — {plan === "yearly" ? "$72/year" : "$10/mo"}
              </Button>
              <button
                onClick={closeUpgrade}
                className="w-full text-center text-sm text-muted-foreground/60 hover:text-muted-foreground mt-3 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
