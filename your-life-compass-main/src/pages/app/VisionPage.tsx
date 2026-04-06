import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit3, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VisionData {
  vision: string;
  priority: string | null;
  goals?: string[];
  identity?: string;
  lifestyle?: string;
}

/** Title-case for profile focus labels (e.g. happy → Happy). */
function formatProfileFocusLabel(value: string) {
  return value.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

const VisionPage = () => {
  const { user } = useAuth();
  const [vision, setVision] = useState<VisionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editVision, setEditVision] = useState("");
  const [editIdentity, setEditIdentity] = useState("");
  const [editGoals, setEditGoals] = useState("");
  const [editLifestyle, setEditLifestyle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchVision = async () => {
      const { data } = await supabase
        .from("onboarding_answers")
        .select("answers")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const answers = data[0].answers as unknown as VisionData;
        setVision(answers);
        setEditVision(answers.vision || "");
        setEditIdentity(answers.identity || "");
        setEditGoals(answers.goals?.join(", ") || "");
        setEditLifestyle(answers.lifestyle || "");
      }

      setLoading(false);
    };

    fetchVision();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const updatedAnswers: VisionData = {
      vision: editVision.trim(),
      priority: vision?.priority || null,
      identity: editIdentity.trim() || undefined,
      goals: editGoals
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      lifestyle: editLifestyle.trim() || undefined,
    };

    try {
      const { error } = await supabase
        .from("onboarding_answers")
        .update({ answers: updatedAnswers as any })
        .eq("user_id", user.id);

      if (error) throw error;
      setVision(updatedAnswers);
      setEditing(false);
      toast({ title: "Vision updated", description: "Your future self is taking shape." });
    } catch {
      toast({ title: "Error saving", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 },
  });

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections = [
    { label: "Who I'm Becoming", value: vision?.vision, editValue: editVision, setter: setEditVision, rows: 3 },
    { label: "My Identity", value: vision?.identity, editValue: editIdentity, setter: setEditIdentity, rows: 2, placeholder: "The person I see in the mirror..." },
    { label: "My Goals", value: vision?.goals?.join(", "), editValue: editGoals, setter: setEditGoals, rows: 2, placeholder: "Health, Career, Learning..." },
    { label: "My Lifestyle", value: vision?.lifestyle, editValue: editLifestyle, setter: setEditLifestyle, rows: 2, placeholder: "How I want to live day-to-day..." },
  ];

  return (
    <div className="px-6 py-8 max-w-md mx-auto space-y-6 pb-24">
      <motion.div {...anim(0)} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Vision</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">Your defined future self.</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-body font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={() => setEditing(false)}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {!vision ? (
        <motion.div {...anim(0.1)} className="rounded-2xl border border-border bg-card p-8 text-center">
          <Eye className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-body">
            Complete onboarding to define your future self.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.div
              key={section.label}
              {...anim(0.1 + i * 0.05)}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium mb-2">
                {section.label}
              </p>
              {editing ? (
                <textarea
                  value={section.editValue}
                  onChange={(e) => section.setter(e.target.value)}
                  rows={section.rows}
                  placeholder={section.placeholder || ""}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              ) : (
                <p className="text-sm text-foreground font-body leading-relaxed">
                  {section.value || (
                    <span className="text-muted-foreground italic">Not set yet</span>
                  )}
                </p>
              )}
            </motion.div>
          ))}

          {vision.priority && (
            <motion.div {...anim(0.3)} className="rounded-2xl border border-border bg-card p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body font-medium mb-2">
                What Matters Most
              </p>
              <span className="inline-block px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary text-sm font-body font-medium">
                {formatProfileFocusLabel(vision.priority)}
              </span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisionPage;
