import { motion } from "framer-motion";
import { Sprout, Flame, Mountain, Crown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const icons = [Sprout, Flame, Mountain, Crown];

const TimelineSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("timeline.headline")}{" "}
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
              {t("timeline.headlineAccent")}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("timeline.subtext")}
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-secondary via-accent to-secondary/20 md:-translate-x-px" />

          {icons.map((Icon, index) => {
            const isLeft = index % 2 === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative flex items-start mb-12 last:mb-0 ${
                  isLeft ? "md:flex-row md:text-right" : "md:flex-row-reverse md:text-left"
                }`}
              >
                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                    isLeft ? "md:pr-0 md:mr-auto" : "md:pl-0 md:ml-auto"
                  }`}
                >
                  <div className="rounded-2xl bg-card p-6 shadow-card hover:shadow-elevated transition-shadow duration-300">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-secondary mb-2">
                      {t(`timeline.items.${index}.year`)}
                    </span>
                    <h3 className="text-lg font-bold mb-1">
                      {t(`timeline.items.${index}.title`)}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`timeline.items.${index}.description`)}
                    </p>
                  </div>
                </div>

                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 w-12 h-12 rounded-full gradient-hero flex items-center justify-center shadow-lg z-10">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
