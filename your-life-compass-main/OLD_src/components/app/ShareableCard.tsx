import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Twitter, Facebook, Link2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import shareCardBg from "@/assets/share-card-bg.jpg";

interface ShareableCardProps {
  narrative: string;
  open: boolean;
  onClose: () => void;
}

function extractQuote(narrative: string): string {
  // Grab the first meaningful sentence (skip markdown headers)
  const cleaned = narrative.replace(/\*\*[^*]+\*\*/g, "").trim();
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return cleaned.slice(0, 140);
  // Pick a sentence between 40-160 chars
  const good = sentences.find((s) => s.trim().length >= 40 && s.trim().length <= 160);
  return (good || sentences[0]).trim();
}

const ShareableCard = ({ narrative, open, onClose }: ShareableCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const quote = extractQuote(narrative);

  if (!open) return null;

  const shareText = `"${quote}" — My Future Self Vision ✨`;
  const shareUrl = window.location.origin;

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
      setCopied(true);
      toast({ title: "Copied!", description: "Quote copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Future Life", text: shareText, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual Card */}
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden shadow-elevated aspect-[1200/630]"
        >
          <img
            src={shareCardBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">
                Future Self Vision
              </span>
            </div>

            <div>
              <p className="text-primary-foreground text-base md:text-lg font-display leading-relaxed italic">
                "{quote}"
              </p>
              <div className="mt-4 h-px w-12 bg-accent" />
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Share your vision</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={shareToTwitter}>
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={shareToFacebook}>
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={copyToClipboard}>
              <Link2 className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
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

export default ShareableCard;
