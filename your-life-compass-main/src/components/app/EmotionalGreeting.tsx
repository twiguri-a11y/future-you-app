import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const ENTRY_LINES = [
  "You're closer than you think — don't disconnect now.",
  "Something in you already knows the way forward.",
  "The gap between now and your future is smaller than it feels.",
  "This might feel familiar — like remembering something you haven't lived yet.",
  "You may already sense this... today matters more than you think.",
];

const RETURN_LINES = [
  "Your future self has been holding space for you.",
  "You stepped away, and that's okay. What matters is you're here now.",
  "Still becoming. Still aligned. Still you.",
];

interface EmotionalGreetingProps {
  userId: string | undefined;
  isReturning?: boolean;
}

const EmotionalGreeting = ({ userId, isReturning }: EmotionalGreetingProps) => {
  const [line, setLine] = useState("");
  const [visionImage, setVisionImage] = useState<string | null>(null);
  const [futureMessage, setFutureMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const pool = isReturning ? RETURN_LINES : ENTRY_LINES;
    setLine(pool[Math.floor(Math.random() * pool.length)]);
  }, [isReturning]);

  // Fetch latest vision image and script for recall
  useEffect(() => {
    if (!userId) return;
    const fetchVision = async () => {
      const { data } = await supabase
        .from("vision_experiences")
        .select("image_url, script")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data?.[0]) {
        if (data[0].image_url) setVisionImage(data[0].image_url);
        if (data[0].script) {
          // Extract first sentence as a short recall message
          const firstSentence = data[0].script.split(/[.!?]/)[0]?.trim();
          if (firstSentence) setFutureMessage(firstSentence + ".");
        }
      }
    };
    fetchVision();
  }, [userId]);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-4"
        >
          {/* Vision recall — always show if available */}
          {visionImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="rounded-2xl overflow-hidden mb-3 shadow-card relative"
            >
              <img
                src={visionImage}
                alt="Your future vision"
                className="w-full aspect-[16/9] object-cover opacity-85"
              />
              {futureMessage && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white/90 text-xs italic leading-relaxed">
                    "{futureMessage}"
                  </p>
                </div>
              )}
            </motion.div>
          )}
          <p className="text-sm text-muted-foreground/80 italic text-center leading-relaxed">
            {line}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmotionalGreeting;
