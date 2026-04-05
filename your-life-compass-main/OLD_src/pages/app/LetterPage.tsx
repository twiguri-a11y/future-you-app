import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Sparkles, RotateCcw, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import LetterCard from "@/components/app/LetterCard";

const LETTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-letter`;

const LetterPage = () => {
  const { user } = useAuth();
  const [letter, setLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const generate = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setLetter("");
    setHasGenerated(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(LETTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({}),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        toast({ title: "Error", description: err.error, variant: "destructive" });
        setIsGenerating(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setLetter(full);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setHasGenerated(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  const lines = letter.split("\n").filter(Boolean);
  const greeting = lines[0] || "";
  const body = lines.slice(1, -2).join("\n");
  const signoff = lines.slice(-2).join("\n");

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">

      {/* Empty state */}
      {!letter && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card shadow-card overflow-hidden"
        >
          <div
            className="aspect-[16/9] flex items-center justify-center relative"
            style={{
              background: "linear-gradient(160deg, hsl(216 56% 98%) 0%, hsl(249 82% 92%) 50%, hsl(170 62% 88%) 100%)",
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-secondary/20 backdrop-blur flex items-center justify-center">
                <Mail className="w-7 h-7 text-secondary" />
              </div>
              <span className="text-foreground/60 text-sm font-display font-medium">
                You have a letter waiting
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-secondary uppercase tracking-wide">
                AI-Powered
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2">A Message Across Time</h3>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Your future self has written you a heartfelt letter — filled with
              specific details from the life you're building. Open it when you're ready.
            </p>
            <Button variant="hero" className="w-full" size="lg" onClick={generate}>
              <Mail className="w-4 h-4" />
              Open the Letter
            </Button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isGenerating && !letter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-card shadow-card p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Your future self is writing...</p>
        </motion.div>
      )}

      {/* Letter display */}
      {letter && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-card"
          style={{
            background: "linear-gradient(160deg, hsl(216 56% 98%) 0%, hsl(249 82% 96%) 40%, hsl(170 62% 92%) 100%)",
          }}
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full" style={{ background: "var(--gradient-hero)" }} />

          <div className="px-6 pt-7 pb-8">
            {/* Header */}
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

            {/* Body — stream-friendly */}
            <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap space-y-3">
              {body
                ? body.split("\n").map((p, i) => <p key={i}>{p}</p>)
                : <p>{letter}</p>
              }
            </div>

            {/* Sign-off */}
            {signoff && hasGenerated && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-sm text-foreground/70 italic whitespace-pre-wrap font-display"
              >
                {signoff}
              </motion.p>
            )}

            {/* Flourish */}
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-accent/30" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
              <div className="h-px flex-1 bg-accent/30" />
            </div>
          </div>

          {/* Actions */}
          {hasGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-6 pb-6 flex gap-3"
            >
              <Button variant="hero" className="flex-1" onClick={() => setShowShareCard(true)}>
                <Share2 className="w-4 h-4" />
                Share as Image
              </Button>
              <Button variant="outline" className="flex-1" onClick={generate}>
                <RotateCcw className="w-4 h-4" />
                New Letter
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}

      <LetterCard letter={letter} open={showShareCard} onClose={() => setShowShareCard(false)} />
    </div>
  );
};

export default LetterPage;
