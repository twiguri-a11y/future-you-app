import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  {
    title: "Imagine a day where everything in your life is exactly how you want it.",
    subtitle: "What does that day look like?",
    placeholder: "I wake up feeling... My day begins with...",
  },
  {
    title: "Where are you living?",
    subtitle: "Describe the place you call home.",
    placeholder: "I live in...",
  },
  {
    title: "Who is around you?",
    subtitle: "The people in your ideal life.",
    placeholder: "I am surrounded by...",
  },
  {
    title: "How do you feel every day?",
    subtitle: "Your emotional baseline.",
    placeholder: "I feel...",
  },
];

const slideVariants = {
  enter: { opacity: 0, scale: 1.02 },
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

const slideTransition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

const VisionBuilderPage = () => {
  // Split vision text into 2-3 short paragraphs for readability
  const formatVisionText = (text: string): string[] => {
    if (!text) return [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length <= 2) return [text];
    if (sentences.length <= 4) {
      const mid = Math.ceil(sentences.length / 2);
      return [
        sentences.slice(0, mid).join("").trim(),
        sentences.slice(mid).join("").trim(),
      ].filter(Boolean);
    }
    const third = Math.ceil(sentences.length / 3);
    return [
      sentences.slice(0, third).join("").trim(),
      sentences.slice(third, third * 2).join("").trim(),
      sentences.slice(third * 2).join("").trim(),
    ].filter(Boolean);
  };

  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const currentAnswer = answers[step] || "";
  const canContinue = currentAnswer.trim().length > 0;
  const totalSteps = steps.length;
  const visionParagraphs = useMemo(() => formatVisionText(summaryText), [summaryText]);

  const capitalizeFirst = (str: string) =>
    str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  const updateAnswer = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = capitalizeFirst(value);
      return next;
    });
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-vision-summary", {
        body: { answers },
      });

      if (error) throw error;
      setSummaryText(data.summary || buildFallbackSummary());
    } catch (err) {
      console.error("Vision summary generation failed:", err);
      setSummaryText(buildFallbackSummary());
    } finally {
      setIsGenerating(false);
    }
  };

  const buildFallbackSummary = () => {
    const home = answers[1]?.trim() || "somewhere that feels like home";
    const people = answers[2]?.trim().replace(/^I am surrounded by\s*/i, "") || "the people who matter most";
    const feeling = answers[3]?.trim().replace(/^I feel\s*/i, "") || "at peace";
    return `You come home to ${home}. The people around you — ${people} — make it all feel real. There's a quiet ${feeling} in everything you do.`;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowSummary(true);
      generateSummary();
    }
  };

  const handleFinish = () => {
    console.log("Vision Builder completed", answers);
    navigate("/app");
  };

  return (
    <div
      className="onboarding-root fixed inset-0 flex flex-col justify-center items-center px-4"
      style={{ zIndex: 50, minHeight: "100vh" }}
    >
      {/* Warm radial base gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: showSummary
            ? "radial-gradient(ellipse 85% 75% at 50% 45%, #E5D5C0 0%, #DCCBB2 50%, #D2BFA5 100%)"
            : "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      {/* Cinematic warm glow + vignette — only on summary */}
      {showSummary && (
        <>
          {/* Central glow — brighter focus behind text */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              background:
                "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(255,248,235,0.30) 0%, rgba(255,248,235,0.10) 45%, transparent 75%)",
            }}
          />
          {/* Vignette — darken edges */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.07) 100%)",
            }}
          />
          {/* Slow drifting warmth */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            animate={{
              background: [
                "radial-gradient(ellipse 70% 55% at 48% 44%, rgba(232,216,195,0.14) 0%, transparent 70%)",
                "radial-gradient(ellipse 75% 60% at 52% 46%, rgba(214,194,168,0.18) 0%, transparent 72%)",
                "radial-gradient(ellipse 70% 55% at 48% 44%, rgba(232,216,195,0.14) 0%, transparent 70%)",
              ],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Light grain texture */}
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          />
        </>
      )}

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        whileHover={{ opacity: 1 }}
        onClick={() => {
          if (showSummary) {
            setShowSummary(false);
            setStep(steps.length - 1);
          } else if (step > 0) {
            setStep(step - 1);
          } else {
            navigate(-1);
          }
        }}
        className="fixed top-6 left-6 z-20 flex items-center gap-1 text-xs font-body onboarding-text-secondary transition-opacity duration-200"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </motion.button>

      <div className="relative z-10 w-full max-w-[620px]">
        {/* Progress */}
        {!showSummary && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {steps.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 32 : 16,
                  background:
                    i === step
                      ? "#C48A5A"
                      : i < step
                      ? "rgba(196,138,90,0.5)"
                      : "rgba(43,42,40,0.1)",
                }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showSummary ? (
            <motion.div
              key={`step-${step}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              <div className="onboarding-card rounded-2xl p-6 md:p-8 space-y-5">
                <div className="space-y-2">
                  <h1
                    className="onboarding-text-primary font-display text-xl md:text-2xl font-semibold leading-tight"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {steps[step].title}
                  </h1>
                  <p className="onboarding-text-secondary text-sm font-body">
                    {steps[step].subtitle}
                  </p>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={(e) => updateAnswer(e.target.value)}
                  placeholder={steps[step].placeholder}
                  rows={4}
                  className="onboarding-input w-full rounded-xl text-sm font-body transition-all duration-200 outline-none resize-none"
                  style={{ padding: "14px 18px" }}
                />

                <motion.button
                  onClick={handleNext}
                  disabled={!canContinue}
                  whileHover={canContinue ? { y: -2, scale: 1.03, boxShadow: "0 6px 24px rgba(31,31,31,0.28)" } : {}}
                  whileTap={canContinue ? { scale: 0.97, boxShadow: "0 2px 8px rgba(31,31,31,0.15)" } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="onboarding-btn w-full font-display font-medium text-base rounded-full flex items-center justify-center gap-2 transition-all duration-300"
                  style={{
                    padding: "14px 32px",
                    opacity: canContinue ? 1 : 0.35,
                    cursor: canContinue ? "pointer" : "not-allowed",
                    boxShadow: canContinue ? "0 4px 16px rgba(31,31,31,0.2)" : "none",
                  }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
              style={{ paddingTop: 0 }}
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-[10px] font-body font-medium tracking-[0.25em] uppercase mb-3"
                style={{ color: "#9B8E7E" }}
              >
                Your vision
              </motion.p>

              <div
                className="w-full mx-auto"
                style={{
                  maxWidth: 640,
                  padding: "0 20px",
                  height: "auto",
                  overflow: "visible",
                }}
              >
                {isGenerating ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 py-8"
                  >
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#C48A5A" }} />
                    <p className="onboarding-text-secondary text-sm font-body italic">
                      Your future self is writing to you...
                    </p>
                  </motion.div>
                ) : (
                  <div
                    className="flex flex-col items-center w-full"
                    style={{ maxWidth: 620, margin: "0 auto" }}
                  >
                    {visionParagraphs.map((paragraph, i) => {
                      const isLast = i === visionParagraphs.length - 1;
                      return (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.25, duration: 0.5, ease: "easeOut" }}
                          className={`font-display font-medium italic text-center w-full ${
                            isLast
                              ? "onboarding-text-primary text-sm md:text-[15px]"
                              : "onboarding-text-secondary text-[13px] md:text-sm"
                          }`}
                          style={{
                            lineHeight: 1.65,
                            letterSpacing: "0.2px",
                            marginTop: i === 0 ? 0 : 12,
                          }}
                        >
                          {i === 0 ? `"${paragraph}` : isLast ? `${paragraph}"` : paragraph}
                        </motion.p>
                      );
                    })}
                  </div>
                )}
              </div>

              {!isGenerating && (
                <div className="flex flex-col items-center" style={{ marginTop: 16 }}>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="text-[11px] font-body italic"
                    style={{ color: "rgba(155,142,126,0.65)" }}
                  >
                    — You, later
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2, scale: 1.03, boxShadow: "0 8px 36px rgba(31,31,31,0.30)" }}
                    whileTap={{ scale: 0.97, boxShadow: "0 3px 12px rgba(31,31,31,0.18)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    onClick={handleFinish}
                    className="onboarding-btn font-display font-semibold text-base rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300"
                    style={{
                      marginTop: 18,
                      padding: "16px 44px",
                      boxShadow: "0 6px 30px rgba(31,31,31,0.24)",
                    }}
                  >
                    Enter my future
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisionBuilderPage;
