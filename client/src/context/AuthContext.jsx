import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout, getCurrentUser } from "../services/auth.service.js";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Default to true during startup validation

  // Function to fetch the current user's profile context from backend
  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      const loggedUser = response.data.user;
      setUser(loggedUser);
      setIsAuthenticated(true);
      return loggedUser;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for backward compatibility
  const refreshUser = fetchCurrentUser;

  // Perform handshake / session check on initial load
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      const loggedUser = response.data.user;
      setUser(loggedUser);
      setIsAuthenticated(true);
      toast.success(response.message || "Welcome back!");
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
      console.error("Logout backend notification error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      toast.success("Session closed successfully.");
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
        setUser,
        setIsAuthenticated,
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
