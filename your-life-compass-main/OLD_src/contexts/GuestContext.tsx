import { createContext, useContext, useState, ReactNode } from "react";

interface GuestContextType {
  isGuest: boolean;
  setIsGuest: (v: boolean) => void;
  guestExperienceCompleted: boolean;
  setGuestExperienceCompleted: (v: boolean) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider = ({ children }: { children: ReactNode }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [guestExperienceCompleted, setGuestExperienceCompleted] = useState(false);

  return (
    <GuestContext.Provider
      value={{ isGuest, setIsGuest, guestExperienceCompleted, setGuestExperienceCompleted }}
    >
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) throw new Error("useGuest must be used within GuestProvider");
  return context;
};
