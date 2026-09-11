import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/useAuth.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

// Lazy load page components for initial bundle optimization
const Register = lazy(() => import("../pages/Register"));
const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const ResumeManager = lazy(() => import("../pages/ResumeManager"));
const ATSAnalyzer = lazy(() => import("../pages/ATSAnalyzer"));
const JobMatcher = lazy(() => import("../pages/JobMatcher"));
const Roadmap = lazy(() => import("../pages/Roadmap"));
const AIMentor = lazy(() => import("../pages/AIMentor"));
const Analytics = lazy(() => import("../pages/Analytics"));
const RecruiterSimulator = lazy(() => import("../pages/RecruiterSimulator"));
const ResumeEvolution = lazy(() => import("../pages/ResumeEvolution"));
const OpportunityRadar = lazy(() => import("../pages/OpportunityRadar"));
const AICEOMode = lazy(() => import("../pages/AICEOMode"));
const ProfileSettings = lazy(() => import("../pages/ProfileSettings"));

const SuspenseLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
    <LoadingSpinner />
  </div>
);

// Reusable Protected Route Guard
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Reusable Public Only Route Guard
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<RootLayout />}>
          <Route
            index
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Dashboard Workspace */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="resumes" element={<ResumeManager />} />
          <Route path="ats" element={<ATSAnalyzer />} />
          <Route path="jobs" element={<JobMatcher />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="mentor" element={<AIMentor />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="recruiter" element={<RecruiterSimulator />} />
          <Route path="resume-evolution" element={<ResumeEvolution />} />
          <Route path="opportunity-radar" element={<OpportunityRadar />} />
          <Route path="ceo-mode" element={<AICEOMode />} />
          <Route path="settings" element={<ProfileSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

