import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ResumeManager from "../pages/ResumeManager";
import ATSAnalyzer from "../pages/ATSAnalyzer";
import JobMatcher from "../pages/JobMatcher";
import Roadmap from "../pages/Roadmap";
import AIMentor from "../pages/AIMentor";
import Analytics from "../pages/Analytics";
import RecruiterSimulator from "../pages/RecruiterSimulator";
import ResumeEvolution from "../pages/ResumeEvolution";
import OpportunityRadar from "../pages/OpportunityRadar";
import AICEOMode from "../pages/AICEOMode";
import ProfileSettings from "../pages/ProfileSettings";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/useAuth.js";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";

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
  );
};

export default AppRoutes;
