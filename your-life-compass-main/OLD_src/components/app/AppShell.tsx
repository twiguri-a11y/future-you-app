import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, Route, CalendarCheck, Eye, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MinimalNav from "@/components/MinimalNav";
import { useSyncOnboarding } from "@/hooks/useSyncOnboarding";

const tabs = [
  { to: "/app", icon: Home, label: "Home", exact: true },
  { to: "/app/path", icon: Route, label: "Path" },
  { to: "/app/daily", icon: CalendarCheck, label: "Daily" },
  { to: "/app/vision", icon: Eye, label: "Vision" },
  { to: "/app/chat", icon: MessageCircle, label: "Future Self" },
];

const AppShell = () => {
  const location = useLocation();
  useSyncOnboarding();

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MinimalNav variant="solid" />

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/60">
        <div className="flex items-stretch h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const active = isActive(tab.to, tab.exact);
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative min-w-0"
              >
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="bottom-tab"
                      className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-secondary"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </AnimatePresence>

                <tab.icon
                  className={`w-[18px] h-[18px] stroke-[1.5] transition-colors duration-200 ${
                    active ? "text-secondary" : "text-muted-foreground/70"
                  }`}
                />

                <span
                  className={`text-[9px] font-body font-medium tracking-wide transition-colors duration-200 ${
                    active ? "text-secondary" : "text-muted-foreground/70"
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
