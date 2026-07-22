import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { NAVIGATION_LINKS } from "../constants/navigation.js";
import * as Icons from "lucide-react";
import { getCareerDNA } from "../services/career.service.js";
import OnboardingWizard from "../components/forms/OnboardingWizard.jsx";

// Dynamic Lucide Icon Component Resolver
const NavIcon = ({ name, className }) => {
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent className={className} size={20} />;
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Component local states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showFirstTimeWizard, setShowFirstTimeWizard] = useState(false);

  const dropdownRef = useRef(null);

  // Check if Career DNA exists on initial login
  useEffect(() => {
    getCareerDNA()
      .then((res) => {
        if (!res.data?.careerDNA) {
          setShowFirstTimeWizard(true);
        }
      })
      .catch((err) => {
        console.error("Career DNA initial check error:", err);
      });
  }, []);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsProfileDropdownOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error("Sign out process error:", err);
    } finally {
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  // Compute breadcrumbs from active path
  const pathParts = location.pathname.split("/").filter((part) => part);
  const breadcrumbs = pathParts.map((part, index) => {
    const path = `/${pathParts.slice(0, index + 1).join("/")}`;
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    const isLast = index === pathParts.length - 1;
    return { label, path, isLast };
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#020817] text-slate-100 font-sans selection:bg-[#34D399]/30 selection:text-white">
      {/* 1. Backdrop Overlay for Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#020817]/80 backdrop-blur-md lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 2. Left Sidebar (Desktop Floating Glass Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#05101B]/90 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out lg:static
          ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
          ${isMobileSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-20 items-center justify-between px-5 border-b border-white/5">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 overflow-hidden group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#34D399] text-slate-950 font-black text-lg shadow-lg shadow-[#34D399]/20 group-hover:scale-105 transition-transform">
              PF
            </div>
            {!isSidebarCollapsed && (
              <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-[#A7F3D0] bg-clip-text text-transparent truncate">
                PathForge AI
              </span>
            )}
          </Link>

          {/* Collapse sidebar button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#041220] text-slate-400 hover:text-white hover:border-[#6EE7C8]/40 focus:outline-none transition-all"
          >
            {isSidebarCollapsed ? (
              <Icons.ChevronRight size={16} />
            ) : (
              <Icons.ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-5 space-y-1.5 px-3">
          {NAVIGATION_LINKS.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== "/dashboard" && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center rounded-2xl py-3 transition-all duration-200 group relative text-xs font-semibold
                  ${isSidebarCollapsed ? "justify-center px-0" : "px-4 space-x-3.5"}
                  ${
                    isActive
                      ? "bg-[#10263D] text-white font-bold border-l-4 border-[#A7F3D0] shadow-lg shadow-[#34D399]/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-[#071A2C]"
                  }
                `}
              >
                <NavIcon name={link.iconName} className={`shrink-0 ${isActive ? "text-[#34D399]" : "text-slate-400 group-hover:text-slate-200"}`} />
                {!isSidebarCollapsed && <span className="truncate">{link.label}</span>}

                {/* Collapsed Tooltip helper */}
                {isSidebarCollapsed && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-[#041220] border border-white/10 text-xs text-slate-200 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap shadow-xl">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Profile */}
        {!isSidebarCollapsed && user && (
          <div className="p-4 border-t border-white/5 flex items-center space-x-3 bg-[#041220]/60 backdrop-blur-md m-3 rounded-2xl border border-white/5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#34D399] flex items-center justify-center shrink-0 font-black text-slate-950 shadow-md">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </aside>

      {/* 3. Main Outer Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Sticky Header Bar */}
        <header className="relative flex h-20 w-full items-center justify-between px-6 bg-[rgba(5,16,27,0.75)] border-b border-white/5 backdrop-blur-xl shrink-0 z-30">
          <div className="flex items-center space-x-4">
            {/* Mobile Sidebar Hamburger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-[#071A2C] focus:outline-none"
            >
              <Icons.Menu size={20} />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-400">
              <span className="hover:text-slate-200 transition-colors">PathForge AI</span>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.path} className="flex items-center space-x-2">
                  <Icons.ChevronRight size={14} className="text-slate-600" />
                  <span className={crumb.isLast ? "text-slate-100 font-bold cursor-default" : "hover:text-slate-200 transition-colors"}>
                    {crumb.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar Input */}
            <div className="hidden sm:flex items-center relative">
              <Icons.Search size={16} className="absolute left-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search AI modules, jobs, roadmaps..."
                className="w-64 bg-[#041220]/80 border border-white/10 text-xs text-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#6EE7C8]"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#041220] text-slate-400 hover:text-white hover:border-[#34D399]/40 focus:outline-none transition-colors">
              <Icons.Bell size={18} />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#34D399]" />
            </button>

            {/* User Profile dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none rounded-xl p-1.5 hover:bg-[#071A2C] border border-transparent hover:border-white/10 transition-all"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#34D399] flex items-center justify-center font-bold text-xs text-slate-950 shadow-md">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <Icons.ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl border border-white/10 bg-[#10263D] p-2 shadow-2xl z-50 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</p>
                      <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#132D47] transition-colors"
                    >
                      <Icons.User size={15} />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#132D47] transition-colors"
                    >
                      <Icons.Settings size={15} />
                      <span>App Configuration</span>
                    </Link>
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors text-left disabled:opacity-50"
                    >
                      <Icons.LogOut size={15} />
                      <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Layout Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#020817]">
          <Outlet />
        </main>

        {/* First Time Career DNA Intercept Wizard Modal */}
        <OnboardingWizard
          isOpen={showFirstTimeWizard}
          isMandatory={true}
          onComplete={() => setShowFirstTimeWizard(false)}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;
