import { useState } from "react";
import AuthLayoutSplit from "./components/AuthLayoutSplit";
import SocialLoginButton from "./components/SocialLoginButton";
import AuthInput from "./components/AuthInput";
import PasswordInput from "./components/PasswordInput";
import OTPInput from "./components/OTPInput";
import Divider from "./components/Divider";
import MarketingPanel from "./components/MarketingPanel";
import PasswordStrength from "./components/PasswordStrength";
import Spinner from "../shared/components/Spinner";

import { FiMail, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Set Form blank
 const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // handle Send Otp
  const handleSendOtp = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };
  // handle Verify otp
  const handleVerifyOtp = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  // Handle Create account
  const handleCreateAccount = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("Account created successfully 🎉");
    }, 1500);
  };

  return (
    <AuthLayoutSplit
      left={
        <>
          <h1 className="text-2xl text-center text-primary font-semibold mb-6">
            Mel-Scrapper
          </h1>

          <h2 className="text-2xl font-semibold mb-6">
            Create your account
          </h2>

          {/* STEP 1 – BASIC INFO */}
          {step === 1 && (
            <div>
              {/* Social login always visible */}
                <div className="space-y-3">
                  <SocialLoginButton
                    label="Sign up with Google"
                    icon={<FcGoogle size={18} />}
                  />
                  <SocialLoginButton
                    label="Sign up with Microsoft"
                    icon={<FaMicrosoft size={18} />}
                  />
                </div>

                {/* Divider */}
                <Divider label="or" />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <AuthInput label="First Name" placeholder="Enter first name" icon={<FiUser size={18} />} />
                    <AuthInput label="Last Name" placeholder="Enter last name" icon={<FiUser size={18} />} />
                  </div>
                  <AuthInput label="Work Email" placeholder="Enter work email" type="email" icon={<FiMail size={18} />} />

                <button
                  onClick={handleSendOtp}
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
                  <span>{loading ? "Sending OTP..." : "Continue"}</span>
                </button>


              </div>
            </div>
          )}

          {/* STEP 2 – OTP */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                Verify your email address
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
                <span>{loading ? "Verifying..." : "Verify OTP"}</span>
              </button>


              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="text-sm text-text-muted hover:text-primary"
              >
                Back
              </button>
            </div>
          )}

          {/* STEP 3 – PASSWORD */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
              <AuthInput label="First Name" value="John" readOnly />
              <AuthInput label="Last Name" value="Doe" readOnly />
              </div>
              <AuthInput label="Email" value="john@company.com" readOnly />

              <PasswordInput
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
              />
              <PasswordStrength password={form.password} />

              <PasswordInput
                label="Confirm Password"
                value={form.confirmPassword}
                onChange={(v) => setForm({ ...form, confirmPassword: v })}
                placeholder="Confirm your password"
              />

              <button
                onClick={handleCreateAccount}
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
                <span>{loading ? "Creating account..." : "Create Account"}</span>
              </button>

            </div>
          )}
        </>
      }
      right={<MarketingPanel />}
    />
  );
}
