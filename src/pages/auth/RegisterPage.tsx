import { useState } from "react";
import AuthLayoutSplit from "./components/AuthLayoutSplit";
import SocialLoginButton from "./components/SocialLoginButton";
import AuthInput from "./components/AuthInput";
import PasswordInput from "./components/PasswordInput";
import OTPInput from "./components/OTPInput";
import Divider from "./components/Divider";
import MarketingPanel from "./components/MarketingPanel";
import PasswordStrength from "./components/PasswordStrength";

import { FiMail, FiUser } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

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
                  onClick={() => setStep(2)}
                  className="w-full bg-primary text-white py-2 rounded-lg font-medium"
                >
                  Continue
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
                onClick={() => setStep(3)}
                className="w-full bg-primary text-white py-2 rounded-lg font-medium"
              >
                Verify OTP
              </button>

              <button
                onClick={() => setStep(1)}
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

              <PasswordInput />
              <PasswordStrength password={form.password} />

              <PasswordInput />

              <button className="w-full bg-primary text-white py-2 rounded-lg font-medium">
                Create Account
              </button>
            </div>
          )}
        </>
      }
      right={<MarketingPanel />}
    />
  );
}
