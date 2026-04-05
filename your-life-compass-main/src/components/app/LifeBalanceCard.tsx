import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Briefcase, Users, Brain, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const AREA_CONFIG = {
  health: { icon: Heart, colorClass: "bg-rose-500" },
  career: { icon: Briefcase, colorClass: "bg-amber-500" },
  relationships: { icon: Users, colorClass: "bg-blue-500" },
  mind: { icon: Brain, colorClass: "bg-emerald-500" },
} as const;

interface LifeBalanceCardProps {
  userId: string | undefined;
  delay?: number;
}

const LifeBalanceCard = ({ userId, delay = 0 }: LifeBalanceCardProps) => {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<Record<string, number>>({
    health: 0,
    career: 0,
    relationships: 0,
    mind: 0,
  });

  useEffect(() => {
    if (!userId) return;
    const fetchBalance = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data } = await supabase
        .from("daily_alignment")
        .select("life_area")
        .eq("user_id", userId)
        .gte("date", weekAgo.toISOString().slice(0, 10));

      if (!data) return;
      const c: Record<string, number> = { health: 0, career: 0, relationships: 0, mind: 0 };
      data.forEach((d: any) => {
        if (d.life_area && c[d.life_area] !== undefined) c[d.life_area]++;
      });
      setCounts(c);
    };
    fetchBalance();
  }, [userId]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-card shadow-card p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          {t("lifeAreas.weeklyBalance")}
        </span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-muted">
        {(Object.keys(AREA_CONFIG) as Array<keyof typeof AREA_CONFIG>).map((key) => {
          const pct = total > 0 ? (counts[key] / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <motion.div
              key={key}
              className={`h-full ${AREA_CONFIG[key].colorClass}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: delay + 0.3, duration: 0.5 }}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-2.5">
        {(Object.keys(AREA_CONFIG) as Array<keyof typeof AREA_CONFIG>).map((key) => {
          const Icon = AREA_CONFIG[key].icon;
          return (
            <div key={key} className="flex items-center gap-1">
              <Icon className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{counts[key]}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default LifeBalanceCard;
