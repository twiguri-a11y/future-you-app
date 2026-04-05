import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useGuest } from "@/contexts/GuestContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import VisionQuestionnaire from "@/components/app/VisionQuestionnaire";
import VisionExperience from "@/components/app/VisionExperience";
import VisionPaywall from "@/components/app/VisionPaywall";
import StayAlignedSection from "@/components/app/StayAlignedSection";
import PostExperienceConversion from "@/components/app/PostExperienceConversion";
import VisionShareCard from "@/components/app/VisionShareCard";
import MomentShareCard from "@/components/app/MomentShareCard";

const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-vision-experience`;

type Stage = "intro" | "questions" | "generating" | "transition" | "experience" | "conversion" | "paywall";

interface Experience {
  id: string;
  script: string;
  image_url: string | null;
  answers: Record<string, string>;
}

const FutureVisionPage = () => {
  const { user } = useAuth();
  const { isGuest, setGuestExperienceCompleted } = useGuest();
  const navigate = useNavigate();
  const location = useLocation();
  const isGuestRoute = location.pathname === "/experience";

  const [stage, setStage] = useState<Stage>("intro");
  const [experience, setExperience] = useState<Experience | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [currentPetImage, setCurrentPetImage] = useState<string | null>(null);

  const generate = useCallback(async (answers: Record<string, string>, petImage?: string | null) => {
    setStage("generating");
    setCurrentAnswers(answers);
    if (petImage !== undefined) setCurrentPetImage(petImage ?? null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      // Add auth header if logged in
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          headers.Authorization = `Bearer ${session.access_token}`;
        }
      }

      const resp = await fetch(GENERATE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ answers, guest: isGuest || isGuestRoute, petImage: petImage || currentPetImage }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Generation failed");
      }

      const { experience: exp } = await resp.json();
      setExperience(exp);
      setGenerationCount((c) => c + 1);
      setStage("transition");
      setTimeout(() => setStage("experience"), 3000);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setStage("questions");
    }
  }, [user, isGuest, isGuestRoute, currentPetImage]);

  const handleRegenerate = useCallback(() => {
    if (generationCount >= 1) {
      setStage("paywall");
      return;
    }
    generate(currentAnswers);
  }, [generationCount, currentAnswers, generate]);

  const handleExperienceComplete = () => {
    if ((isGuest || isGuestRoute) && !user) {
      setGuestExperienceCompleted(true);
      setStage("conversion");
    }
  };

  const backPath = isGuestRoute ? "/" : "/app/path";

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="px-6 pt-4 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(backPath)}
          className="gap-1.5 -ml-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {isGuestRoute ? "Home" : "Path"}
        </Button>
      </div>

      <div className="px-6">
        {/* Intro */}
        {stage === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[60vh] flex flex-col justify-center items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center mb-6"
            >
              <Sparkles className="w-9 h-9 text-primary-foreground" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground/70 italic mb-2"
            >
              This is the life you step into — if you stop hesitating.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-sm text-muted-foreground/70 italic mb-6"
            >
              This is you — if you stay consistent.
            </motion.p>

            <h1 className="text-2xl font-bold mb-3">Future Vision Experience</h1>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
              Answer 8 questions about your ideal future. We'll create a personalized
              image and a message from your future self.
            </p>

            <Button variant="hero" size="lg" onClick={() => setStage("questions")} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Begin
            </Button>
          </motion.div>
        )}

        {/* Questionnaire */}
        {stage === "questions" && (
          <VisionQuestionnaire onComplete={generate} />
        )}

        {/* Generating */}
        {stage === "generating" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[60vh] flex flex-col justify-center items-center text-center"
          >
            <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mb-6 animate-pulse">
              <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
            </div>
            <h2 className="text-lg font-bold mb-2">Creating your vision…</h2>
            <p className="text-sm text-muted-foreground">
              Imagining your future, one detail at a time.
            </p>
          </motion.div>
        )}

        {/* Transition */}
        {stage === "transition" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[60vh] flex flex-col justify-center items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0.7] }}
              transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1] }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg font-medium text-foreground/90 z-20"
            >
              Give it a moment…
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="text-sm text-muted-foreground mt-2 z-20"
            >
              your future is taking shape
            </motion.p>
          </motion.div>
        )}

        {/* Experience */}
        {stage === "experience" && experience && (
          <>
            <VisionExperience
              experience={experience}
              onRegenerate={handleRegenerate}
              isRegenerating={false}
            />

            {/* Subtle emotional share — after the vision reveal */}
            <div className="mt-10">
              <MomentShareCard delay={3.0} />
            </div>

            {/* For guests: show conversion CTA; for users: habit loop */}
            {(isGuest || isGuestRoute) && !user ? (
              <div className="mt-6 text-center">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleExperienceComplete}
                >
                  Save my future
                </Button>
              </div>
            ) : (
              <div className="mt-6">
                <StayAlignedSection delay={0.8} />
              </div>
            )}
          </>
        )}

        {/* Post-experience conversion (guests) */}
        {stage === "conversion" && (
          <PostExperienceConversion
            onDismiss={() => setStage("experience")}
          />
        )}

        {/* Paywall */}
        {stage === "paywall" && (
          <VisionPaywall
            onContinue={() => {
              toast({ title: "Coming Soon", description: "Premium subscriptions launching soon!" });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default FutureVisionPage;
