"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";
import { RoutePath } from "@/enum/routePath";
import { UserRole } from "@/enum/userRole";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { fetchData, error, loading } = useAxios();

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    role: Yup.string()
      .oneOf([UserRole.ATTENDEE, UserRole.ORGANIZER])
      .required("Role is required"),
    password: Yup.string()
      .min(8, "Must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),

    organizerDetails: Yup.object().when("role", (roleValue, schema) => {
      if (roleValue === UserRole.ORGANIZER) {
        return schema.shape({
          organizationName: Yup.string().required(
            "Organization name is required"
          ),
          organizerName: Yup.string().required("Organizer name is required"),
          cnic: Yup.string().required("CNIC is required"),
          phone: Yup.string().required("Phone is required"),
          address: Yup.string().required("Address is required"),
        });
      }
      return schema.shape({
        organizationName: Yup.string().notRequired(),
        organizerName: Yup.string().notRequired(),
        cnic: Yup.string().notRequired(),
        phone: Yup.string().notRequired(),
        address: Yup.string().notRequired(),
      });
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: UserRole.ATTENDEE,
      organizerDetails: {
        organizationName: "",
        organizerName: "",
        cnic: "",
        phone: "",
        address: "",
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      };

      if (values.role === UserRole.ORGANIZER) {
        payload.organizerDetails = values.organizerDetails;
      }

      console.log("[v0] Submitting registration:", payload);
      const result = await fetchData({
        url: "/register",
        method: HttpMethod.POST,
        data: payload,
      });

      if (result && !error) {
        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: "OTP has been sent to your email",
          confirmButtonColor: "#2b4c91",
        }).then(() => {
          navigate(RoutePath.VERIFY_OTP, {
            state: { email: values.email, purpose: "registration" },
          });
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: typeof error === "string" ? error : error?.message,
          confirmButtonColor: "#2b4c91",
        });
      }
    },
  });

  const touchedOrganizer = (field) =>
    formik.touched.organizerDetails && formik.touched.organizerDetails[field];
  const errorOrganizer = (field) =>
    formik.errors.organizerDetails && formik.errors.organizerDetails[field];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-9xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="p-8 lg:p-10"
          >
            <form onSubmit={formik.handleSubmit}>
              <div className="relative mb-4 flex items-center justify-center w-full">
                <h1 className="text-3xl font-bold">SIGNUP</h1>
              </div>

              {/* Grid: two inputs per row on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      aria-label="name"
                      type="text"
                      name="name"
                      placeholder="Full name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      aria-label="email"
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <select
                    aria-label="role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full pl-3 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={UserRole.ATTENDEE}>Attendee</option>
                    <option value={UserRole.ORGANIZER}>Organizer</option>
                  </select>
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.role}
                    </p>
                  )}
                </div>

                {/* Password (span both columns) */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      aria-label="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 8 characters.
                  </p>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-destructive text-sm mt-1">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      aria-label="confirm password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
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
              </div>

              {/* Organizer details */}
              {formik.values.role === UserRole.ORGANIZER && (
                <div className="mt-2 pt-6 ">
                  <h3 className="text-center text-xl md:text-2xl font-bold mb-5">
                    Organizer Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        aria-label="organization name"
                        name="organizerDetails.organizationName"
                        placeholder="Organization name"
                        value={formik.values.organizerDetails.organizationName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full pl-3 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {touchedOrganizer("organizationName") &&
                        errorOrganizer("organizationName") && (
                          <p className="text-destructive text-sm mt-1">
                            {errorOrganizer("organizationName")}
                          </p>
                        )}
                    </div>

                    <div>
                      <input
                        aria-label="organizer name"
                        name="organizerDetails.organizerName"
                        placeholder="Organizer name"
                        value={formik.values.organizerDetails.organizerName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full pl-3 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {touchedOrganizer("organizerName") &&
                        errorOrganizer("organizerName") && (
                          <p className="text-destructive text-sm mt-1">
                            {errorOrganizer("organizerName")}
                          </p>
                        )}
                    </div>

                    <div>
                      <input
                        aria-label="cnic"
                        name="organizerDetails.cnic"
                        placeholder="CNIC"
                        value={formik.values.organizerDetails.cnic}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full pl-3 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {touchedOrganizer("cnic") && errorOrganizer("cnic") && (
                        <p className="text-destructive text-sm mt-1">
                          {errorOrganizer("cnic")}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        aria-label="phone"
                        name="organizerDetails.phone"
                        placeholder="Phone"
                        value={formik.values.organizerDetails.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full pl-3 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {touchedOrganizer("phone") && errorOrganizer("phone") && (
                        <p className="text-destructive text-sm mt-1">
                          {errorOrganizer("phone")}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <input
                        aria-label="address"
                        name="organizerDetails.address"
                        placeholder="Address"
                        value={formik.values.organizerDetails.address}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full pl-3 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {touchedOrganizer("address") &&
                        errorOrganizer("address") && (
                          <p className="text-destructive text-sm mt-1">
                            {errorOrganizer("address")}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-accent transition-all hover-lift"
                >
                  Create an account
                </button>
              </div>

              <button
                type="button"
                className="w-full border-2 border-border py-3 rounded-xl font-medium hover:bg-secondary transition-all flex items-center justify-center space-x-2 mt-3"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link
                  to={RoutePath.LOGIN}
                  className="text-foreground font-semibold hover:text-primary"
                >
                  Log In
                </Link>
              </p>
            </form>
          </motion.div>

          {/* IMAGE PANEL: less overpowering, improved overlay & composition */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="relative hidden lg:block"
            aria-hidden="true"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&h=1800&fit=crop&q=80"
                alt="Concert"
                className="w-full h-full object-cover object-right"
                style={{ filter: "brightness(0.55) saturate(0.95)" }}
              />
              {/* Soft gradient to improve legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-transparent"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center h-full p-10 text-white">
              <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3">
                  Welcome Here
                </h2>
                <p className="text-sm lg:text-base text-white/90">
                  Create an account to make reservations
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
