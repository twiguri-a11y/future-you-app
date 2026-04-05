import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface PremiumContextType {
  isPremium: boolean;
  setPremium: (v: boolean) => void;
  dailyTaskLimit: number;
  showUpgradeModal: boolean;
  openUpgrade: (trigger?: string) => void;
  closeUpgrade: () => void;
  upgradeTrigger: string;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState("");

  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`premium_${user.id}`);
    if (stored === "true") setIsPremium(true);
  }, [user]);

  const setPremium = useCallback((v: boolean) => {
    setIsPremium(v);
    if (user) localStorage.setItem(`premium_${user.id}`, String(v));
  }, [user]);

  const openUpgrade = useCallback((trigger = "general") => {
    setUpgradeTrigger(trigger);
    setShowUpgradeModal(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setShowUpgradeModal(false);
    setUpgradeTrigger("");
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        setPremium,
        dailyTaskLimit: isPremium ? Infinity : 5,
        showUpgradeModal,
        openUpgrade,
        closeUpgrade,
        upgradeTrigger,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
};
