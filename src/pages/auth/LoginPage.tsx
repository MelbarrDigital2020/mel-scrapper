import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import AuthLayoutSplit from "./components/AuthLayoutSplit";
import SocialLoginButton from "./components/SocialLoginButton";
import PasswordInput from "./components/PasswordInput";
import MarketingPanel from "./components/MarketingPanel";
import AuthInput from "./components/AuthInput";
import OTPInput from "./components/OTPInput";
import Divider from "./components/Divider";
import Spinner from "../shared/components/Spinner";
import ResendOTPButton from "./components/ResendOTPButton";
import logo from "../../assets/logo.png";

import { FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Redirect to dashboard for already logged in user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        // ✅ User already logged in
        navigate("/app/dashboard", { replace: true });
      } catch {
        // ❌ Not logged in → stay on login page
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle Lofin button click
  const handleLogin = async () => {
    setError("");

    if (!email.trim()) return setError("Email is required");
    if (!email.includes("@"))
      return setError("Please enter a valid email address");
    if (!password.trim()) return setError("Password is required");

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { twoFaRequired, userId } = res.data.data;

      if (twoFaRequired) {
        setUserId(userId);
        setStep("otp");
      } else {
        navigate("/app/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");

    if (!userId) {
      setError("Invalid session. Please login again.");
      setStep("login");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/login/verify-otp", {
        userId,
        otp,
      });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userId) return;

    try {
      await api.post("/auth/login/resend-otp", { userId });
      alert("OTP resent successfully 🎉");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <AuthLayoutSplit
      left={
        <>
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Mel-Scrapper logo" className="h-16 w-auto" />
          </div>

          <h1 className="text-2xl text-center text-primary font-semibold mb-6">
            {step === "login" ? "Log in" : "Verify OTP"}
          </h1>

          {/* STEP 1: LOGIN FORM */}
          {step === "login" && (
            <div>
              {/* Social login always visible */}
              <div className="space-y-3">
                <SocialLoginButton
                  label="Log in with Google"
                  icon={<FcGoogle size={18} />}
                />
                <SocialLoginButton
                  label="Log in with Microsoft"
                  icon={<FaMicrosoft size={18} />}
                />
              </div>
              {/* Divider */}
              <Divider label="or" />
              {/* Login Form */}
              <div className="space-y-4">
                <AuthInput
                  label="Work Email"
                  type="email"
                  placeholder="you@company.com"
                  icon={<FiMail size={18} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <PasswordInput value={password} onChange={setPassword} />

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className={`w-full py-2 rounded-lg font-medium transition
                  flex items-center justify-center gap-2
                  ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-hover"
                  }`}
                >
                  {loading && <Spinner size={16} />}
                  <span>{loading ? "Logging in..." : "Log In"}</span>
                </button>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <span className="text-sm text-secondary">
                  Dont have an account? click hear to create{" "}
                  <Link to="/register" className="text-primary hover:underline">
                    create new account
                  </Link>
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: OTP FORM */}
          {step === "otp" && (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                Enter the 6-digit code sent to your email
              </p>

              <OTPInput value={otp} onChange={setOtp} />

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className={`w-full py-2 rounded-lg font-medium transition
                  flex items-center justify-center gap-2
                  ${
                    loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-hover"
                  }`}
              >
                {loading && <Spinner size={16} />}
                <span>{loading ? "Verifying..." : "Validate & Login"}</span>
              </button>

              <ResendOTPButton onResend={handleResendOtp} />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                onClick={() => setStep("login")}
                className="w-full text-sm text-text-muted hover:text-primary"
              >
                Back to login
              </button>
            </div>
          )}
        </>
      }
      right={<MarketingPanel />}
    />
  );
}
