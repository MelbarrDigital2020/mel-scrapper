import { useState } from "react";
import AuthLayoutSplit from "./components/AuthLayoutSplit";
import SocialLoginButton from "./components/SocialLoginButton";
import PasswordInput from "./components/PasswordInput";
import MarketingPanel from "./components/MarketingPanel";
import AuthInput from "./components/AuthInput";
import OTPInput from "./components/OTPInput";
import Divider from "./components/Divider";
import Spinner from "../shared/components/Spinner";

import { FiMail } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "otp">("login");
  const [loading, setLoading] = useState(false);
  // Handle Lofin button click
  const handleLogin = () => {
    setLoading(true);

    // simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep("otp"); // simulate 2FA enabled
    }, 1500);
  };

  const handleVerifyOtp = () => {
    setLoading(true);

    // simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      alert("Login successful 🎉");
    }, 1500);
  };

  return (
    <AuthLayoutSplit
      left={
        <>
          <h1 className="text-2xl text-center text-primary font-semibold mb-6">
            Mel-Scrapper
          </h1>

          <h1 className="text-2xl font-semibold mb-6">
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
                />

                <PasswordInput />

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


                <span className="text-sm text-secondary">Dont have an account? click hear to create <a href="" className="text-primary">create new account</a></span>
              </div>
            </div>
          )}

          {/* STEP 2: OTP FORM */}
          {step === "otp" && (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                Enter the 6-digit code sent to your email
              </p>

              <OTPInput />

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
