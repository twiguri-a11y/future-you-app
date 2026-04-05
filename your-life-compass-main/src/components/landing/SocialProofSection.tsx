import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Sparkles, Flame } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const statIcons = [Users, Sparkles, Flame];
const statValues = [12400, 48000, 320000];

function useCountUp(target: number, trigger: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, target, duration]);

  return count;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return n.toString();
}

const StatItem = ({
  icon: Icon,
  value,
  label,
  index,
  isInView,
}: {
  icon: any;
  value: number;
  label: string;
  index: number;
  isInView: boolean;
}) => {
  const count = useCountUp(value, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center gap-2"
    >
      <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-1">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <span className="text-3xl md:text-4xl font-extrabold text-foreground tabular-nums">
        {formatNumber(count)}+
      </span>
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
    </motion.div>
  );
};

const SocialProofSection = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="py-16 bg-background border-y border-border/50">
      <div className="container">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 max-w-3xl mx-auto">
          {statIcons.map((Icon, i) => (
            <StatItem
              key={i}
              icon={Icon}
              value={statValues[i]}
              label={t(`social.stats.${i}`)}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
