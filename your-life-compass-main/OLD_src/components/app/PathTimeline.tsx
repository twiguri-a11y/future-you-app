import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin, Sparkles, Compass, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const TIMELINE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-timeline`;

interface TimelineMilestone {
  title: string;
  milestone: string;
}

interface TimelineData {
  year1: TimelineMilestone;
  year3: TimelineMilestone;
  year5: TimelineMilestone;
  year10: TimelineMilestone;
}

const yearKeys: (keyof TimelineData)[] = ["year1", "year3", "year5", "year10"];

const PathTimeline = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [needsVision, setNeedsVision] = useState(false);

  const generate = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setNeedsVision(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(TIMELINE_URL, {
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

      const data = await resp.json();
      setTimeline(data.timeline);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  if (needsVision) {
    return (
      <div className="px-6">
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
            We need your vision answers to map your path ahead.
          </p>
          <Button variant="hero" className="w-full" size="lg" onClick={() => navigate("/onboarding")}>
            <Sparkles className="w-4 h-4" />
            Start Vision Builder
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!timeline && !isGenerating) {
    return (
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card shadow-card p-6 text-center"
        >
          <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-primary-foreground" />
          </div>
          <h3 className="font-bold text-lg mb-2">See Your Path Ahead</h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            A personalized timeline of where you're heading — grounded in your values and vision.
          </p>
          <Button variant="hero" className="w-full" size="lg" onClick={generate}>
            <Sparkles className="w-4 h-4" />
            Generate My Timeline
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-card shadow-card p-8 text-center"
        >
          <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Mapping your path ahead...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6">
      <p className="text-xs text-muted-foreground mb-6 italic">
        This is one possible path based on what matters to you.
      </p>

      {/* Vertical timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-6">
          {yearKeys.map((key, idx) => {
            const item = timeline![key];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12 }}
                className="relative pl-10"
              >
                {/* Dot on timeline */}
                <div className="absolute left-[9px] top-1 w-[13px] h-[13px] rounded-full border-2 border-primary bg-card" />

                {/* Card */}
                <div className="rounded-xl bg-card shadow-card p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {item.title}
                  </span>
                  <p className="text-sm text-foreground/85 leading-relaxed mt-1.5">
                    {item.milestone}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Regenerate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Button variant="outline" className="w-full" onClick={generate} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Regenerate Timeline
        </Button>
      </motion.div>
    </div>
  );
};

export default PathTimeline;
