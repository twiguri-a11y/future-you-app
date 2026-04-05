import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingSection = () => {
  const { t } = useLanguage();

  const plans = [
    {
      key: "free",
      variant: "outline" as const,
      popular: false,
    },
    {
      key: "premium",
      variant: "hero" as const,
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t("pricing.headline")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("pricing.subtext")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => {
            const features: string[] = [];
            for (let j = 0; j < 8; j++) {
              const val = t(`pricing.${plan.key}.features.${j}`);
              if (val !== `pricing.${plan.key}.features.${j}`) features.push(val);
            }

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-card shadow-elevated ring-2 ring-primary"
                    : "bg-card shadow-card"
                }`}
              >
                <h3 className="text-2xl font-bold mb-1">{t(`pricing.${plan.key}.name`)}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t(`pricing.${plan.key}.description`)}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold">{t(`pricing.${plan.key}.price`)}</span>
                  <span className="text-muted-foreground text-sm">
                    {t(`pricing.${plan.key}.period`)}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/onboarding">
                  <Button variant={plan.variant} size="lg" className="w-full">
                    {t(`pricing.${plan.key}.cta`)}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
