import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import OnboardingV2Page from "./pages/OnboardingV2Page";
import AppShell from "./components/app/AppShell";
import HomePage from "./pages/app/HomePage";
import PathPage from "./pages/app/PathPage";
import DailyPage from "./pages/app/DailyPage";
import VisionPage from "./pages/app/VisionPage";
import ChatPage from "./pages/app/ChatPage";
import DailyExperiencePage from "./pages/app/DailyExperiencePage";
import ContinuePathPage from "./pages/app/ContinuePathPage";
import DailyCompletionPage from "./pages/app/DailyCompletionPage";
import VisionBuilderPage from "./pages/VisionBuilderPage";
import VisionMomentPage from "./pages/VisionMomentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding-v2" element={<OnboardingV2Page />} />
          <Route path="/vision-builder" element={<VisionBuilderPage />} />
          <Route path="/vision-moment" element={<VisionMomentPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="path" element={<PathPage />} />
            <Route path="daily" element={<DailyPage />} />
            <Route path="vision" element={<VisionPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="experience" element={<DailyExperiencePage />} />
            <Route path="continue" element={<ContinuePathPage />} />
            <Route path="daily-complete" element={<DailyCompletionPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <ErrorBoundary>
              <AnimatedRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
