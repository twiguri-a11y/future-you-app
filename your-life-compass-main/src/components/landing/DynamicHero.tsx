import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { PersonalityType, ProgressStage } from "@/hooks/usePersonality";

import heroOcean from "@/assets/hero-ocean.jpg";
import heroCalm from "@/assets/hero-calm.jpg";
import heroDriven from "@/assets/hero-driven.jpg";
import heroGrowth from "@/assets/hero-growth.jpg";
import heroVisionary from "@/assets/hero-visionary.jpg";
import heroBeachhouse from "@/assets/hero-beachhouse.jpg";
import heroPorch from "@/assets/hero-porch.jpg";

const ALL_IMAGES = [heroOcean, heroPorch, heroBeachhouse, heroCalm, heroDriven, heroGrowth, heroVisionary];

const ALL_ALT = [
  "Crystal turquoise ocean paradise at golden hour",
  "Man on luxury porch overlooking ocean sunset with coffee",
  "Man standing on beach house porch staring at the sunset",
  "Serene beach at sunset with golden light on calm waters",
  "Modern balcony overlooking a city at sunrise",
  "Peaceful forest path with golden sunlight filtering through trees",
  "Wide horizon with dramatic sky tones at golden hour",
];

const HERO_IMAGES: Record<PersonalityType, string> = {
  calm: heroCalm,
  driven: heroDriven,
  growth: heroGrowth,
  visionary: heroVisionary,
};

const ALT_TEXT: Record<PersonalityType, string> = {
  calm: ALL_ALT[2],
  driven: ALL_ALT[3],
  growth: ALL_ALT[4],
  visionary: ALL_ALT[5],
};

interface DynamicHeroProps {
  personality: PersonalityType;
  stage: ProgressStage;
  isAuthenticated: boolean;
  bgIndex?: number;
}

const DynamicHero = ({ personality, stage, isAuthenticated, bgIndex = 0 }: DynamicHeroProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const [userImages, setUserImages] = useState<string[]>([]);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Load user-uploaded hero backgrounds
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.storage
        .from("hero-backgrounds")
        .list(user.id, { limit: 20, sortBy: { column: "created_at", order: "desc" } });
      if (data) {
        const urls = data
          .filter((f) => f.name !== ".emptyFolderPlaceholder")
          .map((f) => supabase.storage.from("hero-backgrounds").getPublicUrl(`${user.id}/${f.name}`).data.publicUrl);
        setUserImages(urls);
      }
    };
    load();
  }, [user]);

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  // Combine built-in + user images
  const allImages = useMemo(() => [...ALL_IMAGES, ...userImages], [userImages]);
  const allAlt = useMemo(() => [...ALL_ALT, ...userImages.map(() => "Your personal background")], [userImages]);

  const heroImage = bgIndex > 0 ? allImages[bgIndex % allImages.length] : (isAuthenticated ? HERO_IMAGES[personality] : heroOcean);
  const altText = bgIndex > 0 ? allAlt[bgIndex % allAlt.length] : (isAuthenticated ? ALT_TEXT[personality] : ALL_ALT[0]);

  return (
    <section ref={sectionRef} className="relative min-h-[92vh] flex items-center overflow-hidden" dir="ltr">
      {/* Parallax background with crossfade */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ y: imgY, scale: imgScale }}
      >
        <AnimatePresence mode="sync">
          <motion.img
            key={heroImage}
            src={heroImage}
            alt={altText}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover object-[50%_center]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </motion.div>

      {/* Cinematic overlay — stronger for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* Content */}
      <div className="container relative z-10 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Top label */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-sm md:text-base uppercase tracking-[0.35em] font-light mb-10 mt-20"
            style={{ color: "rgba(230, 211, 163, 0.85)" }}
          >
            {t("hero.badge")}
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-8"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.35)" }}
          >
            <span className="text-white">{t("hero.headline")}</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-sm sm:text-base md:text-lg text-white/75 max-w-md mx-auto mb-6 sm:mb-8 font-body leading-relaxed whitespace-pre-line"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.3)" }}
          >
            {t("hero.subtext")}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link to={isAuthenticated ? "/app" : "/onboarding"}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Button variant="hero" size="xl" className="hero-glow text-sm sm:text-base whitespace-nowrap px-12">
                  {isAuthenticated ? t("hero.ctaAuth") : t("hero.cta")}
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
                </Button>
              </motion.div>
            </Link>
            {!isAuthenticated && (
              <a href="#features">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/25 text-white/85 hover:bg-white/10 hover:text-white text-sm sm:text-base whitespace-nowrap"
                  >
                    {t("hero.secondary")}
                  </Button>
                </motion.div>
              </a>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DynamicHero;
