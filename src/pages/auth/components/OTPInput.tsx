import { useRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function OTPInput({ value, onChange }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (char: string, index: number) => {
    const otpArray = value.split("");
    otpArray[index] = char;
    onChange(otpArray.join(""));

    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          maxLength={1}
          value={value[i] || ""}
          ref={(el) => (inputs.current[i] = el)}
          onChange={(e) => handleChange(e.target.value, i)}
          className="w-12 h-12 text-center text-lg font-semibold
            border border-border-light rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ))}
    </div>
  );
}
