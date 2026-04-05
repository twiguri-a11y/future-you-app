import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Link2, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const ReferralCard = ({ delay = 0 }: { delay?: number }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.id?.slice(0, 8) || "futureyou";
  const referralUrl = `${window.location.origin}?ref=${referralCode}`;
  const shareText = "I've been using Future You to design the life I actually want. You might like it too.";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({ title: "Link copied", description: "Share it with someone who might benefit." });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Couldn't copy", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Future You", text: shareText, url: referralUrl });
      } catch { /* cancelled */ }
    } else {
      copyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-card shadow-card p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center">
          <Users className="w-4 h-4 text-secondary" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">Invite someone to join you</h3>
          <p className="text-xs text-muted-foreground">Both of you get 7 days of premium access</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Growth feels different when shared. Invite someone you care about.
      </p>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={copyLink}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </Button>
        <Button variant="hero" size="sm" className="flex-1 gap-1.5" onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </motion.div>
  );
};

export default ReferralCard;
