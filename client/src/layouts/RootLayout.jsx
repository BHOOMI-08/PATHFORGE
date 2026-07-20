import { Outlet, Link } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background-darker text-slate-100 font-sans">
      {/* Responsive Header */}
      <header className="border-b border-slate-800 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-display font-extrabold tracking-tight bg-gradient-to-r from-primary-light to-accent-light bg-clip-text text-transparent">
              PathForge AI
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">Features</span>
            <span className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">About</span>
            <span className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors cursor-pointer">Contact</span>
          </nav>
        </div>
      </header>

      {/* Main Content Nested Route View */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-background-dark/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PathForge AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
