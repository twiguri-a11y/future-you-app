import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PathPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<
    { date: string; alignment_score: number | null; mood: string | null; intention: string | null }[]
  >([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("daily_alignment")
        .select("date, alignment_score, mood, intention")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      if (data) {
        setEntries(data);

        // Calculate streak
        const dates = data.map((d) => d.date);
        const todayStr = new Date().toISOString().slice(0, 10);
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
    };

    fetch();
  }, [user]);

  const avgScore =
    entries.length > 0
      ? Math.round(
          entries
            .map((e) => e.alignment_score)
            .filter((s): s is number => s !== null)
            .reduce((a, b) => a + b, 0) /
            (entries.filter((e) => e.alignment_score !== null).length || 1)
        )
      : 0;

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 },
  });

  return (
    <div className="px-6 py-8 max-w-md mx-auto space-y-6 pb-24">
      <motion.div {...anim(0)}>
        <h1 className="font-display text-2xl font-semibold text-foreground">Your Path</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Your growth over time — every step matters.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div {...anim(0.1)} className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-display font-semibold text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground font-body mt-1 uppercase tracking-wide">Day Streak</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-display font-semibold text-foreground">{avgScore}%</p>
          <p className="text-[10px] text-muted-foreground font-body mt-1 uppercase tracking-wide">Avg Alignment</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-display font-semibold text-foreground">{entries.length}</p>
          <p className="text-[10px] text-muted-foreground font-body mt-1 uppercase tracking-wide">Check-ins</p>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div {...anim(0.2)}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Progress Timeline</h2>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">
              No check-ins yet. Start with your daily alignment.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {entries.slice(0, 14).map((entry, i) => {
              const date = new Date(entry.date);
              const dayLabel = date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return (
                <motion.div
                  key={entry.date}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center mt-1.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        (entry.alignment_score ?? 0) >= 7
                          ? "bg-secondary"
                          : (entry.alignment_score ?? 0) >= 4
                          ? "bg-muted-foreground/50"
                          : "bg-muted-foreground/25"
                      }`}
                    />
                    {i < Math.min(entries.length, 14) - 1 && (
                      <div className="w-px h-full bg-border/60 mt-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground font-body">{dayLabel}</p>
                      {entry.alignment_score !== null && (
                        <span className="text-xs font-body font-medium text-secondary">
                          {entry.alignment_score * 10}%
                        </span>
                      )}
                    </div>
                    {entry.intention && (
                      <p className="text-sm text-foreground font-body mt-0.5 leading-relaxed truncate">
                        {entry.intention}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PathPage;
