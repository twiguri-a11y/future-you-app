import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-card" dir="ltr">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-hero flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-sm">Future You</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Future You. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
