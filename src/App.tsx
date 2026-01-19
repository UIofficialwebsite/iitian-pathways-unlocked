import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BackendIntegratedWrapper } from "@/components/BackendIntegratedWrapper";
import ScrollPersistence from "@/components/ScrollPersistence";
import { Suspense, lazy } from "react";

// Lazy Load Pages for Performance
const Index = lazy(() => import("./pages/Index"));
// REMOVED: const Auth = lazy(() => import("./pages/Auth")); 
const CourseListing = lazy(() => import("./pages/CourseListing"));
const Courses = lazy(() => import("./pages/Courses"));
const ExamPreparation = lazy(() => import("./pages/ExamPreparation"));
const JEEPrep = lazy(() => import("./pages/JEEPrep"));
const NEETPrep = lazy(() => import("./pages/NEETPrep"));
const IITMBSPrep = lazy(() => import("./pages/IITMBSPrep"));
const IITMBSSubjectNotesPage = lazy(() => import("./pages/IITMBSSubjectNotesPage"));
const Career = lazy(() => import("./pages/Career"));
const CareerOpportunities = lazy(() => import("./pages/CareerOpportunities"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const About = lazy(() => import("./pages/About"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const BatchConfiguration = lazy(() => import("./pages/BatchConfiguration")); 
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileComplete = lazy(() => import("./pages/ProfileComplete"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"));
const StudentGoogleCallback = lazy(() => import("./pages/StudentGoogleCallback"));
const AdminGoogleCallback = lazy(() => import("./pages/AdminGoogleCallback"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const InternVerification = lazy(() => import("./pages/InternVerification"));
const EmployeeVerification = lazy(() => import("./pages/EmployeeVerification"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const FAQ = lazy(() => import("./pages/FAQ"));
const IITMCalculators = lazy(() => import("./pages/IITMCalculators"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));

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
            
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]">
                Loading...
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* REMOVED: <Route path="/auth" element={<Auth />} /> */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* Courses */}
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/category/:examCategory" element={<Courses />} />
                <Route path="/courses/listing/:examCategory" element={<CourseListing />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/courses/:courseId/configure" element={<BatchConfiguration />} />
                
                {/* Exam Prep */}
                <Route path="/exam-preparation" element={<ExamPreparation />} />
                <Route path="/exam-preparation/jee/*" element={<JEEPrep />} />
                <Route path="/exam-preparation/neet/*" element={<NEETPrep />} />
                
                {/* IITM BS ROUTES */}
                <Route path="/exam-preparation/iitm-bs/notes/:branch/:level/:subjectSlug" element={<IITMBSSubjectNotesPage />} />
                <Route path="/exam-preparation/iitm-bs/*" element={<IITMBSPrep />} />
                <Route path="/news/:newsId" element={<NewsDetail />} />
                
                <Route path="/iitm-tools/:tool?/:branch?/:level?" element={<IITMCalculators />} />
                
                {/* CAREER ROUTES */}
                <Route path="/career" element={<Career />} />
                <Route path="/career/openings" element={<CareerOpportunities />} />
                <Route path="/career/job/:jobId" element={<JobDetails />} />
                
                <Route path="/about" element={<About />} />
                
                {/* DASHBOARD ROUTE */}
                <Route path="/dashboard/:tab?" element={<Dashboard />} />
                
                {/* Callbacks & Verification */}
                <Route path="/profile/complete" element={<ProfileComplete />} />
                <Route path="/auth/callback" element={<GoogleCallback />} />
                <Route path="/auth/student/callback" element={<StudentGoogleCallback />} />
                <Route path="/auth/admin/callback" element={<AdminGoogleCallback />} />
                
                {/* Admin */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                
                {/* Footer / Legal */}
                <Route path="/intern-verification" element={<InternVerification />} />
                <Route path="/employee-verification" element={<EmployeeVerification />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/faq" element={<FAQ />} />
                
                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </BackendIntegratedWrapper>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
