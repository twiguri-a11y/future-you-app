import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-ocean.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Person standing on a balcony overlooking the ocean at golden hour"
          className="w-full h-full object-cover object-[50%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-2xl mx-auto text-center"
        >
          <p
            className="text-sm md:text-base uppercase tracking-[0.3em] font-light mb-8 mt-20"
            style={{ color: "rgba(230, 211, 163, 0.75)" }}
          >
            Future You
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
            <span className="text-white">Meet the person</span>
            <br />
            <span className="bg-gradient-to-r from-accent to-[hsl(200,70%,55%)] bg-clip-text text-transparent">
              you are becoming
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/65 max-w-sm mx-auto mb-12 font-body leading-relaxed whitespace-pre-line">
            {"Visualize your future self.\nAlign your actions.\nStep into who you're meant to become."}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Button variant="hero" size="xl">
                  Step Forward
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <a href="#features">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Button
                  variant="outline"
                  size="xl"
                  className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm"
                >
                  See How It Works
                </Button>
              </motion.div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
