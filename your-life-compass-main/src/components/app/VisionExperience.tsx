import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, Pause, RotateCcw, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Experience {
  id: string;
  script: string;
  image_url: string | null;
  answers: Record<string, string>;
}

interface Props {
  experience: Experience;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const VisionExperience = ({ experience, onRegenerate, isRegenerating }: Props) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [saved, setSaved] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const toggleSpeak = useCallback(() => {
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(experience.script);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Try to pick a warm voice
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Karen"));
    if (preferred) utterance.voice = preferred;

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, experience.script]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="space-y-6"
    >
      {/* Vision Image — cinematic reveal */}
      {experience.image_url && (
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden shadow-elevated bg-muted"
        >
          <img
            src={experience.image_url}
            alt="Your future vision"
            className="w-full aspect-[16/10] object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </motion.div>
      )}

      {/* Progression feel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="text-center"
      >
        <p className="text-xs text-muted-foreground/60 italic">
          You showed up today. You're staying aligned.
        </p>
      </motion.div>

      {/* Script */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.7 }}
        className="rounded-2xl bg-card shadow-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Your Future Self Speaks
          </span>
        </div>

        <p className="text-foreground/90 leading-relaxed text-[15px] italic">
          "{experience.script}"
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="flex flex-wrap gap-3"
      >
        <Button variant="hero" className="flex-1" onClick={toggleSpeak}>
          {isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isSpeaking ? "Stop" : "Listen"}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSaved(true)}
          disabled={saved}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-current text-destructive" : ""}`} />
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          <RotateCcw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default VisionExperience;
