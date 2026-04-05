import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Sun } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/future-self-chat`;

const dailyActions = [
  "Write down one thing your future self would do today.",
  "Spend 10 minutes on your most important goal.",
  "Reflect on one choice that moved you forward.",
];

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alignmentScore, setAlignmentScore] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(true);

  // Calculate alignment score from recent daily entries
  useEffect(() => {
    if (!user) return;

    const fetchAlignment = async () => {
      const { data } = await supabase
        .from("daily_alignment")
        .select("alignment_score")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(7);

      if (data && data.length > 0) {
        const scores = data
          .map((d) => d.alignment_score)
          .filter((s): s is number => s !== null);
        const avg = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
        setAlignmentScore(avg);
      }
    };

    fetchAlignment();
  }, [user]);

  // Fetch daily message from future self — cached in localStorage
  useEffect(() => {
    if (!user) return;

    const CACHE_KEY = "fy_future_message";

    // Check for cached message
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setMessage(cached);
      setLoadingMessage(false);
      return;
    }

    const fetchMessage = async () => {
      setLoadingMessage(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content:
                  "Give me a single short sentence of calm, grounded encouragement for today. No greeting, no questions, no emoji. Under 25 words.",
              },
            ],
          }),
        });

        if (!resp.ok) {
          setMessage("You're closer than you think. Keep going.");
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
          let idx = buffer.indexOf("\n");
          while (idx !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) { idx = buffer.indexOf("\n"); continue; }
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) full += content;
            } catch { buffer = `${line}\n${buffer}`; break; }
            idx = buffer.indexOf("\n");
          }
        }

        const finalMsg = full.trim() || "You're closer than you think. Keep going.";
        setMessage(finalMsg);
        localStorage.setItem(CACHE_KEY, finalMsg);
      } catch {
        setMessage("You're closer than you think. Keep going.");
      } finally {
        setLoadingMessage(false);
      }
    };

    fetchMessage();
  }, [user]);

  const anim = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 },
  });

  return (
    <div className="px-6 py-8 max-w-md mx-auto space-y-8">
      {/* Alignment Score */}
      <motion.div {...anim(0)} className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body font-medium mb-4">
          Your Alignment
        </p>
        <div className="relative w-32 h-32 mx-auto">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <motion.circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 52 * (1 - alignmentScore / 100),
              }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl font-semibold text-foreground">
              {alignmentScore}%
            </span>
          </div>
        </div>
      </motion.div>

      {/* Message from future self */}
      <motion.div
        {...anim(0.2)}
        className="rounded-2xl bg-card border border-border p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-xs font-body font-medium text-secondary uppercase tracking-wide">
            From your future self
          </span>
        </div>
        {loadingMessage ? (
          <div className="h-5 bg-muted rounded-lg animate-pulse w-3/4" />
        ) : (
          <p className="text-sm text-foreground/90 leading-relaxed font-body italic">
            "{message}"
          </p>
        )}
      </motion.div>

      {/* 3 Daily actions */}
      <motion.div {...anim(0.4)}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Today's Actions
        </h2>
        <div className="space-y-3">
          {dailyActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-body font-semibold text-muted-foreground shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-foreground font-body leading-relaxed">
                {action}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Daily Experience entry point */}
      <motion.div {...anim(0.6)} className="text-center space-y-3">
        <button
          onClick={() => {
            console.log("Navigating to /app/experience");
            navigate("/app/experience");
          }}
          className="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-6 py-3 font-display font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
        >
          <Sun className="w-4 h-4" />
          Go to Daily Experience
        </button>
        <div>
          <Link
            to="/app/experience"
            className="text-xs text-muted-foreground underline font-body"
          >
            Or use this link to Daily Experience
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
