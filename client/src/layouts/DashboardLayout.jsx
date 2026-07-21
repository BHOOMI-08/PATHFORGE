import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { NAVIGATION_LINKS } from "../constants/navigation.js";
import * as Icons from "lucide-react";

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

  const dropdownRef = useRef(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  // Compute breadcrumbs from active path
  const pathParts = location.pathname.split("/").filter((part) => part);
  const breadcrumbs = pathParts.map((part, index) => {
    const path = `/${pathParts.slice(0, index + 1).join("/")}`;
    const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    const isLast = index === pathParts.length - 1;
    return { label, path, isLast };
  });

  // Get active route label
  const activeRouteLabel =
    NAVIGATION_LINKS.find((link) => link.path === location.pathname)?.label ||
    "Dashboard";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background-darker text-slate-100 font-sans">
      {/* 1. Backdrop Overlay for Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 2. Left Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static
          ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
          ${isMobileSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 overflow-hidden"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-accent text-slate-100 font-extrabold text-xl shadow-lg">
              PF
            </div>
            {!isSidebarCollapsed && (
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent truncate">
                PathForge AI
              </span>
            )}
          </Link>
          {/* Collapse sidebar button (Desktop only) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
          >
            {isSidebarCollapsed ? (
              <Icons.ChevronRight size={16} />
            ) : (
              <Icons.ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1.5 px-3">
          {NAVIGATION_LINKS.map((link) => {
            const isActive =
              location.pathname === link.path ||
              (link.path !== "/dashboard" && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileSidebarOpen(false)}
                className={`flex items-center rounded-lg py-2.5 transition-all duration-200 group relative
                  ${isSidebarCollapsed ? "justify-center px-0" : "px-3 space-x-3"}
                  ${
                    isActive
                      ? "bg-primary/10 text-primary-light font-semibold border-l-4 border-primary-light"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }
                `}
              >
                <NavIcon name={link.iconName} className="shrink-0" />
                {!isSidebarCollapsed && <span className="truncate">{link.label}</span>}

                {/* Collapsed Tooltip helper */}
                {isSidebarCollapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Info (Only when expanded) */}
        {!isSidebarCollapsed && user && (
          <div className="p-4 border-t border-slate-800 flex items-center space-x-3 overflow-hidden bg-slate-950/20">
            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-primary-light">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </aside>

      {/* 3. Main Outer Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 w-full items-center justify-between px-6 bg-slate-900/60 border-b border-slate-800 backdrop-blur-md shrink-0">
          <div className="flex items-center space-x-4">
            {/* Hamburger trigger for mobile sidebar */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 focus:outline-none"
            >
              <Icons.Menu size={20} />
            </button>

            {/* Breadcrumbs / Page context */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-400">
              <span className="hover:text-slate-300 transition-colors">
                PathForge
              </span>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.path} className="flex items-center space-x-2">
                  <Icons.ChevronRight size={14} className="text-slate-600" />
                  <span
                    className={
                      crumb.isLast
                        ? "text-slate-200 font-semibold cursor-default"
                        : "hover:text-slate-300 transition-colors"
                    }
                  >
                    {crumb.label}
                  </span>
                </div>
              ))}
            </div>
            <h1 className="md:hidden font-display font-semibold text-slate-200">
              {activeRouteLabel}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Static Notification Bell trigger */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 focus:outline-none transition-colors">
              <Icons.Bell size={18} />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-accent-light" />
            </button>

            {/* User Profile dropdown wrapper */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none rounded-lg p-1 hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-100 shadow-md">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <Icons.ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile menu dropdown container */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl z-50">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-500 font-medium">Logged in as</p>
                      <p className="text-sm font-semibold text-slate-200 truncate">
                        {user.name}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                    >
                      <Icons.User size={16} />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
                    >
                      <Icons.Settings size={16} />
                      <span>App Configuration</span>
                    </Link>
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
                    >
                      <Icons.LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Inner Layout Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
