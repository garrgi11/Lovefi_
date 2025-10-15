import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import UserInfoPage from "./pages/UserInfoPage";
import GenderSelectionPage from "./pages/GenderSelectionPage";
import LocationSelectionPage from "./pages/LocationSelectionPage";
import SexualitySelectionPage from "./pages/SexualitySelectionPage";
import PersonalInterestsPage from "./pages/PersonalInterestsPage";
import PartnerPreferencesPage from "./pages/PartnerPreferencesPage";
import PhotoUploadPage from "./pages/PhotoUploadPage";
import MatchingPage from "./pages/MatchingPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import RelationshipNFTPage from "./pages/RelationshipNFTPage";
import CouplesDashboardPage from "./pages/CouplesDashboardPage";
import MilestonesPage from "./pages/MilestonesPage";
import ChallengesPage from "./pages/ChallengesPage";
import FriendsPredictionsPage from "./pages/FriendsPredictionsPage";
import RouteGuard from "./components/RouteGuard";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/user-info" element={<UserInfoPage />} />
          <Route path="/gender-selection" element={<GenderSelectionPage />} />
          <Route
            path="/location-selection"
            element={<LocationSelectionPage />}
          />
          <Route
            path="/sexuality-selection"
            element={<SexualitySelectionPage />}
          />
          <Route
            path="/personal-interests"
            element={<PersonalInterestsPage />}
          />
          <Route
            path="/partner-preferences"
            element={<PartnerPreferencesPage />}
          />
          <Route path="/photo-upload" element={<PhotoUploadPage />} />
          <Route
            path="/matching"
            element={
              <RouteGuard requireSingles={true}>
                <MatchingPage />
              </RouteGuard>
            }
          />
          <Route
            path="/messages"
            element={
              <RouteGuard requireSingles={true}>
                <MessagesPage />
              </RouteGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <RouteGuard requireSingles={true}>
                <ProfilePage />
              </RouteGuard>
            }
          />
          <Route path="/relationship-nft" element={<RelationshipNFTPage />} />
          <Route
            path="/couples-dashboard"
            element={
              <RouteGuard requireCouples={true}>
                <CouplesDashboardPage />
              </RouteGuard>
            }
          />
          <Route
            path="/milestones"
            element={
              <RouteGuard requireCouples={true}>
                <MilestonesPage />
              </RouteGuard>
            }
          />
          <Route
            path="/challenges"
            element={
              <RouteGuard requireCouples={true}>
                <ChallengesPage />
              </RouteGuard>
            }
          />
          <Route
            path="/friends-predictions"
            element={
              <RouteGuard requireCouples={true}>
                <FriendsPredictionsPage />
              </RouteGuard>
            }
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <Toaster />
            <Sonner />
            <AnimatedRoutes />
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root")!;

// Improved hot module reload handling
if (import.meta.hot) {
  // Clear any existing React root to prevent conflicts
  if ((rootElement as any)._reactRootContainer) {
    (rootElement as any)._reactRootContainer.unmount();
    delete (rootElement as any)._reactRootContainer;
  }

  // Create fresh root for hot reload
  const root = createRoot(rootElement);
  (rootElement as any)._reactRootContainer = root;
  root.render(<App />);

  // Accept hot updates for this module
  import.meta.hot.accept();
} else {
  // In production, create root normally
  const root = createRoot(rootElement);
  root.render(<App />);
}
