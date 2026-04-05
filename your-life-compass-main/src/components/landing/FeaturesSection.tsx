import { motion } from "framer-motion";
import { Mic, Eye, Repeat, MessageCircle, TrendingUp, Shield } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Record Your Future Voice",
    description:
      "Read identity statements out loud — in your own voice. Not affirmations. Real words from the person you're becoming.",
  },
  {
    icon: Eye,
    title: "See Your Future Day",
    description:
      "AI generates a vivid snapshot of one day in the life you described. Not fantasy — a grounded picture of what's possible.",
  },
  {
    icon: Repeat,
    title: "30-Second Daily Ritual",
    description:
      "Pick your identity for the day. Choose one action. Reflect tonight. That's it. No journaling essays.",
  },
  {
    icon: MessageCircle,
    title: "Talk to Future You",
    description:
      "Ask real questions. Get honest answers from an AI shaped by your vision, values, and goals. No generic advice.",
  },
  {
    icon: TrendingUp,
    title: "Streak & Identity Tracking",
    description:
      "Watch your consistency build. Hit milestones. Get identity feedback that actually means something.",
  },
  {
    icon: Shield,
    title: "Private. Encrypted. Yours.",
    description:
      "Your vision stays yours. Full privacy, data encryption, and the ability to export or delete everything.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Not another goal-setting app.
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              An identity system.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Talk to your future self. Record your voice as them. Show up daily.
            Watch who you become.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group rounded-2xl bg-card p-8 shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
