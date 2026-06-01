"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { fetchData, error, loading } = useAxios();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      console.log("[v0] Sending forgot password request for:", values.email);
      const result = await fetchData({
        url: "/forgot-password",
        method: HttpMethod.POST,
        data: { email: values.email },
      });

      if (result && !error) {
        Swal.fire({
          icon: "success",
          title: "OTP Sent!",
          text: "Please check your email for the OTP code",
          confirmButtonColor: "#2b4c91",
        }).then(() => {
          navigate(RoutePath.VERIFY_OTP, {
            state: { email: values.email, purpose: "forgot-password" },
          });
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            typeof error === "string"
              ? error
              : error?.message || "Could not send OTP",
          confirmButtonColor: "#2b4c91",
        });
      }
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
            className="p-12 flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
            <p className="text-muted-foreground mb-8">
              Enter your email to receive OTP
            </p>

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
                    className="w-full pl-12 pr-4 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-destructive text-sm mt-1">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || formik.isSubmitting}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-accent transition-all hover-lift mb-6"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <p className="text-center text-sm">
                Remember your password?{" "}
                <Link
                  to={RoutePath.LOGIN}
                  className="text-primary font-semibold hover:text-accent"
                >
                  Back to Login
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
              <h2 className="text-4xl font-bold mb-4">Reset Password</h2>
              <p className="text-lg text-white/90">
                We'll send you an OTP to reset your password
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
