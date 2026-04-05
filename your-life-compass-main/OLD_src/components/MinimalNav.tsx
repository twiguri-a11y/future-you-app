import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import FutureYouLogo from "@/components/FutureYouLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "ru", label: "RU" },
];

interface MinimalNavProps {
  variant?: "transparent" | "solid";
}

const MinimalNav = ({ variant = "solid" }: MinimalNavProps) => {
  const { language, setLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const bg =
    variant === "transparent"
      ? "bg-transparent"
      : "bg-card/70 backdrop-blur-lg border-b border-border";

  const textColor =
    variant === "transparent" ? "text-primary-foreground" : "text-foreground";

  const mutedColor =
    variant === "transparent"
      ? "text-primary-foreground/70 hover:text-primary-foreground"
      : "text-muted-foreground hover:text-foreground";

  return (
    <header className={`sticky top-0 z-50 ${bg} transition-colors`}>
      <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
        {/* Left: Logo + Name */}
        <Link to="/" className="flex items-center gap-2">
          <FutureYouLogo size="sm" />
          <span
            className={`font-display font-semibold text-[13px] tracking-wide leading-none ${textColor}`}
          >
            Future You
          </span>
        </Link>

        {/* Right: Lang + Theme */}
        <div className="flex items-center gap-0.5">
          {/* Language dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-1 px-2 py-1.5 text-[11px] font-body font-medium rounded-md transition-colors ${mutedColor}`}
            >
              <Globe className="w-3 h-3" />
              <span>{language.toUpperCase()}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-1 w-20 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-[11px] font-body text-left transition-colors hover:bg-muted ${
                      language === l.code
                        ? "text-secondary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle
            className={`${
              variant === "transparent"
                ? "text-primary-foreground hover:bg-primary-foreground/10"
                : ""
            } h-7 w-7 [&_svg]:w-3.5 [&_svg]:h-3.5`}
          />
        </div>
      </div>
    </header>
  );
};

export default MinimalNav;
