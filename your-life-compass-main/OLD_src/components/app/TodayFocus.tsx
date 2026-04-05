import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Circle, CheckCircle2, Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import VoiceInput from "@/components/app/VoiceInput";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STEP_SUGGESTIONS = [
  "Send that message you've been putting off",
  "Start for just 5 minutes",
  "Remove one distraction from your space",
];

interface FocusItem {
  id: string;
  text: string;
  detail: string;
  placeholder: string;
}

const FOCUS_ITEMS: FocusItem[] = [
  {
    id: "task",
    text: "Choose one meaningful task",
    detail: "What matters most today?",
    placeholder: "What matters most today?",
  },
  {
    id: "step",
    text: "Take one aligned step",
    detail: "Small and intentional.",
    placeholder: "What's one small step you can take?",
  },
  {
    id: "reflect",
    text: "Pause and reflect for a moment",
    detail: "Even 30 seconds counts.",
    placeholder: "What are you feeling right now?",
  },
];

interface TodayFocusProps {
  onCompletedChange?: (count: number) => void;
}

const TodayFocus = ({ onCompletedChange }: TodayFocusProps) => {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const updateInput = (id: string, value: string) => {
    if (value.length <= 300) {
      setInputs((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleToggle = (id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  const handleSave = async (id: string) => {
    const text = inputs[id]?.trim();
    if (!text || !user) return;

    setSaving(true);
    try {
      const promptMap: Record<string, string> = {
        task: "Today's meaningful task",
        step: "Today's aligned step",
        reflect: "Moment of reflection",
      };

      await supabase.from("reflections").insert({
        user_id: user.id,
        prompt: promptMap[id] ?? id,
        response: text,
        category: "daily_focus",
      });

      setSaved((prev) => {
        const next = new Set(prev);
        next.add(id);
        onCompletedChange?.(next.size);
        return next;
      });
      setActiveId(null);
      toast({ title: "Saved", description: "Nice — that's a real step." });
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setInputs((prev) => ({ ...prev, step: suggestion }));
  };

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">Today's Focus</h2>
      </div>

      <div className="space-y-2">
        {FOCUS_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          const isDone = saved.has(item.id);
          const Icon = isDone ? CheckCircle2 : Circle;
          const inputValue = inputs[item.id] ?? "";

          return (
            <div key={item.id}>
              <button
                onClick={() => !isDone && handleToggle(item.id)}
                className={`w-full flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 ${
                  isDone
                    ? "border-accent/30 bg-accent/5"
                    : isActive
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-primary/30 hover:bg-muted/30"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                    isDone ? "text-accent" : isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      isDone ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {item.text}
                  </p>
                  {isDone && inputs[item.id] ? (
                    <p className="text-xs text-accent/80 mt-0.5 italic">"{inputs[item.id]}"</p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isActive && !isDone && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 pb-1 pl-7">
                      {/* Suggestions for "step" item */}
                      {item.id === "step" && !inputValue && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {STEP_SUGGESTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => applySuggestion(s)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                            >
                              <Lightbulb className="w-3 h-3" />
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <Textarea
                            value={inputValue}
                            onChange={(e) => updateInput(item.id, e.target.value)}
                            placeholder={item.placeholder}
                            className="min-h-[60px] text-sm bg-background border-border resize-none"
                            maxLength={300}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {item.id === "reflect" ? (
                          <VoiceInput
                            onTranscript={(text) =>
                              updateInput(item.id, inputValue ? `${inputValue} ${text}` : text)
                            }
                          />
                        ) : (
                          <div />
                        )}
                        <Button
                          variant="hero"
                          size="sm"
                          disabled={!inputValue.trim() || saving}
                          onClick={() => handleSave(item.id)}
                        >
                          {saving ? "Saving..." : "Done"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayFocus;
