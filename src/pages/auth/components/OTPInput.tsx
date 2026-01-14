import { useRef } from "react";

export default function OTPInput() {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          maxLength={1}
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
