"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import { RoutePath } from "@/enum/routePath";
import { UserRole } from "@/enum/userRole";
import { HttpMethod } from "@/enum/httpMethod";
import useAxios from "@/hooks/useAxios";
import { useAuth } from "@/hooks/useAuth";

const performLogin = async (email, password, fetchData) => {
  console.log("[v0] Calling login API");
  const result = await fetchData({
    url: "/login",
    method: HttpMethod.POST,
    data: { email, password },
  });
  return result;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser, setInitialized } = useAuth();
  const { fetchData, error, loading, response } = useAxios();

  useEffect(() => {
    if (response?.user) {
      const { user } = response;
      console.log("[v0] Login successful, user:", user);
      setUser(user);
      setInitialized(true);

      if (user.role === UserRole.ATTENDEE) {
        navigate(RoutePath.ATTENDEE, { replace: true });
      } else if (user.role === UserRole.ORGANIZER) {
        navigate(RoutePath.ORGANIZER_DASHBOARD, { replace: true });
      } else if (user.role === UserRole.ADMIN) {
        navigate(RoutePath.ADMIN_DASHBOARD, { replace: true });
      }
    }
  }, [response, navigate, setUser, setInitialized]);

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
    onSubmit: async (values) => {
      console.log("[v0] Submitting login with credentials:", values.email);
      await performLogin(values.email, values.password, fetchData);

      if (error) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text:
            typeof error === "string"
              ? error
              : error?.message || "Invalid credentials",
          confirmButtonColor: "#2b4c91",
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-12"
          >
            <form onSubmit={formik.handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {typeof error === "string" ? error : error?.message}
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

              <button
                type="button"
                className="w-full border-2 border-border py-3.5 rounded-xl font-medium hover:bg-secondary transition-all flex items-center justify-center space-x-2 mb-6"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23s.43 3.45 1.18 4.93l2.85-2.84.81-.62z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
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

          {/* Right Side - Image */}
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
