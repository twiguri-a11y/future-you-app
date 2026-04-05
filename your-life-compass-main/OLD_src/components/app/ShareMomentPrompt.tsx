import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ShareMomentPromptProps {
  /** e.g. "streak" | "reflection" | "alignment" */
  type: "streak" | "reflection" | "alignment";
  streak?: number;
  delay?: number;
}

const MOMENT_COPY: Record<string, { text: string; shareText: string }> = {
  streak: {
    text: "Share your progress",
    shareText: "I've been showing up every day. Something is shifting. ✨ — Future You",
  },
  reflection: {
    text: "Reflect on your week",
    shareText: "I just paused to reflect on my week. Clarity comes from stillness. — Future You",
  },
  alignment: {
    text: "Share how aligned you feel",
    shareText: "Living with intention, one day at a time. — Future You",
  },
};

const ShareMomentPrompt = ({ type, streak, delay = 0 }: ShareMomentPromptProps) => {
  const copy = MOMENT_COPY[type] || MOMENT_COPY.streak;
  const shareUrl = window.location.origin;

  const shareTextWithStreak =
    type === "streak" && streak
      ? `${streak}-day streak. ${copy.shareText}`
      : copy.shareText;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Future You",
          text: shareTextWithStreak,
          url: shareUrl,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareTextWithStreak + "\n\nTry it → " + shareUrl);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-300"
      >
        <Share2 className="w-3.5 h-3.5" />
        {copy.text}
      </button>
    </motion.div>
  );
};

export default ShareMomentPrompt;
