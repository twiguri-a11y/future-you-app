import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FALLBACK_MESSAGES = [
  "The quiet before the day begins — that's where you find yourself now. Not rushing, not waiting. Just here.",
  "There's a stillness in the way you move today. Not slow — deliberate. You're choosing what matters.",
  "You notice the weight has shifted. Not gone, but lighter. Something in you has changed without announcement.",
  "The morning light hits differently when you're not chasing anything. You're building, steadily, from the inside.",
];

const DailyExperiencePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");

  const fetchMessage = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-daily-experience");
      if (error) throw error;
      setMessage(data.message || getFallback());
    } catch (err) {
      console.error("Daily experience fetch failed:", err);
      setMessage(getFallback());
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getFallback = () => {
    const day = new Date().getDate();
    return FALLBACK_MESSAGES[day % FALLBACK_MESSAGES.length];
  };

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  // Split message into 3 cinematic blocks:
  // 1. Sensory scene (first ~half of sentences)
  // 2. Past reflection (middle sentences)
  // 3. Final bold sentence (core truth)
  const formatBlocks = (text: string): string[] => {
    if (!text) return [];
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).map((s) => s.trim()).filter(Boolean);
    if (sentences.length <= 1) return [text];
    if (sentences.length === 2) return [sentences[0], sentences[1]];
    // Split: sensory scene | past reflection | final truth
    const last = sentences[sentences.length - 1];
    const mid = Math.ceil((sentences.length - 1) / 2);
    const block1 = sentences.slice(0, mid).join(" ");
    const block2 = sentences.slice(mid, -1).join(" ");
    return [block1, block2, last];
  };

  const blocks = formatBlocks(message);

  // Total text animation duration for sequencing the UI controls
  const textAnimDone = blocks.length <= 1 ? 0.6 : 0.9 + 0.6; // last block delay (0.9s) + duration (0.6s) = 1.5s

  const handleContinue = () => {
    navigate("/app/daily");
  };

  return (
    <div
      className="onboarding-root fixed inset-0 overflow-y-auto"
      style={{ zIndex: 50 }}
    >
      {/* Warm radial base */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 45%, #E5D5C0 0%, #DCCBB2 50%, #D2BFA5 100%)",
        }}
      />

      {/* Central glow */}
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

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.07) 100%)",
        }}
      />

      {/* Drifting warmth */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse 70% 55% at 48% 44%, rgba(232,216,195,0.14) 0%, transparent 70%)",
            "radial-gradient(ellipse 75% 60% at 52% 46%, rgba(214,194,168,0.18) 0%, transparent 72%)",
            "radial-gradient(ellipse 70% 55% at 48% 44%, rgba(232,216,195,0.14) 0%, transparent 70%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Back to app */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
        onClick={() => navigate("/app")}
        className="fixed top-6 left-6 z-20 text-xs font-body transition-opacity duration-200"
        style={{ color: "#6B645C" }}
      >
        ← Back
      </motion.button>

      {/* Single centered content container */}
      <div
        className="relative z-10 flex flex-col items-center min-h-screen px-6"
        style={{ paddingTop: 56, paddingBottom: 56 }}
      >
        {/* Spacer to vertically center content */}
        <div className="flex-1" />

        <div className="w-full flex flex-col items-center text-center" style={{ maxWidth: 640 }}>
          {/* Title label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-[10px] font-body font-medium tracking-[0.25em] uppercase mb-5"
            style={{ color: "#9B8E7E" }}
          >
            Today, you notice...
          </motion.p>

          {/* Message */}
          <div className="w-full" style={{ maxWidth: 540 }}>
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#C48A5A" }} />
                <p className="text-sm font-body italic" style={{ color: "#6B645C" }}>
                  Your future self is reflecting...
                </p>
              </motion.div>
            ) : (
              <div key={message} className="flex flex-col items-center">
                {blocks.map((block, i) => {
                  const isLast = i === blocks.length - 1 && blocks.length > 1;
                  const isFirst = i === 0;
                  const delay = i === 0 ? 0 : i === 1 ? 0.4 : 0.9;
                  return (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, scale: isLast ? 0.98 : 1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay, duration: 0.6, ease: "easeOut" }}
                      className="font-display font-medium italic text-center w-full mx-auto"
                      style={{
                        color: isLast ? "#1A1917" : "#4A443C",
                        fontSize: isLast ? "20px" : "15px",
                        lineHeight: 2.0,
                        letterSpacing: "0.12px",
                        marginTop: isFirst ? 0 : isLast ? 40 : 20,
                        fontWeight: isLast ? 600 : 500,
                        maxWidth: isLast ? 480 : 520,
                      }}
                    >
                      {isFirst ? `"${block}` : isLast ? `${block}"` : block}
                    </motion.p>
                  );
                })}

                {/* Attribution */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: textAnimDone + 0.1, duration: 0.6 }}
                  className="font-body italic mt-4"
                  style={{ color: "rgba(155,142,126,0.35)", fontSize: "9px", letterSpacing: "0.3px" }}
                >
                  — You, later
                </motion.p>
              </div>
            )}
          </div>

          {/* Bottom section: input + button */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: textAnimDone + 0.4, duration: 0.6, ease: "easeOut" }}
              className="w-full flex flex-col items-center mt-10"
              style={{ maxWidth: 400 }}
            >
              <p
                className="text-xs font-body font-medium mb-2.5 text-center"
                style={{ color: "#9B8E7E" }}
              >
                What felt aligned today?
              </p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="A small moment, a feeling, a choice..."
                rows={2}
                className="onboarding-input w-full rounded-xl text-sm font-body transition-all duration-200 outline-none resize-none"
                style={{ padding: "12px 16px" }}
              />

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{
                  y: -2,
                  scale: 1.03,
                  boxShadow: "0 8px 36px rgba(31,31,31,0.30)",
                }}
                whileTap={{
                  scale: 0.97,
                  boxShadow: "0 3px 12px rgba(31,31,31,0.18)",
                  transition: { duration: 0.1 },
                }}
                transition={{ delay: textAnimDone + 0.6, duration: 0.6, ease: "easeOut" }}
                onClick={handleContinue}
                className="onboarding-btn font-display font-semibold text-sm rounded-full inline-flex items-center justify-center gap-2 mt-7"
                style={{
                  padding: "14px 40px",
                  boxShadow: "0 6px 30px rgba(31,31,31,0.24)",
                }}
              >
                Continue your path
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Spacer to vertically center content */}
        <div className="flex-1" />
      </div>
    </div>
  );
};

export default DailyExperiencePage;
