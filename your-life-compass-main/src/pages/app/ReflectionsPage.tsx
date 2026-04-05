import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import MomentShareCard from "@/components/app/MomentShareCard";

const prompts = [
  "What's one thing you learned about yourself this week?",
  "What felt most aligned with your vision today?",
  "What's something small you're grateful for right now?",
  "Where did you notice resistance, and what was it protecting?",
  "What would your future self say about how you handled today?",
];

const ReflectionsPage = () => {
  const { user } = useAuth();
  const [response, setResponse] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(
    () => prompts[Math.floor(Math.random() * prompts.length)]
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const shufflePrompt = () => {
    let next: string;
    do {
      next = prompts[Math.floor(Math.random() * prompts.length)];
    } while (next === currentPrompt && prompts.length > 1);
    setCurrentPrompt(next);
    setResponse("");
    setSaved(false);
  };

  const saveReflection = async () => {
    if (!user || !response.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("reflections").insert({
        user_id: user.id,
        prompt: currentPrompt,
        response: response.trim(),
        category: "journal",
      });
      if (error) throw error;
      toast({ title: "Reflection saved" });
      setSaved(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card shadow-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold text-secondary uppercase tracking-wide">
            Today's Prompt
          </span>
        </div>

        <p className="text-foreground font-medium leading-relaxed mb-5">
          {currentPrompt}
        </p>

        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write your thoughts..."
          rows={5}
          className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground font-body resize-none leading-relaxed"
        />

        <div className="flex gap-3 mt-4">
          <Button
            variant="hero"
            className="flex-1"
            onClick={saveReflection}
            disabled={saving || !response.trim() || saved}
          >
            {saved ? "Saved ✓" : saving ? "Saving..." : "Save Reflection"}
          </Button>
          <Button variant="outline" size="icon" onClick={shufflePrompt} className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Show share moment after saving a reflection */}
        {saved && (
          <div className="mt-6">
            <MomentShareCard delay={0.8} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReflectionsPage;
