import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { getFriendlyErrorMessage } from "@/utils/apiError";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api",
  withCredentials: true,
});

const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api",
  withCredentials: true,
});

/** Auth routes must not trigger token refresh — wrong password is not an expired session. */
const NO_REFRESH_PATHS = new Set([
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/resend-otp",
  "/reset-password",
  "/refresh-token",
  "/logout",
]);

function shouldAttemptRefresh(url) {
  if (!url) return true;
  const path = String(url).split("?")[0];
  return !NO_REFRESH_PATHS.has(path);
}

let isRefreshing = false;
let failedQueue = [];
let sessionExpiredCallback = null;
let isSessionExpiryHandling = false;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleSessionExpired = () => {
  if (isSessionExpiryHandling) return;
  isSessionExpiryHandling = true;

  if (sessionExpiredCallback) {
    sessionExpiredCallback();
  }

  setTimeout(() => {
    isSessionExpiryHandling = false;
  }, 500);
};

let interceptorsReady = false;
function ensureInterceptors() {
  if (interceptorsReady) return;
  interceptorsReady = true;

  axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalRequest = err.config;

      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(err);
      }

      if (!shouldAttemptRefresh(originalRequest.url)) {
        return Promise.reject(err);
      }

      const status = err.response?.status;
      if (status !== 401 && status !== 403) {
        return Promise.reject(err);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((error) => Promise.reject(error));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await refreshAxios.post("/refresh-token");

        if (refreshResponse.status === 200) {
          processQueue(null);
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }

      return Promise.reject(err);
    }
  );
}

ensureInterceptors();

const useAxios = (onSessionExpired) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const onSessionExpiredRef = useRef(onSessionExpired);

  useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
    sessionExpiredCallback = () => {
      onSessionExpiredRef.current?.();
    };
  }, [onSessionExpired]);

  const fetchData = useCallback(
    async ({ url, method = "get", data = {}, params = {}, errorContext }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance({
          url,
          method,
          data,
          params,
          withCredentials: true,
        });
        setResponse(res.data);
        return res.data;
      } catch (err) {
        const raw =
          err.response?.data?.message || err.response?.data || err.message;
        const friendly = getFriendlyErrorMessage(
          raw,
          errorContext || (url === "/login" ? "login" : "default")
        );
        setError(friendly);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { response, error, loading, fetchData, axiosInstance };
};

export default useAxios;
