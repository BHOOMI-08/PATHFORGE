import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin, logout as apiLogout, refresh as apiRefresh, getCurrentUser } from "../services/auth.service.js";
import { toast } from "react-hot-toast";
import { SESSION_EXPIRED_EVENT } from "../utils/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Single source of truth for loading and updating current user authentication state
  const fetchCurrentUser = async () => {
    setIsLoading(true);
    try {
      const response = await getCurrentUser();
      const loggedUser = response.data?.user || response.user;
      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch {
      // On failure/unauthorized error, attempt silent refresh
      try {
        await apiRefresh();
        const retryResponse = await getCurrentUser();
        const loggedUser = retryResponse.data?.user || retryResponse.user;
        setUser(loggedUser);
        setIsAuthenticated(true);
        return loggedUser;
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for backward compatibility
  const refreshUser = fetchCurrentUser;

  // Session restoration on initial application load
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      // Immediately call fetchCurrentUser after successful login instead of trusting returned payload directly
      const loggedUser = await fetchCurrentUser();
      toast.success(response.message || "Logged in successfully!");
      return loggedUser;
    } catch (error) {
      const msg = error.body?.message || error.message || "Login failed.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout backend call failed:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      toast.success("Logged out successfully.");
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        fetchCurrentUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
