import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Play, Pause, RotateCcw, Heart, Share2, Compass, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ShareableCard from "@/components/app/ShareableCard";

const NARRATIVE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-narrative`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

const sectionIcons: Record<string, string> = {
  morning: "🌅",
  midday: "☀️",
  evening: "🌙",
};

const SimulatePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [narrative, setNarrative] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [needsVision, setNeedsVision] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleListen = useCallback(async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const cleanText = narrative.replace(/\*\*/g, "");
      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "TTS failed" }));
        throw new Error(err.error || "TTS failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
      audioRef.current = audio;
      await audio.play();
      setIsSpeaking(true);
    } catch (e: any) {
      toast({ title: "Audio Error", description: e.message, variant: "destructive" });
    } finally {
      setIsLoadingAudio(false);
    }
  }, [narrative, isSpeaking]);

  const generate = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setNarrative("");
    setHasGenerated(false);
    setNeedsVision(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(NARRATIVE_URL, {
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
        if (resp.status === 400 && err.error?.includes("Vision Builder")) {
          setNeedsVision(true);
          setIsGenerating(false);
          return;
        }
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
              setNarrative(full);
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

  const saveNarrative = async () => {
    if (!user || !narrative) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("future_narratives").insert({
        user_id: user.id,
        narrative,
        timeframe: "5-10 years",
      });
      if (error) throw error;
      toast({ title: "Saved!", description: "Your narrative has been saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // Parse narrative into sections
  const renderNarrative = () => {
    const sections = narrative.split(/\*\*(Morning|Midday|Evening)\*\*/gi);
    const parts: { title: string; content: string }[] = [];
    
    for (let i = 1; i < sections.length; i += 2) {
      const title = sections[i]?.trim();
      const content = sections[i + 1]?.trim();
      if (title && content) parts.push({ title, content });
    }

    if (parts.length === 0) {
      return <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{narrative}</p>;
    }

    return (
      <div className="space-y-8">
        {parts.map((part, idx) => (
          <motion.div
            key={part.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{sectionIcons[part.title.toLowerCase()] || "✦"}</span>
              <h3 className="text-lg font-bold text-foreground">{part.title}</h3>
            </div>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{part.content}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-lg mx-auto pb-24">

      {needsVision && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card shadow-card p-6 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Compass className="w-7 h-7 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2">Complete Your Vision First</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Before we can simulate your future, we need to understand your dreams.
            Complete the Vision Builder to share what matters most to you.
          </p>
          <Button variant="hero" className="w-full" size="lg" onClick={() => navigate("/onboarding")}>
            <Sparkles className="w-4 h-4" />
            Start Vision Builder
          </Button>
        </motion.div>
      )}

      {!narrative && !isGenerating && !needsVision && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card shadow-card overflow-hidden"
        >
          <div className="aspect-video gradient-hero flex items-center justify-center relative">
            <div className="absolute inset-0 bg-foreground/10" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                <Play className="w-7 h-7 text-primary-foreground ml-1" />
              </div>
              <span className="text-primary-foreground/80 text-sm font-display font-medium">
                Generate your simulation
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
            <h3 className="font-bold text-lg mb-2">A Day in Your Future Life</h3>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Based on your vision answers, we'll craft a realistic narrative of
              what an ordinary day looks like in your ideal future — morning, midday, and evening.
            </p>
            <Button variant="hero" className="w-full" size="lg" onClick={generate}>
              <Sparkles className="w-4 h-4" />
              Generate Simulation
            </Button>
          </div>
        </motion.div>
      )}

      {isGenerating && !narrative && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-card shadow-card p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Imagining your future...</p>
        </motion.div>
      )}

      {narrative && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card shadow-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-base">A Day in Your Future Life</h2>
          </div>

          {renderNarrative()}

          {hasGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border"
            >
              <Button variant="hero" className="flex-1" onClick={toggleListen} disabled={isLoadingAudio}>
                {isLoadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : isSpeaking ? <Pause className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isLoadingAudio ? "Loading..." : isSpeaking ? "Stop" : "Listen"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={saveNarrative} disabled={saving}>
                <Heart className="w-4 h-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={generate}>
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setShowShareCard(true)}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
      <ShareableCard narrative={narrative} open={showShareCard} onClose={() => setShowShareCard(false)} />
    </div>
  );
};

export default SimulatePage;
