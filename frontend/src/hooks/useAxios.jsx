import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "@/enum/routePath";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api",
  withCredentials: true,
});


const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];
let logoutCallback = null;
let isLogoutInProgress = false;

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

const handleAuthFailure = () => {
  if (isLogoutInProgress) return;

  console.log("[v0] Auth failed - both tokens expired, triggering logout");
  isLogoutInProgress = true;

  if (logoutCallback) {
    logoutCallback();
  }
};

const useAxios = (logoutFn) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    logoutCallback = logoutFn;
  }, [logoutFn]);

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalRequest = err.config;

        if (originalRequest.url === "/logout" || originalRequest._retry) {
          console.log("[v0] Auth endpoint failed:", originalRequest.url);
          return Promise.reject(err);
        }

        if (
          (err.response?.status === 401 || err.response?.status === 403) &&
          !originalRequest._retry
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(() => axiosInstance(originalRequest))
              .catch((error) => {
                handleAuthFailure();
                return Promise.reject(error);
              });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log("[v0] Attempting token refresh...");
            const refreshResponse = await refreshAxios.post("/refresh-token");

            if (refreshResponse.status === 200) {
              console.log("[v0] Token refresh successful");
              isLogoutInProgress = false;
              processQueue(null);
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("[v0] Token refresh failed, both tokens expired");
            handleAuthFailure();
            processQueue(refreshError);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(err);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, []);

  const fetchData = async ({ url, method = "get", data = {}, params = {} }) => {
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
      const errMsg =
        err.response?.data?.message || err.response?.data || err.message;
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { response, error, loading, fetchData, axiosInstance };
};

export default useAxios;
