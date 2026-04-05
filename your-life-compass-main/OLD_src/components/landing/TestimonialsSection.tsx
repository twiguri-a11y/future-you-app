import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
    ))}
  </div>
);

const TestimonialCard = ({
  testimonial,
  index,
}: {
  testimonial: { name: string; role: string; quote: string };
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex-shrink-0 w-[320px] md:w-[360px]"
    >
      <motion.div
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="h-full rounded-2xl bg-card border border-border p-7 shadow-card hover:shadow-elevated transition-shadow duration-300"
      >
        <StarRating count={5} />
        <p className="text-foreground/90 leading-relaxed mb-5 text-[15px]">
          "{testimonial.quote}"
        </p>
        <div>
          <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
          <p className="text-muted-foreground text-xs">{testimonial.role}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const { t } = useLanguage();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number>();

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  // Auto-scroll animation
  const autoScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isHovered) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (el.scrollLeft >= maxScroll - 1) {
      el.scrollLeft = 0;
    } else {
      el.scrollLeft += 0.8;
    }
    checkScroll();
    animationRef.current = requestAnimationFrame(autoScroll);
  }, [isHovered]);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, []);

  // Start/stop auto-scroll based on hover
  useEffect(() => {
    if (!isHovered) {
      animationRef.current = requestAnimationFrame(autoScroll);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isHovered, autoScroll]);

  // Build testimonials from translations
  const testimonials = Array.from({ length: 9 }, (_, i) => ({
    name: t(`testimonials.items.${i}.name`),
    role: t(`testimonials.items.${i}.role`),
    quote: t(`testimonials.items.${i}.quote`),
  }));

  return (
    <section id="testimonials" className="py-24 bg-muted/30 overflow-hidden scroll-mt-20">
      <div className="container">
        <div ref={headerRef} className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3"
          >
            {t("testimonials.badge")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-3xl md:text-5xl font-bold"
          >
            {t("testimonials.headline")}
          </motion.h2>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide px-[max(1rem,calc((100vw-1280px)/2+1rem))] pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, i) => (
            <TestimonialCard key={i} testimonial={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
