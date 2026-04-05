import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl gradient-hero p-12 md:p-20 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Meet the person you are becoming
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            5 minutes. No fluff. Just you — talking to the version of yourself who already figured it out.
          </p>
          <Link to="/auth">
            <Button variant="warm" size="xl">
              Start Becoming
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
