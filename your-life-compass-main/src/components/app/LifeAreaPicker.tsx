import { motion } from "framer-motion";
import { Heart, Briefcase, Users, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LIFE_AREAS = [
  { value: "health", icon: Heart, colorClass: "text-rose-500 dark:text-rose-400" },
  { value: "career", icon: Briefcase, colorClass: "text-amber-500 dark:text-amber-400" },
  { value: "relationships", icon: Users, colorClass: "text-blue-500 dark:text-blue-400" },
  { value: "mind", icon: Brain, colorClass: "text-emerald-500 dark:text-emerald-400" },
] as const;

export type LifeArea = typeof LIFE_AREAS[number]["value"];

interface LifeAreaPickerProps {
  value: string;
  onChange: (v: string) => void;
}

const LifeAreaPicker = ({ value, onChange }: LifeAreaPickerProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-4 gap-2">
      {LIFE_AREAS.map((area) => {
        const Icon = area.icon;
        const selected = value === area.value;
        return (
          <button
            key={area.value}
            type="button"
            onClick={() => onChange(selected ? "" : area.value)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              selected
                ? "border-primary bg-primary/10 scale-105"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <Icon className={`w-5 h-5 ${selected ? "text-primary" : area.colorClass}`} />
            <span className="text-[10px] font-medium text-muted-foreground leading-tight text-center">
              {t(`lifeAreas.${area.value}`)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LifeAreaPicker;
