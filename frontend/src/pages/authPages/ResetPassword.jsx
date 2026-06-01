import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { RoutePath } from "@/enum/routePath";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { fetchData, error, loading } = useAxios();

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, "Must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => {
      if (!email) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Email missing, please try again",
          confirmButtonColor: "#2b4c91",
        });
        return;
      }

      console.log("[v0] Resetting password for email:", email);
      const result = await fetchData({
        url: "/reset-password",
        method: HttpMethod.POST,
        data: { email, newPassword: values.password },
      });

      if (result && !error) {
        Swal.fire({
          icon: "success",
          title: "Password Reset!",
          text: "Your password has been successfully reset",
          confirmButtonColor: "#2b4c91",
        }).then(() => {
          navigate(RoutePath.LOGIN);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text:
            typeof error === "string"
              ? error
              : error?.message || "Could not reset password",
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
            <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
            <p className="text-muted-foreground mb-8">
              Create a new password for your account
            </p>

            <form onSubmit={formik.handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {typeof error === "string" ? error : error?.message}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-12 pr-12 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters.
                </p>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-destructive text-sm mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  Re-enter Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-12 pr-12 py-3.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={loading || formik.isSubmitting}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-accent transition-all"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
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
              <h2 className="text-4xl font-bold mb-4">Create New Password</h2>
              <p className="text-lg text-white/90">
                Set a strong password to secure your account
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
