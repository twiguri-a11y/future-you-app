import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PersonalityType = "calm" | "driven" | "growth" | "visionary";
export type ProgressStage = 1 | 2 | 3 | 4;

const KEYWORD_MAP: Record<PersonalityType, string[]> = {
  calm: ["peace", "balance", "calm", "relax", "mindful", "quiet", "still", "serene", "rest", "gentle", "slow", "reflect", "meditat"],
  driven: ["success", "career", "achieve", "ambiti", "goal", "lead", "money", "wealth", "business", "perform", "win", "compet", "disciplin"],
  growth: ["heal", "grow", "recover", "learn", "better", "change", "transform", "journey", "overcom", "strength", "resilien", "accept"],
  visionary: ["vision", "dream", "creat", "inspir", "imagin", "innovat", "future", "big", "expan", "build", "impact", "legacy", "purpose"],
};

function classifyText(text: string): PersonalityType {
  const lower = text.toLowerCase();
  const scores: Record<PersonalityType, number> = { calm: 0, driven: 0, growth: 0, visionary: 0 };

  for (const [type, keywords] of Object.entries(KEYWORD_MAP) as [PersonalityType, string[]][]) {
    for (const kw of keywords) {
      const regex = new RegExp(kw, "gi");
      const matches = lower.match(regex);
      if (matches) scores[type] += matches.length;
    }
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? (sorted[0][0] as PersonalityType) : "calm";
}

function computeStage(streak: number, totalAlignments: number): ProgressStage {
  if (totalAlignments >= 60 || streak >= 30) return 4;
  if (totalAlignments >= 21 || streak >= 14) return 3;
  if (totalAlignments >= 7 || streak >= 5) return 2;
  return 1;
}

export function usePersonality() {
  const { user } = useAuth();
  const [personality, setPersonality] = useState<PersonalityType>("calm");
  const [stage, setStage] = useState<ProgressStage>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // Check localStorage for guest/returning visitor personality
      const cached = localStorage.getItem("fy_personality") as PersonalityType | null;
      if (cached && KEYWORD_MAP[cached]) setPersonality(cached);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const [answersRes, alignRes] = await Promise.all([
        supabase
          .from("onboarding_answers")
          .select("answers, reflection_answer")
          .eq("user_id", user.id)
          .limit(1),
        supabase
          .from("daily_alignment")
          .select("date")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(60),
      ]);

      // Classify personality from onboarding
      let allText = "";
      if (answersRes.data?.[0]) {
        const row = answersRes.data[0];
        const ans = row.answers;
        if (typeof ans === "object" && ans !== null) {
          allText += Object.values(ans).join(" ");
        }
        if (row.reflection_answer) allText += " " + row.reflection_answer;
      }

      if (allText.trim()) {
        const p = classifyText(allText);
        setPersonality(p);
        localStorage.setItem("fy_personality", p);
      }

      // Compute stage
      if (alignRes.data) {
        const dates = alignRes.data.map((d) => d.date);
        const todayStr = new Date().toISOString().slice(0, 10);
        let streak = 0;
        const check = new Date();
        if (!dates.includes(todayStr)) check.setDate(check.getDate() - 1);
        while (dates.includes(check.toISOString().slice(0, 10))) {
          streak++;
          check.setDate(check.getDate() - 1);
        }
        if (dates.includes(todayStr)) streak++;
        setStage(computeStage(streak, dates.length));
      }

      setLoading(false);
    };

    fetch();
  }, [user]);

  return { personality, stage, loading };
}
