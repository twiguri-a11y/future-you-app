import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const VisionMomentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const visionText = (location.state as { visionSummary?: string })?.visionSummary || "my best self";

  return (
    <div
      className="onboarding-root fixed inset-0 flex items-center justify-center px-4 pt-20 pb-12 overflow-y-auto"
      style={{ zIndex: 50 }}
    >
      {/* Soft radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(196,138,90,0.12) 0%, transparent 60%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.05) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[600px] text-center">
        {/* Small label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xs font-body font-medium tracking-[0.2em] uppercase mb-8"
          style={{ color: "#9B8E7E" }}
        >
          Your future self says
        </motion.p>

        {/* Main identity text */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.0, ease: "easeOut" }}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight italic"
          style={{ color: "#2B2A28", letterSpacing: "-0.02em" }}
        >
          "I am becoming {visionText}"
        </motion.h1>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.6, duration: 0.6, ease: "easeOut" }}
          className="mx-auto mt-10 mb-12 h-px w-16"
          style={{ background: "rgba(196,138,90,0.4)", transformOrigin: "center" }}
        />

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/vision-builder", { state: { visionSummary: visionText } })}
          className="onboarding-btn font-display font-medium text-base rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            padding: "16px 40px",
            boxShadow: "0 4px 24px rgba(31,31,31,0.18)",
          }}
        >
          Step into it
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default VisionMomentPage;
