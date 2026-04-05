import { useRef } from "react";
import { motion } from "framer-motion";
import { Share2, Twitter, Facebook, Link2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface LetterCardProps {
  letter: string;
  open: boolean;
  onClose: () => void;
}

const LetterCard = ({ letter, open, onClose }: LetterCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const lines = letter.split("\n").filter(Boolean);
  const greeting = lines[0] || "";
  const body = lines.slice(1, -2).join("\n");
  const signoff = lines.slice(-2).join("\n");
  const shortQuote = lines.find((l) => l.length > 30 && l.length < 160 && !l.startsWith("Dear"))
    || lines[1] || letter.slice(0, 140);

  const shareText = `"${shortQuote.trim()}" — A letter from my Future Self ✨`;
  const shareUrl = window.location.origin;

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "letter-from-future-self.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Downloaded!", description: "Your letter has been saved as an image." });
    } catch {
      toast({ title: "Error", description: "Could not generate image.", variant: "destructive" });
    }
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast({ title: "Copied!", description: "Quote copied to clipboard." });
    } catch {
      toast({ title: "Error", description: "Could not copy.", variant: "destructive" });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Letter From My Future Self", text: shareText, url: shareUrl });
      } catch { /* cancelled */ }
    } else {
      copyToClipboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The visual letter card for screenshot */}
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden shadow-elevated"
          style={{
            background: "linear-gradient(160deg, hsl(216 56% 98%) 0%, hsl(249 82% 96%) 40%, hsl(170 62% 92%) 100%)",
          }}
        >
          {/* Decorative top accent */}
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-hero)" }} />

          <div className="px-7 pt-8 pb-10">
            {/* Header flourish */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px flex-1 bg-secondary/20" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-secondary/60 font-semibold">
                A Letter From Your Future Self
              </span>
              <div className="h-px flex-1 bg-secondary/20" />
            </div>

            {/* Greeting */}
            <p className="text-lg font-display font-bold text-foreground mb-4 italic">
              {greeting}
            </p>

            {/* Body */}
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-serif space-y-3">
              {body.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Sign-off */}
            <p className="mt-6 text-sm text-foreground/70 italic whitespace-pre-wrap font-display">
              {signoff}
            </p>

            {/* Bottom flourish */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/30" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
              <div className="h-px flex-1 bg-accent/30" />
            </div>
          </div>
        </div>

        {/* Share actions */}
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Share your letter</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={downloadAsImage}>
              <Download className="w-4 h-4" />
              Image
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={shareToTwitter}>
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={shareToFacebook}>
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button variant="hero" size="icon" onClick={shareNative} className="shrink-0">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-2 text-muted-foreground" onClick={onClose}>
            <X className="w-3 h-3" />
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LetterCard;
