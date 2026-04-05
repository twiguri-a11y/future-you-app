import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  ONBOARDING_KEY,
  ONBOARDING_COMPLETE_KEY,
  saveOnboarding,
  onboardingHash,
  type OnboardingData,
} from "@/pages/OnboardingPage";

const identityOptions = [
  "Confident & grounded",
  "Disciplined & consistent",
  "Calm & in control",
  "Focused & productive",
  "Healthy & energized",
  "Financially free",
  "Purpose-driven",
  "Becoming my best self",
];

const priorities = ["Health", "Wealth", "Relationships", "Purpose"];

const emotions = [
  "Peaceful",
  "Energized",
  "Inspired",
  "Grateful",
  "Confident",
  "Joyful",
];

interface FormState {
  selectedIdentities: string[];
  customIdentity: string;
  priority: string | null;
  environment: string;
  people: string;
  emotion: string | null;
}

const OnboardingV2Page = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    selectedIdentities: [],
    customIdentity: "",
    priority: null,
    environment: "",
    people: "",
    emotion: null,
  });

  const toggleIdentity = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedIdentities: prev.selectedIdentities.includes(id)
        ? prev.selectedIdentities.filter((i) => i !== id)
        : prev.selectedIdentities.length < 3
        ? [...prev.selectedIdentities, id]
        : prev.selectedIdentities,
    }));
  };

  const visionSummary = [
    ...form.selectedIdentities,
    ...(form.customIdentity.trim() ? [form.customIdentity.trim()] : []),
  ].join(", ");

  const canSubmit =
    (form.selectedIdentities.length >= 1 ||
      form.customIdentity.trim().length > 0) &&
    form.priority !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const data: OnboardingData = {
      selectedIdentities: form.selectedIdentities,
      customIdentity: form.customIdentity,
      priority: form.priority,
      environment: form.environment,
      people: form.people,
      emotion: form.emotion,
    };

    saveOnboarding(data);
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    localStorage.setItem("fy_onboarding_hash", onboardingHash(data));
    navigate("/vision-moment", { state: { visionSummary } });
  };

  return (
    <div
      className="onboarding-root fixed inset-0 overflow-y-auto"
      style={{ zIndex: 50 }}
    >
      <div className="min-h-full flex items-start justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-[640px] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div
              className="mx-auto w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(196,138,90,0.15)" }}
            >
              <Sparkles className="w-5 h-5" style={{ color: "#C48A5A" }} />
            </div>
            <h1
              className="onboarding-text-primary font-display text-2xl md:text-3xl font-semibold"
              style={{ letterSpacing: "-0.01em" }}
            >
              You're stepping into a new version of yourself
            </h1>
            <p className="onboarding-text-secondary text-sm font-body">
              Answer a few questions so we can personalize your journey
            </p>
          </div>

          {/* Section 1: Identity */}
          <Section title="Who are you becoming?" subtitle="Choose up to 3">
            <div className="grid grid-cols-2 gap-1.5">
              {identityOptions.map((id, i) => {
                const isSelected = form.selectedIdentities.includes(id);
                return (
                  <motion.button
                    key={id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleIdentity(id)}
                    className={`rounded-xl px-3 py-2 text-sm font-body font-medium transition-all duration-200 text-center ${
                      isSelected
                        ? "onboarding-chip-selected"
                        : "onboarding-chip"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                          }}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </motion.span>
                      )}
                      {id}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <input
              value={form.customIdentity}
              onChange={(e) =>
                setForm((p) => ({ ...p, customIdentity: e.target.value }))
              }
              placeholder="Or add your own…"
              className="onboarding-input w-full rounded-xl text-sm font-body transition-all duration-200 outline-none mt-2"
              style={{ padding: "10px 16px" }}
            />
          </Section>

          {/* Section 2: Priority */}
          <Section
            title="What matters most right now?"
            subtitle="Pick your current focus"
          >
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      priority: prev.priority === p ? null : p,
                    }))
                  }
                  className={`rounded-xl px-3 py-2.5 text-sm font-body font-medium transition-all duration-200 text-center ${
                    form.priority === p
                      ? "onboarding-chip-selected"
                      : "onboarding-chip"
                  }`}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </Section>

          {/* Section 3: Environment */}
          <Section
            title="Your environment"
            subtitle="Where do you spend most of your time?"
          >
            <input
              value={form.environment}
              onChange={(e) =>
                setForm((p) => ({ ...p, environment: e.target.value }))
              }
              placeholder="e.g. Home office, city apartment, co-working space…"
              className="onboarding-input w-full rounded-xl text-sm font-body transition-all duration-200 outline-none"
              style={{ padding: "10px 16px" }}
            />
          </Section>

          {/* Section 4: People */}
          <Section
            title="Who is around you?"
            subtitle="Who's part of your daily life?"
          >
            <input
              value={form.people}
              onChange={(e) =>
                setForm((p) => ({ ...p, people: e.target.value }))
              }
              placeholder="e.g. Partner, kids, roommates, solo…"
              className="onboarding-input w-full rounded-xl text-sm font-body transition-all duration-200 outline-none"
              style={{ padding: "10px 16px" }}
            />
          </Section>

          {/* Section 5: Emotion */}
          <Section title="How do you want to feel daily?" subtitle="Pick one">
            <div className="grid grid-cols-3 gap-1.5">
              {emotions.map((e) => (
                <motion.button
                  key={e}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      emotion: prev.emotion === e ? null : e,
                    }))
                  }
                  className={`rounded-xl px-3 py-2 text-sm font-body font-medium transition-all duration-200 text-center ${
                    form.emotion === e
                      ? "onboarding-chip-selected"
                      : "onboarding-chip"
                  }`}
                >
                  {e}
                </motion.button>
              ))}
            </div>
          </Section>

          {/* Submit */}
          <motion.button
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileHover={canSubmit ? { y: -2, scale: 1.02 } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
            className="onboarding-btn w-full font-display font-medium text-base rounded-full flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              padding: "16px 32px",
              opacity: canSubmit ? 1 : 0.35,
              cursor: canSubmit ? "pointer" : "not-allowed",
              boxShadow: canSubmit
                ? "0 4px 16px rgba(31,31,31,0.2)"
                : "none",
            }}
          >
            Create my future
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="onboarding-card rounded-2xl p-5 space-y-3">
      <div>
        <h2
          className="onboarding-text-primary font-display text-base md:text-lg font-semibold"
          style={{ letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="onboarding-text-secondary text-xs font-body mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export default OnboardingV2Page;
