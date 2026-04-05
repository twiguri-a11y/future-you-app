import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useActivityTracker = (userId: string | undefined) => {
  const [daysAway, setDaysAway] = useState<number | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const track = async () => {
      // Get last_active_at
      const { data } = await supabase
        .from("profiles")
        .select("last_active_at")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.last_active_at) {
        const last = new Date(data.last_active_at);
        const now = new Date();
        const diffMs = now.getTime() - last.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 2) {
          const dismissedKey = `welcome_back_dismissed_${now.toISOString().slice(0, 10)}`;
          if (!sessionStorage.getItem(dismissedKey)) {
            setDaysAway(diffDays);
            setShowWelcomeBack(true);
          }
        }
      }

      // Update last_active_at
      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", userId);
    };

    track();
  }, [userId]);

  const dismissWelcomeBack = () => {
    setShowWelcomeBack(false);
    const key = `welcome_back_dismissed_${new Date().toISOString().slice(0, 10)}`;
    sessionStorage.setItem(key, "true");
  };

  return { daysAway, showWelcomeBack, dismissWelcomeBack };
};
