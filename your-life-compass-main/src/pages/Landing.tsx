import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MinimalNav from "@/components/MinimalNav";

const Landing = () => {
  return (
    <div className="landing-hero-page relative min-h-screen flex flex-col overflow-hidden bg-[#1A2B3C]">
      {/* Nav */}
      <div className="relative z-20">
        <MinimalNav variant="transparent" />
      </div>

      {/* Hero — midnight blue panel; headings styled in index.css */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 py-12 max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.12]"
        >
          Meet who you're becoming
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 text-white/90 text-base md:text-lg font-normal max-w-md leading-relaxed font-body"
        >
          Your future self already exists. This is where you begin.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-12 w-full flex justify-center"
        >
          <Link
            to="/quiz"
            className="inline-flex items-center justify-center min-h-[3.5rem] sm:min-h-[3.75rem] px-10 sm:px-14 py-4 rounded-full bg-[#F28C28] hover:bg-[#e07e20] active:bg-[#d97316] text-white font-bold text-lg sm:text-xl tracking-wide shadow-[0_6px_28px_rgba(242,140,40,0.5)] ring-2 ring-white/25 hover:ring-white/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F28C28]"
          >
            Enter My Future
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
