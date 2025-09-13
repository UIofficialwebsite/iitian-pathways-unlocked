// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BackendIntegratedWrapper } from "@/components/BackendIntegratedWrapper";
import EmailPopup from "@/components/EmailPopup";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import ExamPreparation from "./pages/ExamPreparation/ExamPreparation"; // <-- Updated Path
import Career from "./pages/Career";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import ProfileComplete from "./pages/ProfileComplete";
import GoogleCallback from "./pages/GoogleCallback";
import StudentGoogleCallback from "./pages/StudentGoogleCallback";
import AdminGoogleCallback from "./pages/AdminGoogleCallback";
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import InternVerification from "./pages/InternVerification";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BackendIntegratedWrapper>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <EmailPopup />
          <BrowserRouter>
            <Routes>
              {/* All your existing routes are preserved */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/career" element={<Career />} />
              <Route path="/about" element={<About />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/complete" element={<ProfileComplete />} />
              <Route path="/auth/callback" element={<GoogleCallback />} />
              <Route path="/auth/student/callback" element={<StudentGoogleCallback />} />
              <Route path="/auth/admin/callback" element={<AdminGoogleCallback />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/intern-verification" element={<InternVerification />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/faq" element={<FAQ />} />

              {/* === MODIFICATION START === */}
              {/* Replace the old exam prep routes with this single, nested route handler */}
              <Route path="/exam-preparation/*" element={<ExamPreparation />} />
              {/* === MODIFICATION END === */}

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BackendIntegratedWrapper>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
