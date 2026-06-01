import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Navbar from "@/components/Navbar";
import { RoutePath } from "@/enum/routePath";
import useAxios from "@/hooks/useAxios";
import { HttpMethod } from "@/enum/httpMethod";

const VerifyOTP = () => {
  const location = useLocation();
  const { email, purpose } = location.state || {};
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const { fetchData, error, loading } = useAxios();

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length === 6) {
      console.log("[v0] Verifying OTP for email:", email);
      const result = await fetchData({
        url: "/verify-otp",
        method: HttpMethod.POST,
        data: { email, otp: otpValue },
      });

      if (result && !error) {
        Swal.fire({
          icon: "success",
          title: "OTP Verified!",
          text:
            purpose === "forgot-password"
              ? "Proceed to reset your password"
              : "Registration complete! Please login",
          confirmButtonColor: "#2b4c91",
        }).then(() => {
          if (purpose === "forgot-password") {
            navigate(RoutePath.RESET_PASSWORD, { state: { email } });
          } else if (purpose === "registration") {
            navigate(RoutePath.LOGIN);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "OTP Verification Failed",
          text:
            typeof error === "string" ? error : error?.message || "Invalid OTP",
          confirmButtonColor: "#2b4c91",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter all 6 digits",
        confirmButtonColor: "#2b4c91",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Left Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-12 flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
            <p className="text-muted-foreground mb-8">
              Enter the 6-digit code sent to {email}
            </p>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {typeof error === "string" ? error : error?.message}
                </div>
              )}

              <div className="flex justify-center space-x-3 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-accent transition-all mb-6"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  className="text-primary font-semibold hover:text-accent"
                >
                  Resend OTP
                </button>
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
              <h2 className="text-4xl font-bold mb-4">Verify Your Identity</h2>
              <p className="text-lg text-white/90">
                Enter the OTP code we sent to your email
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
