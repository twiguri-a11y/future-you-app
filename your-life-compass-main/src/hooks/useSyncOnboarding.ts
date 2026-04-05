import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ONBOARDING_KEY, ONBOARDING_COMPLETE_KEY, loadOnboarding, onboardingHash } from "@/pages/OnboardingPage";

/**
 * On first auth, syncs any cached onboarding answers from localStorage
 * into the onboarding_answers table (but keeps localStorage for offline use).
 */
export function useSyncOnboarding() {
  const { user } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;

    const cached = loadOnboarding();
    if (!cached) return;

    const vision = [
      ...cached.selectedIdentities,
      ...(cached.customIdentity?.trim() ? [cached.customIdentity.trim()] : []),
    ].join(", ");

    const answers = {
      vision,
      priority: cached.priority,
      goals: cached.selectedIdentities,
      identity: cached.customIdentity?.trim() || undefined,
      environment: cached.environment?.trim() || undefined,
      people: cached.people?.trim() || undefined,
      emotion: cached.emotion || undefined,
    };

    (async () => {
      const { data: existing } = await supabase
        .from("onboarding_answers")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from("onboarding_answers")
          .update({ answers: answers as any })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("onboarding_answers")
          .insert({ user_id: user.id, answers: answers as any });
      }

      // Mark onboarding as complete and store hash
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
      localStorage.setItem("fy_onboarding_hash", onboardingHash(cached));
    })();
  }, [user]);
}
