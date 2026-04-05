import { motion } from "framer-motion";

interface FutureYouLogoProps {
  size?: "sm" | "md";
  className?: string;
}

const FutureYouLogo = ({ size = "md", className = "" }: FutureYouLogoProps) => {
  const dim = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  return (
    <motion.div
      className={`${dim} rounded-2xl relative overflow-hidden flex items-center justify-center ${className}`}
      style={{
        background: "linear-gradient(135deg, hsl(249 82% 62%) 0%, hsl(200 72% 50%) 40%, hsl(170 62% 50%) 70%, hsl(43 96% 56%) 100%)",
        boxShadow:
          "0 3px 16px -3px hsla(249, 82%, 68%, 0.45), 0 0 0 1px hsla(0, 0%, 100%, 0.12) inset",
      }}
      whileHover={{ scale: 1.08, rotate: 2 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
    >
      {/* Inner glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 25%, hsla(0, 0%, 100%, 0.5), transparent 55%), radial-gradient(circle at 75% 80%, hsla(43, 96%, 56%, 0.25), transparent 50%)",
        }}
      />
      {/* Infinity-inspired F mark */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-5 h-5 relative z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized F with forward-leaning energy */}
        <path
          d="M10 7h12c1 0 1.5.5 1.5 1.2s-.5 1.3-1.5 1.3H13v4.5h7.5c.8 0 1.2.5 1.2 1.1s-.4 1.1-1.2 1.1H13v7.3c0 .9-.6 1.5-1.5 1.5s-1.5-.6-1.5-1.5V8.5C10 7.6 10.5 7 10 7z"
          fill="white"
          opacity="0.95"
        />
        {/* Accent sparkle */}
        <circle cx="24" cy="8" r="1.8" fill="white" opacity="0.7" />
        <circle cx="26" cy="11" r="1" fill="white" opacity="0.4" />
      </svg>
    </motion.div>
  );
};

export default FutureYouLogo;
