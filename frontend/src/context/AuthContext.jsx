import { createContext, useContext, useState, useEffect } from "react";
import useAxios from "@/hooks/useAxios";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "@/enum/routePath";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [initInProgress, setInitInProgress] = useState(false);
  const navigate = useNavigate();
  let isLogoutInProgress = false;

  const isAuthenticated = !!user;

  const logoutHandler = async () => {
    if (isLogoutInProgress) return;
    isLogoutInProgress = true;

    try {
      console.log("[v0] Logging out");
      await axiosInstance.fetchData({
        url: "/logout",
        method: "post",
      });
    } catch (error) {
      console.log("[v0] Logout request failed or tokens already expired");
    } finally {
      setUser(null);
      setInitialized(false);
      navigate(RoutePath.ATTENDEE, { replace: true });
      isLogoutInProgress = false;
    }
  };

  const axiosInstance = useAxios(logoutHandler);

  const initializeAuth = async () => {
    if (initialized || initInProgress) return;

    setInitInProgress(true);
    try {
      console.log("[v0] Initializing auth - fetching profile...");

      const result = await axiosInstance.fetchData({
        url: "/profile",
        method: "get",
      });

      if (result?.user) {
        console.log("[v0] User profile fetched");
        setUser(result.user);
      } else {
        console.log("[v0] No valid session found");
        setUser(null);
      }
    } catch (error) {
      console.log("[v0] Not authenticated on init");
      setUser(null);
    } finally {
      setInitialized(true);
      setInitInProgress(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const logout = async () => {
    logoutHandler();
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const result = await axiosInstance.fetchData({
        url: "/profile",
        method: "get",
      });

      if (result?.user) {
        setUser(result.user);
        setInitialized(true);
        return result;
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("[v0] Failed to load profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        logout,
        loadProfile,
        loading,
        initialized,
        setInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
