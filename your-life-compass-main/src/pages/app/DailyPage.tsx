import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, Flame, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MOODS = ["😌 Calm", "⚡ Energized", "😐 Neutral", "😤 Frustrated", "😔 Low"];

const DailyPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayDone, setTodayDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [mood, setMood] = useState<string | null>(null);
  const [intention, setIntention] = useState("");
  const [score, setScore] = useState(7);
  const [saving, setSaving] = useState(false);

  // History
  const [history, setHistory] = useState<
    { date: string; mood: string | null; intention: string | null; alignment_score: number | null }[]
  >([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const todayStr = new Date().toISOString().slice(0, 10);

    const { data } = await supabase
      .from("daily_alignment")
      .select("date, mood, intention, alignment_score")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(30);

    if (data) {
      setHistory(data);
      setTodayDone(data.some((d) => d.date === todayStr));

      const dates = data.map((d) => d.date);
      let s = 0;
      const check = new Date();
      if (!dates.includes(todayStr)) check.setDate(check.getDate() - 1);
      while (dates.includes(check.toISOString().slice(0, 10))) {
        s++;
        check.setDate(check.getDate() - 1);
      }
      if (dates.includes(todayStr)) s++;
      setStreak(s);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    if (!user || !mood) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("daily_alignment").insert({
        user_id: user.id,
        mood: mood,
        intention: intention.trim() || null,
        alignment_score: score,
      });

      if (error) throw error;

      navigate("/app/daily-complete", {
        state: {
          mood,
          alignmentScore: score,
          hasIntention: intention.trim().length > 0,
          streak: streak + 1,
        },
      });
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

  return (
    <div className="px-6 pt-2 pb-24 max-w-md mx-auto space-y-5">
      <motion.div {...anim(0)}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Daily</h1>
            <p className="text-sm text-muted-foreground font-body mt-1">Your daily check-in.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2">
            <Flame className="w-4 h-4 text-secondary" />
            <span className="text-sm font-display font-semibold text-foreground">{streak}</span>
          </div>
        </div>
      </motion.div>

      {/* Check-in form */}
      {!todayDone ? (
        <motion.div {...anim(0.1)} className="rounded-2xl border border-border bg-card p-5 space-y-5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-secondary" />
            <h2 className="font-display text-base font-semibold text-foreground">Today's Check-in</h2>
          </div>

          {/* Mood */}
          <div>
            <p className="text-sm font-body text-muted-foreground mb-2.5">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-body font-medium border transition-all ${
                    mood === m
                      ? "border-secondary bg-secondary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-secondary/40"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* What did you do today */}
          <div>
            <p className="text-sm font-body text-muted-foreground mb-2">What did you do today?</p>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="One thing that mattered..."
              rows={2}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Alignment score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-body text-muted-foreground">Alignment score</p>
              <span className="text-sm font-display font-semibold text-secondary">{score * 10}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-secondary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-body mt-1">
              <span>Off track</span>
              <span>Fully aligned</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!mood || saving}
            className="w-full bg-foreground text-background font-display font-medium text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? "Saving…" : "Save Check-in"}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </button>
        </motion.div>
      ) : (
        <motion.div {...anim(0.1)} className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 text-center">
          <CalendarCheck className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="font-display text-base font-semibold text-foreground">You checked in today</p>
          <p className="text-sm text-muted-foreground font-body mt-1">Come back tomorrow to keep your streak.</p>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <motion.div {...anim(0.2)}>
          <h2 className="font-display text-base font-semibold text-foreground mb-3">Recent History</h2>
          <div className="space-y-2">
            {history.slice(0, 7).map((entry) => {
              const date = new Date(entry.date);
              return (
                <div
                  key={entry.date}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-muted-foreground font-body">
                      {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                    {entry.intention && (
                      <p className="text-sm text-foreground font-body mt-0.5 truncate max-w-[200px]">
                        {entry.intention}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {entry.alignment_score !== null && (
                      <span className="text-xs font-body font-medium text-secondary">
                        {entry.alignment_score * 10}%
                      </span>
                    )}
                    {entry.mood && (
                      <p className="text-[10px] text-muted-foreground font-body">{entry.mood}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DailyPage;
