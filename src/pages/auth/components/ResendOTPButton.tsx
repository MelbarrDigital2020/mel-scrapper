import { useEffect, useState } from "react";

type Props = {
  onResend: () => void;
};

export default function ResendOTPButton({ onResend }: Props) {
  const [cooldown, setCooldown] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  // countdown logic
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    const nextCount = resendCount + 1;
    setResendCount(nextCount);

    let nextCooldown = 60;
    if (nextCount === 1) nextCooldown = 90;
    if (nextCount >= 2) nextCooldown = 120;

    setCooldown(nextCooldown);
    onResend();
  };

  return (
    <button
      onClick={handleResend}
      disabled={cooldown > 0}
      className={`w-full text-sm font-medium transition
        ${
          cooldown > 0
            ? "text-text-muted cursor-not-allowed"
            : "text-primary hover:underline"
        }`}
    >
      {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
    </button>
  );
}
