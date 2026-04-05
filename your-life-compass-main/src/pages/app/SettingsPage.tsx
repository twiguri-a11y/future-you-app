import { motion } from "framer-motion";
import { User, Bell, CreditCard, Shield, Download, LogOut, ChevronRight, Globe, ImagePlus, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import HeroBackgroundUpload from "@/components/app/HeroBackgroundUpload";

const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
];

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isPremium, openUpgrade } = usePremium();
  const navigate = useNavigate();
  const [showLangPicker, setShowLangPicker] = useState(false);

  const settingsGroups = [
    {
      title: t("settings.account"),
      items: [
        { icon: User, label: t("settings.profile"), desc: t("settings.profileDesc") },
        { icon: Bell, label: t("settings.notifications"), desc: t("settings.notificationsDesc") },
        { icon: CreditCard, label: t("settings.subscription"), desc: isPremium ? "Premium" : t("settings.subscriptionDesc"), action: isPremium ? undefined : () => openUpgrade("general") },
      ],
    },
    {
      title: t("settings.privacy"),
      items: [
        { icon: Shield, label: t("settings.privacyControls"), desc: t("settings.privacyDesc") },
        { icon: Download, label: t("settings.exportData"), desc: t("settings.exportDesc") },
      ],
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const currentLang = LANGUAGES.find((l) => l.value === language);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        {user?.email && (
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        )}
      </motion.div>

      {settingsGroups.map((group, gi) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.1 }}
          className="mb-6"
        >
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            {group.title}
          </h2>
          <div className="rounded-2xl bg-card shadow-card overflow-hidden divide-y divide-border">
            {group.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Language Picker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          {t("settings.language")}
        </h2>
        <div className="rounded-2xl bg-card shadow-card overflow-hidden">
          <button
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Globe className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t("settings.language")}</p>
              <p className="text-xs text-muted-foreground">
                {currentLang?.flag} {currentLang?.label}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showLangPicker ? "rotate-90" : ""}`} />
          </button>

          {showLangPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border-t border-border"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    setLanguage(lang.value);
                    setShowLangPicker(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    language === lang.value
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                  {language === lang.value && (
                    <span className="ml-auto text-xs font-bold text-primary">✓</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Hero Background Upload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3 px-1">
          Hero Background
        </h2>
        <HeroBackgroundUpload />
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 text-destructive text-sm font-semibold py-3 rounded-2xl hover:bg-destructive/5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {t("settings.signOut")}
      </motion.button>
    </div>
  );
};

export default SettingsPage;
