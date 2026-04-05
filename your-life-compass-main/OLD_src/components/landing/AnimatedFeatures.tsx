import { motion, useInView } from "framer-motion";
import { Mic, Eye, Repeat, MessageCircle, TrendingUp, Shield } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const featureIcons = [Mic, Eye, Repeat, MessageCircle, TrendingUp, Shield];

const FeatureCard = ({ icon: Icon, title, description, index }: { icon: any; title: string; description: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group rounded-2xl bg-card p-8 shadow-card hover:shadow-elevated transition-shadow duration-300"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.08 + 0.2 }}
          className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-5"
        >
          <Icon className="w-6 h-6 text-primary-foreground" />
        </motion.div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  );
};

const AnimatedFeatures = () => {
  const { t } = useLanguage();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 bg-background">
      <div className="container">
        <div ref={headerRef} className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {t("features.headline")}
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("features.headlineAccent")}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            {t("features.subtext")}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureIcons.map((Icon, i) => (
            <FeatureCard
              key={i}
              icon={Icon}
              title={t(`featureItems.${i}.title`)}
              description={t(`featureItems.${i}.description`)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedFeatures;
