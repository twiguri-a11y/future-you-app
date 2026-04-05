import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const { t, language } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  // Since t() returns strings, we need a helper to get the array
  // Let's use indices with t()
  const faqCount = 6;
  const faqs = Array.from({ length: faqCount }, (_, i) => ({
    q: t(`faq.items.${i}.q`),
    a: t(`faq.items.${i}.a`),
  }));

  const textAlign = "text-left";

  return (
    <section id="faq" className="py-20 bg-background scroll-mt-20">
      <div className="container max-w-3xl px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            {t("faq.headline")}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("faq.headlineAccent")}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("faq.subtext")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border bg-card px-4 sm:px-5 shadow-sm data-[state=open]:shadow-card"
              >
                <AccordionTrigger className={`${textAlign} text-[15px] font-semibold text-foreground hover:no-underline py-4`}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className={`${textAlign} text-muted-foreground text-sm leading-relaxed pb-4`}>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
