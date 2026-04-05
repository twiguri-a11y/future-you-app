import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import MinimalNav from "@/components/MinimalNav";
import heroImage from "@/assets/hero-landing.jpg";

const Landing = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Calm horizon"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.9) 100%)"
              : "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)",
          }}
        />
      </div>

      {/* Nav */}
      <div className="relative z-20">
        <MinimalNav variant="transparent" />
      </div>

      {/* Content — anchored to bottom */}
      <div className="relative z-10 flex-1 flex flex-col justify-end items-center text-center px-6 pb-[6vh] max-w-xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.15] tracking-tight"
        >
          Meet who you're becoming
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-7 text-white/85 text-lg md:text-xl font-light max-w-md leading-relaxed"
        >
          Your future self already exists. This is where you begin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-10"
        >
          <Link
            to="/onboarding"
            className="inline-block bg-white/90 text-black font-display font-medium text-[15px] px-8 py-3 rounded-full hover:bg-white transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
          >
            Start becoming
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
