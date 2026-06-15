import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
  const userRef = useRef(null);
  const logoutInProgressRef = useRef(false);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const isAuthenticated = !!user;

  const handleSessionExpired = useCallback(() => {
    const wasLoggedIn = !!userRef.current;
    setUser(null);
    setInitialized(true);

    if (wasLoggedIn) {
      navigate(RoutePath.LOGIN, {
        replace: true,
        state: { sessionExpired: true },
      });
    }
  }, [navigate]);

  const { fetchData } = useAxios(handleSessionExpired);

  const initializeAuth = useCallback(async () => {
    if (initialized || initInProgress) return;

    setInitInProgress(true);
    try {
      const result = await fetchData({
        url: "/profile",
        method: "get",
      });

      if (result?.user) {
        setUser(result.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setInitialized(true);
      setInitInProgress(false);
    }
  }, [fetchData, initialized, initInProgress]);

  useEffect(() => {
    initializeAuth();
  }, []);

  const logout = useCallback(async () => {
    if (logoutInProgressRef.current) return;
    logoutInProgressRef.current = true;

    try {
      await fetchData({
        url: "/logout",
        method: "post",
      });
    } catch {
      // Session may already be invalid — still clear local state.
    } finally {
      setUser(null);
      setInitialized(true);
      navigate(RoutePath.ATTENDEE, { replace: true });
      logoutInProgressRef.current = false;
    }
  }, [fetchData, navigate]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchData({
        url: "/profile",
        method: "get",
      });

      if (result?.user) {
        setUser(result.user);
        setInitialized(true);
        return result;
      }
      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

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
