import { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordInput() {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-text-secondary">
        Password
      </label>

      <div className="relative">
        {/* Left icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <FiLock size={18} />
        </span>

        {/* Input */}
        <input
          type={show ? "text" : "password"}
          placeholder="Enter your password"
          className="w-full rounded-lg border border-border-light bg-white
            px-10 py-2 text-text-primary
            focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Eye toggle */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2
            text-text-muted hover:text-text-primary"
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </div>
  );
}
