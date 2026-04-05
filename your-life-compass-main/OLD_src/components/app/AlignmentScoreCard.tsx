import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface AlignmentScoreCardProps {
  weeklyAvg: number | null;
  trend: "up" | "down" | "stable" | null;
  delay?: number;
}

const AlignmentScoreCard = ({ weeklyAvg, trend, delay = 0 }: AlignmentScoreCardProps) => {
  if (weeklyAvg === null) return null;

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-accent" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  const trendLabel = trend === "up" ? "Improving" : trend === "down" ? "Declining" : "Steady";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-card shadow-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Alignment</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-foreground">{weeklyAvg.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">/10</span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">This week's average</p>
    </motion.div>
  );
};

export default AlignmentScoreCard;
