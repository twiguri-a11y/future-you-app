import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Share2, Link2, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Emotional quotes — no personal data, no names
const QUOTE_POOL = [
  "You're closer than you think.",
  "You already know what matters.",
  "I'm becoming someone more aligned.",
  "This is starting to feel clear.",
  "Something just shifted.",
  "The version of me I want to be — already exists.",
  "Clarity isn't found. It's remembered.",
  "I stopped waiting. That was the first step.",
  "This feeling is real.",
  "I'm not imagining this — I'm recognizing it.",
];

type Mood = "calm" | "reflective" | "hopeful";

const MOOD_GRADIENTS: Record<Mood, string> = {
  calm: "from-[hsl(175,40%,35%)] to-[hsl(200,50%,40%)]",
  reflective: "from-[hsl(225,40%,15%)] to-[hsl(240,30%,25%)]",
  hopeful: "from-[hsl(35,60%,45%)] to-[hsl(25,70%,55%)]",
};

function pickQuotes(count: number): { text: string; mood: Mood }[] {
  const moods: Mood[] = ["calm", "reflective", "hopeful"];
  const shuffled = [...QUOTE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((text, i) => ({
    text,
    mood: moods[i % moods.length],
  }));
}

interface MomentShareCardProps {
  /** When to show — controls fade-in delay */
  delay?: number;
}

const ShareCardPreview = ({
  quote,
  mood,
  active,
}: {
  quote: string;
  mood: Mood;
  active: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.95 }}
    transition={{ duration: 0.4 }}
    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${MOOD_GRADIENTS[mood]} flex flex-col justify-between p-8 overflow-hidden`}
  >
    {/* Slow zoom animation */}
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
    />

    <div className="relative z-10 flex-1 flex items-center justify-center">
      <p className="text-white/90 text-xl md:text-2xl font-light text-center leading-relaxed max-w-[280px] tracking-wide">
        "{quote}"
      </p>
    </div>

    <p className="relative z-10 text-white/30 text-[10px] font-medium tracking-[0.25em] uppercase text-center">
      Future You
    </p>
  </motion.div>
);

const MomentShareCard = ({ delay = 1.5 }: MomentShareCardProps) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cards] = useState(() => pickQuotes(3));

  const shareUrl = window.location.origin;
  const activeCard = cards[activeIndex];
  const shareText = `"${activeCard.text}" — Future You ✨`;

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + "\n\nTry it → " + shareUrl)}`,
      "_blank"
    );
  };

  const shareToInstagram = async () => {
    // Instagram has no direct web share — use native share or copy
    if (navigator.share) {
      try {
        await navigator.share({ title: "Future You", text: shareText, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied!", description: "Paste it in your Instagram Story." });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Future You", text: shareText, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied to clipboard" });
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareText + "\n\nTry it → " + shareUrl);
    toast({ title: "Copied!" });
  };

  // Trigger text — subtle, below content
  if (!open) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration: 0.8 }}
        className="text-center"
      >
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-300"
        >
          Save or share this moment
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card preview — square */}
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-elevated mb-4">
          {cards.map((card, i) => (
            <ShareCardPreview
              key={i}
              quote={card.text}
              mood={card.mood}
              active={i === activeIndex}
            />
          ))}
        </div>

        {/* Dots + navigation */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setActiveIndex((p) => Math.max(0, p - 1))}
            disabled={activeIndex === 0}
            className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-foreground scale-110"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setActiveIndex((p) => Math.min(cards.length - 1, p + 1))}
            disabled={activeIndex === cards.length - 1}
            className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Share actions */}
        <div className="rounded-2xl bg-card p-4 shadow-card">
          <div className="flex gap-2 mb-3">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={shareToWhatsApp}>
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={shareToInstagram}>
              <Share2 className="w-3.5 h-3.5" />
              Story
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={copyLink}>
              <Link2 className="w-3.5 h-3.5" />
              Copy
            </Button>
          </div>

          <Button
            variant="hero"
            size="sm"
            className="w-full gap-2"
            onClick={handleNativeShare}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share this moment
          </Button>

          <button
            onClick={() => setOpen(false)}
            className="w-full mt-3 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors text-center"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MomentShareCard;
