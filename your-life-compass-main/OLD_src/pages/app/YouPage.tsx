import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Flame,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
  Sparkles,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WeeklyQuizPage from "./WeeklyQuizPage";
import ReflectionsPage from "./ReflectionsPage";
import NotificationSettings from "@/components/app/NotificationSettings";
import ReferralCard from "@/components/app/ReferralCard";

const LEVEL_THRESHOLDS = [
  { days: 0, label: "Awakening", desc: "Just getting started" },
  { days: 7, label: "Emerging", desc: "Building momentum" },
  { days: 14, label: "Evolving", desc: "Rewiring your identity" },
  { days: 30, label: "Aligned", desc: "Living with intention" },
  { days: 60, label: "Embodied", desc: "Becoming who you imagined" },
  { days: 90, label: "Integrated", desc: "Your future self is your present self" },
  { days: 365, label: "Transcended", desc: "You changed who you are" },
];

const sectionLinks = [
  { id: "reflections", label: "Reflections", icon: ClipboardList },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "alignment", label: "Alignment", icon: Target },
  { id: "becoming", label: "Becoming", icon: Sparkles },
  { id: "settings", label: "Settings", icon: Settings },
];

const YouPage = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [recentScores, setRecentScores] = useState<{ date: string; score: number }[]>([]);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data } = await supabase
        .from("daily_alignment")
        .select("date, alignment_score")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(60);

      if (!data) return;

      setTotalDays(data.length);

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

      const scores = data
        .filter((d) => d.alignment_score != null)
        .slice(0, 14)
        .reverse()
        .map((d) => ({ date: d.date, score: d.alignment_score! }));
      setRecentScores(scores);
    };

    fetchStats();
  }, [user]);

  const currentLevel = LEVEL_THRESHOLDS.reduce(
    (acc, t) => (totalDays >= t.days ? t : acc),
    LEVEL_THRESHOLDS[0]
  );

  const nextLevel = LEVEL_THRESHOLDS.find((t) => t.days > totalDays);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const scrollTo = (id: string) => {
    document.getElementById(`you-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
  });

  if (showNotifSettings) {
    return <NotificationSettings onBack={() => setShowNotifSettings(false)} />;
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Header */}
      <div className="px-6 pt-6 mb-4">
        <motion.div {...anim(0)}>
          <h1 className="text-2xl font-bold">You</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.email || "Your progress and reflections"}
          </p>
        </motion.div>
      </div>

      {/* Jump nav */}
      <div className="px-6 mb-4 sticky top-[57px] z-30 bg-background/90 backdrop-blur-md py-2 -mt-2">
        <div className="flex gap-2 overflow-x-auto">
          {sectionLinks.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-xs font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Your Reflections */}
      <div id="you-reflections">
        <div className="px-6 mb-3">
          <h2 className="text-lg font-bold text-foreground">Your Reflections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Weekly check-ins with yourself</p>
        </div>
        <div className="px-6">
          <WeeklyQuizPage />
        </div>
      </div>

      {/* Your Journal */}
      <div id="you-journal" className="pt-6">
        <div className="px-6 mb-3">
          <div className="h-px bg-border mb-5" />
          <h2 className="text-lg font-bold text-foreground">Your Journal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pause, notice, and write what matters</p>
        </div>
        <div className="px-6">
          <ReflectionsPage />
        </div>
      </div>

      {/* Your Alignment */}
      <div id="you-alignment" className="pt-6">
        <div className="px-6 mb-3">
          <div className="h-px bg-border mb-5" />
          <h2 className="text-lg font-bold text-foreground">Your Alignment</h2>
          <p className="text-xs text-muted-foreground mt-0.5">How closely you're living your vision</p>
        </div>
        <div className="px-6">
          {recentScores.length > 0 ? (
            <motion.div {...anim(0.05)}>
              <div className="rounded-2xl bg-card shadow-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Last 14 Days
                  </span>
                </div>
                <div className="flex items-end gap-1 h-16">
                  {recentScores.map((s, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/20 relative"
                      style={{ height: `${(s.score / 10) * 100}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t bg-primary"
                        style={{ height: `${(s.score / 10) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground">
                    {recentScores[0]?.date.slice(5)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {recentScores[recentScores.length - 1]?.date.slice(5)}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground/60">Complete daily rituals to see your alignment trend.</p>
          )}
        </div>
      </div>

      {/* Your Consistency */}
      <div className="pt-6">
        <div className="px-6 mb-3">
          <div className="h-px bg-border mb-5" />
          <h2 className="text-lg font-bold text-foreground">Your Consistency</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Showing up is the practice</p>
        </div>
        <div className="px-6 grid grid-cols-2 gap-3">
          <motion.div {...anim(0.05)} className="rounded-2xl gradient-hero p-4 text-center">
            <Flame className="w-5 h-5 text-primary-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary-foreground">{streak}</p>
            <p className="text-[10px] text-primary-foreground/70 font-medium">Day Streak</p>
          </motion.div>

          <motion.div {...anim(0.08)} className="rounded-2xl bg-card shadow-card p-4 text-center">
            <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total Days</p>
          </motion.div>
        </div>
      </div>

      {/* Who You Are Becoming */}
      <div id="you-becoming" className="pt-6">
        <div className="px-6 mb-3">
          <div className="h-px bg-border mb-5" />
          <h2 className="text-lg font-bold text-foreground">Who You Are Becoming</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Your transformation, one day at a time</p>
        </div>
        <motion.div {...anim(0.1)} className="px-6">
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <p className="text-xs font-bold text-accent uppercase tracking-wide mb-1">
              {currentLevel.label}
            </p>
            <p className="text-sm text-foreground/80">{currentLevel.desc}</p>
            {nextLevel && (
              <p className="text-xs text-muted-foreground mt-3">
                {nextLevel.days - totalDays} more days to reach <span className="font-semibold text-foreground/70">{nextLevel.label}</span>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Invite */}
      <div className="pt-6 px-6">
        <div className="h-px bg-border mb-5" />
        <ReferralCard delay={0.12} />
      </div>

      {/* Settings */}
      <div id="you-settings" className="pt-6">
        <div className="px-6 mb-3">
          <div className="h-px bg-border mb-5" />
          <h2 className="text-lg font-bold text-foreground">Settings</h2>
        </div>
        <div className="px-6 space-y-4">
          <div className="rounded-2xl bg-card shadow-card overflow-hidden divide-y divide-border">
            <button
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Profile</p>
                <p className="text-xs text-muted-foreground">Manage your account</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setShowNotifSettings(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Notifications</p>
                <p className="text-xs text-muted-foreground">Reminders & alerts</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 text-destructive text-sm font-semibold py-3 rounded-2xl hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          {/* Disclaimer */}
          <div className="pt-2 pb-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground/60 text-center px-2">
              Future You provides guidance for self-reflection and personal growth. It is not a substitute for professional advice (medical, psychological, legal, or financial). Users are responsible for their own decisions and actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouPage;
