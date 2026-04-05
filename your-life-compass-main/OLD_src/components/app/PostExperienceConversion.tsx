import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PostExperienceConversionProps {
  onDismiss: () => void;
}

const BENEFITS = [
  { icon: Eye, text: "Revisit your future anytime" },
  { icon: Compass, text: "Stay aligned daily" },
  { icon: Sparkles, text: "Continue becoming this version of you" },
];

const PostExperienceConversion = ({ onDismiss }: PostExperienceConversionProps) => {
  const navigate = useNavigate();
  const [showSecondLine, setShowSecondLine] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSecondLine(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-[70vh] flex flex-col justify-center items-center text-center px-2"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mb-10"
      >
        <p className="text-lg text-foreground/80 font-light leading-relaxed">
          You can come back to this anytime.
        </p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={showSecondLine ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={{ duration: 0.7 }}
          className="text-lg text-foreground/60 font-light leading-relaxed mt-3"
        >
          Or… you can lose it.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.7 }}
      >
        <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-6 h-6 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-3 text-foreground">
          Stay connected to who you're becoming.
        </h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed">
          You've already started shifting.{"\n"}Don't disconnect now.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8, duration: 0.6 }}
        className="space-y-4 mb-10 w-full max-w-xs"
      >
        {BENEFITS.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 3.0 + i * 0.15, duration: 0.5 }}
            className="flex items-center gap-3 text-left"
          >
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <b.icon className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm text-foreground/80">{b.text}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.6, duration: 0.6 }}
        className="w-full max-w-xs space-y-4"
      >
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={() => navigate("/auth")}
        >
          Continue Becoming
          <ArrowRight className="w-4 h-4" />
        </Button>

        <button
          onClick={onDismiss}
          className="text-sm text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          Maybe later
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 0.8 }}
        className="text-xs text-muted-foreground/35 italic mt-10"
      >
        Don't lose this version of yourself.
      </motion.p>
    </motion.div>
  );
};

export default PostExperienceConversion;
