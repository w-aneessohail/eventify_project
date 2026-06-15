"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { RoutePath } from "@/enum/routePath";
import { UserRole } from "@/enum/userRole";
import { HttpMethod } from "@/enum/httpMethod";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/utils/apiError";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo;
  const [loginError, setLoginError] = useState(() =>
    location.state?.sessionExpired
      ? "Your session has expired. Please sign in again."
      : null
  );
  const { setUser, setInitialized } = useAuth();
  const { fetchData, loading } = useAxios();

  const getPostLoginPath = (user) => {
    if (
      returnTo &&
      typeof returnTo === "string" &&
      returnTo.startsWith("/") &&
      user.role === UserRole.ATTENDEE &&
      returnTo.startsWith(RoutePath.ATTENDEE)
    ) {
      return returnTo;
    }
    if (user.role === UserRole.ATTENDEE) return RoutePath.ATTENDEE;
    if (user.role === UserRole.ORGANIZER) return RoutePath.ORGANIZER_DASHBOARD;
    if (user.role === UserRole.ADMIN) return RoutePath.ADMIN_DASHBOARD;
    return RoutePath.ATTENDEE;
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoginError(null);
      setSubmitting(true);

      const result = await fetchData({
        url: "/login",
        method: HttpMethod.POST,
        data: { email: values.email, password: values.password },
        errorContext: "login",
      });

      setSubmitting(false);

      if (result?.user) {
        setUser(result.user);
        setInitialized(true);
        navigate(getPostLoginPath(result.user), { replace: true });
        return;
      }

      const message = getFriendlyErrorMessage("Invalid credentials", "login");
      setLoginError(message);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: message,
        confirmButtonColor: "#2b4c91",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-12"
          >
            <form onSubmit={formik.handleSubmit}>
              {loginError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {loginError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-12 pr-10 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="email"
                  />
                  {formik.values.email && (
                    <X
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                      size={20}
                      onClick={() => formik.setFieldValue("email", "")}
                    />
                  )}
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-12 pr-12 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formik.values.rememberMe}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-foreground">
                    Remember me
                  </span>
                </label>
                <Link
                  to={RoutePath.FORGOT_PASSWORD}
                  className="text-sm text-foreground hover:text-primary"
                >
                  Forgot Password
                </Link>
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid || loading}
                className={`w-full py-3.5 rounded-xl font-semibold mb-6 transition-all hover-lift
                  ${
                    formik.isSubmitting || !formik.isValid || loading
                      ? "bg-primary/60 text-white cursor-not-allowed"
                      : "bg-primary text-white hover:bg-accent"
                  }`}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              <p className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  to={RoutePath.REGISTER}
                  className="text-foreground font-semibold hover:text-primary"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-concert-blue overflow-hidden"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1000&fit=crop"
                alt="Concert"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-concert-blue via-concert-blue/50 to-transparent"></div>
            </div>
            <div className="relative z-10 flex flex-col justify-center h-full p-12 text-white">
              <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
              <p className="text-lg text-white/90">
                Access your personal account by logging in
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
