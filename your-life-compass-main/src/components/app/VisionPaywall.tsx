import { motion } from "framer-motion";
import { Sparkles, Eye, Compass, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onContinue: () => void;
}

const VisionPaywall = ({ onContinue }: Props) => {
  const benefits = [
    { icon: Eye, text: "Revisit your future anytime" },
    { icon: Compass, text: "Stay aligned daily" },
    { icon: Sun, text: "Continue becoming this version of you" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-[70vh] flex flex-col justify-center items-center text-center px-2"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mb-8"
      >
        <Sparkles className="w-7 h-7 text-primary-foreground" />
      </motion.div>

      <motion.h2
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="text-2xl font-bold mb-3 text-foreground"
      >
        Stay connected to who you're becoming.
      </motion.h2>

      <motion.p
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="text-sm text-muted-foreground mb-10 max-w-xs leading-relaxed"
      >
        You've already started shifting.{"\n"}Don't disconnect now.
      </motion.p>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className="space-y-4 mb-10 w-full max-w-xs"
      >
        {benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.1 + i * 0.12, duration: 0.5 }}
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
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="w-full max-w-xs space-y-4"
      >
        <Button variant="hero" size="lg" className="w-full" onClick={onContinue}>
          Continue Becoming — $10/mo
        </Button>
        <button className="text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          Maybe later
        </button>
      </motion.div>
    </motion.div>
  );
};

export default VisionPaywall;
