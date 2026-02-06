import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

import AuthLayoutSplit from "./components/AuthLayoutSplit";
import SocialLoginButton from "./components/SocialLoginButton";
import AuthInput from "./components/AuthInput";
import PasswordInput from "./components/PasswordInput";
import OTPInput from "./components/OTPInput";
import Divider from "./components/Divider";
import MarketingPanel from "./components/MarketingPanel";
import PasswordStrength from "./components/PasswordStrength";
import Spinner from "../shared/components/Spinner";
import ResendOTPButton from "./components/ResendOTPButton";
import logo from "../../assets/logo.png";

import { FiMail, FiUser, FiArrowLeft } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

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
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Set Form blank
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // password Rules
  const passwordRules = {
    length: form.password.length >= 8 && form.password.length <= 20,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    noSpace: !/\s/.test(form.password),
  };
  const isPasswordStrong =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.noSpace;
  // Confirm Password
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  // handle Send Otp
  const handleSendOtp = async () => {
    setError("");

    if (!form.firstName.trim()) return setError("First name is required");
    if (!form.lastName.trim()) return setError("Last name is required");
    if (!form.email.trim()) return setError("Email is required");
    if (!form.email.includes("@"))
      return setError("Please enter a valid email address");

    try {
      setLoading(true);

      const res = await api.post("/auth/register/start", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      });

      setUserId(res.data.data.userId);
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // handle Verify otp
  const handleVerifyOtp = async () => {
    setError("");

    if (!userId) {
      setError("Invalid session. Please start again.");
      setStep(1);
      return;
    }

    if (otp.length !== 6)
      return setError("Please enter the complete 6-digit OTP");

    try {
      setLoading(true);

      await api.post("/auth/register/verify-otp", {
        userId,
        otp,
      });

      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await api.post("/auth/register/resend-otp", {
        email: form.email,
      });

      setSuccessMessage("OTP resent successfully. Please check your email.");
      setTimeout(() => setSuccessMessage(""), 4010);
      setError(""); // clear error if any
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend OTP");
    }
  };

  // Handle Create account
  const handleCreateAccount = async () => {
    setError("");

    if (!userId) {
      setError("Invalid session. Please start again.");
      setStep(1);
      return;
    }

    if (!isPasswordStrong)
      return setError("Password does not meet requirements");

    if (!passwordsMatch) return setError("Passwords do not match");

    try {
      setLoading(true);

      await api.post("/auth/register/complete", {
        userId,
        password: form.password,
      });

      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayoutSplit
      left={
        <>
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Mel-Scrapper logo" className="h-16 w-auto" />
          </div>

          <h2 className="text-2xl text-center text-primary font-semibold mb-6">
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
              </div>

              {/* Divider */}
              <Divider label="or" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <AuthInput
                    label="First Name"
                    placeholder="Enter first name"
                    icon={<FiUser size={18} />}
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />

                  <AuthInput
                    label="Last Name"
                    placeholder="Enter last name"
                    icon={<FiUser size={18} />}
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </div>

                <AuthInput
                  label="Work Email"
                  placeholder="Enter work email"
                  type="email"
                  icon={<FiMail size={18} />}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

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

                {error && <p className="text-sm text-red-500">{error}</p>}

                <span className="text-sm text-secondary">
                  Already have an account click hear to{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    login
                  </Link>
                </span>
              </div>
            </div>
          )}

          {/* STEP 2 – OTP */}
          {step === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-text-secondary">
                OTP sent to {form.email} . Please check inbox or spam folder.
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
                <span>{loading ? "Verifying..." : "Verify OTP"}</span>
              </button>

              <ResendOTPButton onResend={handleResendOtp} />

              {successMessage && (
                <p className="text-sm text-success text-center">
                  {successMessage}
                </p>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="text-sm text-text-muted hover:text-primary flex items-center gap-2"
              >
                <FiArrowLeft /> Back
              </button>
            </div>
          )}

          {/* STEP 3 – PASSWORD */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <AuthInput label="First Name" value={form.firstName} readOnly />
                <AuthInput label="Last Name" value={form.lastName} readOnly />
              </div>
              <AuthInput label="Email" value={form.email} readOnly />

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
              {form.confirmPassword.length > 0 && (
                <p
                  className={`text-sm ${
                    passwordsMatch ? "text-success" : "text-error"
                  }`}
                >
                  {passwordsMatch
                    ? "Passwords match"
                    : "Passwords do not match"}
                </p>
              )}

              <button
                onClick={handleCreateAccount}
                disabled={loading || !isPasswordStrong || !passwordsMatch}
                className={`w-full py-2 rounded-lg font-medium transition
                  flex items-center justify-center gap-2
                  ${
                    loading || !isPasswordStrong || !passwordsMatch
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-hover"
                  }`}
              >
                {loading && <Spinner size={16} />}
                <span>
                  {loading ? "Creating account..." : "Create Account"}
                </span>
              </button>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}
        </>
      }
      right={<MarketingPanel />}
    />
  );
}
