import { useEffect } from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/ui/LoadingSpinner.jsx";
import { api } from "../utils/api";

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

// Home View
const Home = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Client-Server end-to-end handshake verification call
    api.get("/")
      .then((data) => {
        console.log("==========================================");
        console.log("Client-Server Handshake Connection: SUCCESS");
        console.log("Backend Response:", data);
        console.log("==========================================");
      })
      .catch((err) => {
        console.error("==========================================");
        console.error("Client-Server Handshake Connection: FAILED");
        console.error("Error Description:", err.message);
        console.error("==========================================");
      });
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <h1 className="text-6xl font-display font-extrabold tracking-tight bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent animate-fade-in">
        PathForge AI
      </h1>
      <p className="mt-4 text-slate-400 max-w-md text-center text-lg animate-slide-up">
        Your AI-powered resume auditing and career guidance platform.
      </p>
      <div className="mt-8 flex space-x-4 animate-fade-in">
        <Link
          to="/login"
          className="px-6 py-3 bg-primary rounded-lg font-semibold text-slate-100 hover:bg-primary-light transition-all shadow-lg"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-slate-800 rounded-lg font-semibold text-slate-100 hover:bg-slate-700 transition-all border border-slate-700"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

// Dashboard Sub-Views placeholders
const DashboardHome = () => (
  <div className="space-y-6 animate-scale-in">
    <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
      <h2 className="text-2xl font-display font-semibold text-slate-100">
        Workspace Dashboard
      </h2>
      <p className="text-slate-400 mt-2">
        Welcome to your PathForge AI career management workspace. Use the navigation links in the sidebar to build your career roadmap, audit your resume, analyze job matches, and interface with our AI mentoring agents.
      </p>
    </div>
  </div>
);

const DashboardPlaceholder = ({ title }) => (
  <div className="space-y-6 animate-scale-in">
    <div className="bg-slate-900/40 p-8 rounded-2xl border border-slate-800 backdrop-blur-md">
      <h2 className="text-2xl font-display font-semibold text-slate-100">
        {title}
      </h2>
      <p className="text-slate-400 mt-2">
        The {title} integration features are scheduled for development in upcoming sprint milestones.
      </p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
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
        <Route path="resumes" element={<DashboardPlaceholder title="Resume Manager" />} />
        <Route path="ats" element={<DashboardPlaceholder title="ATS Analyzer" />} />
        <Route path="jobs" element={<DashboardPlaceholder title="Job Matcher" />} />
        <Route path="roadmap" element={<DashboardPlaceholder title="Career Roadmap" />} />
        <Route path="mentor" element={<DashboardPlaceholder title="AI Mentor Agent" />} />
        <Route path="analytics" element={<DashboardPlaceholder title="Workspace Analytics" />} />
        <Route path="settings" element={<DashboardPlaceholder title="App Configuration" />} />
        <Route path="profile" element={<DashboardPlaceholder title="Profile Settings" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
