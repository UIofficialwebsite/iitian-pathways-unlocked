import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BackendIntegratedWrapper } from "@/components/BackendIntegratedWrapper";
import ScrollPersistence from "@/components/ScrollPersistence";


// Page Imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CourseListing from "./pages/CourseListing";
import Courses from "./pages/Courses";
import ExamPreparation from "./pages/ExamPreparation";
import JEEPrep from "./pages/JEEPrep";
import NEETPrep from "./pages/NEETPrep";
import IITMBSPrep from "./pages/IITMBSPrep";
import IITMBSSubjectNotesPage from "./pages/IITMBSSubjectNotesPage"; // New Page Import
import Career from "./pages/Career";
import CareerOpportunities from "./pages/CareerOpportunities";
import JobDetails from "./pages/JobDetails";
import About from "./pages/About";
import CourseDetail from "./pages/CourseDetail";
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
import EmployeeVerification from "./pages/EmployeeVerification";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import FAQ from "./pages/FAQ";
import IITMCalculators from "./pages/IITMCalculators";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BackendIntegratedWrapper>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollPersistence />
            
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/category/:examCategory" element={<Courses />} />
              <Route path="/courses/listing/:examCategory" element={<CourseListing />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/exam-preparation" element={<ExamPreparation />} />
              <Route path="/exam-preparation/jee/*" element={<JEEPrep />} />
              <Route path="/exam-preparation/neet/*" element={<NEETPrep />} />
              
              {/* IITM BS ROUTES */}
              <Route path="/exam-preparation/iitm-bs/notes/:branch/:level/:subjectSlug" element={<IITMBSSubjectNotesPage />} />
              <Route path="/exam-preparation/iitm-bs/*" element={<IITMBSPrep />} />
              
              <Route path="/iitm-tools/:tool?/:branch?/:level?" element={<IITMCalculators />} />
              
              {/* CAREER ROUTES */}
              <Route path="/career" element={<Career />} />
              <Route path="/career/openings" element={<CareerOpportunities />} />
              <Route path="/career/job/:jobId" element={<JobDetails />} />
              
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
              <Route path="/employee-verification" element={<EmployeeVerification />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BackendIntegratedWrapper>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
