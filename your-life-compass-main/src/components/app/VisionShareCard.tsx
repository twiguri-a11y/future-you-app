import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  imageUrl: string | null;
  scriptLine: string;
}

function extractShortLine(script: string): string {
  const sentences = script.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return script.slice(0, 100);
  const good = sentences.find((s) => s.trim().length >= 30 && s.trim().length <= 120);
  return (good || sentences[0]).trim();
}

const VisionShareCard = ({ imageUrl, scriptLine }: Props) => {
  const [downloading, setDownloading] = useState(false);
  const shortLine = extractShortLine(scriptLine);
  const shareText = `"${shortLine}" — This is my future ✨`;
  const shareUrl = window.location.origin;

  const handleDownload = async () => {
    if (!imageUrl) return;
    setDownloading(true);
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-future-vision.png";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: "Your vision image has been saved." });
    } catch {
      toast({ title: "Error", description: "Could not download the image.", variant: "destructive" });
    }
    setDownloading(false);
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`,
      "_blank"
    );
  };

  const shareToInstagramStory = async () => {
    // Instagram doesn't have a direct web share API for stories
    // Use native share if available, otherwise guide user
    if (navigator.share && imageUrl) {
      try {
        const resp = await fetch(imageUrl);
        const blob = await resp.blob();
        const file = new File([blob], "my-future-vision.png", { type: "image/png" });
        await navigator.share({
          title: "This is my future",
          text: shareText,
          files: [file],
        });
      } catch {
        // Fallback: copy text
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Ready to share!",
          description: "Text copied — open Instagram and paste it in your Story.",
        });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Ready to share!",
        description: "Text copied — download the image and share it on Instagram.",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        if (imageUrl) {
          const resp = await fetch(imageUrl);
          const blob = await resp.blob();
          const file = new File([blob], "my-future-vision.png", { type: "image/png" });
          await navigator.share({ title: "This is my future", text: shareText, files: [file] });
        } else {
          await navigator.share({ title: "This is my future", text: shareText, url: shareUrl });
        }
      } catch { /* user cancelled */ }
    } else {
      shareToWhatsApp();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.0, duration: 0.7 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1">
          Share your vision
        </p>
        <h3 className="text-lg font-bold text-foreground">This is my future</h3>
      </div>

      {/* Preview card with subtle overlay */}
      {imageUrl && (
        <div className="relative rounded-2xl overflow-hidden shadow-elevated">
          <img src={imageUrl} alt="My future vision" className="w-full aspect-[16/10] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-primary-foreground/90 text-sm italic leading-relaxed line-clamp-2">
              "{shortLine}"
            </p>
          </div>
        </div>
      )}

      {/* Share buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={shareToWhatsApp}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={shareToInstagramStory}
        >
          <Share2 className="w-4 h-4" />
          Story
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleDownload}
          disabled={!imageUrl || downloading}
        >
          <Download className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Native share fallback */}
      <Button
        variant="hero"
        className="w-full gap-2"
        onClick={handleNativeShare}
      >
        <Share2 className="w-4 h-4" />
        Share my future
      </Button>
    </motion.div>
  );
};

export default VisionShareCard;
