import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Globe } from "lucide-react";
import FutureYouLogo from "@/components/FutureYouLogo";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
];

interface NavbarProps {
  onLogoClick?: () => void;
}

const Navbar = ({ onLogoClick }: NavbarProps) => {
  const { t, language, setLanguage } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const [langOpen, setLangOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-lg border-b border-white/10" dir="ltr">
      <div className="container flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={onLogoClick} className="focus:outline-none shrink-0" aria-label="Change background">
            <FutureYouLogo size="sm" />
          </button>
          <Link to="/" className="font-display font-bold text-base sm:text-lg text-white whitespace-nowrap">
            Future You
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 lg:gap-6">
          <a href="#testimonials" className="hidden md:inline text-sm text-white/70 hover:text-white transition-colors font-medium">
            {t("nav.testimonials")}
          </a>
          <a href="#faq" className="hidden md:inline text-sm text-white/70 hover:text-white transition-colors font-medium">
            {t("nav.faq")}
          </a>

          {/* Language selector */}
          <div
            className="relative"
            onMouseEnter={() => setLangOpen(true)}
            onMouseLeave={() => setLangOpen(false)}
          >
            <button
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4 text-white/80" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 bg-card/95 backdrop-blur-lg border border-border rounded-lg shadow-lg py-1 min-w-[120px] z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        language === lang.code
                          ? "text-primary font-semibold bg-primary/10"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {resolvedTheme === "dark" ? (
                <motion.div key="sun" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.15 }}>
                  <Sun className="w-4 h-4 text-white/80" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: -90, scale: 0 }} transition={{ duration: 0.15 }}>
                  <Moon className="w-4 h-4 text-white/80" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* CTA */}
          <Link to={user ? "/app" : "/auth"}>
            <Button variant="hero" size="sm" className="text-[11px] sm:text-sm whitespace-nowrap px-2.5 sm:px-4">
              {user ? t("hero.ctaAuth") : t("nav.getStarted")}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
