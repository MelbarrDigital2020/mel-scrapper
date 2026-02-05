// src/pages/auth/components/AuthLayoutSplit.tsx
import type { ReactNode } from "react";

export default function AuthLayoutSplit({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-br from-white via-[#EEF4FF] to-[#E6EEFF]">
      {/* Big container like screenshot */}
      <div className="w-full max-w-6xl rounded-[28px] overflow-hidden shadow-2xl bg-white/55 backdrop-blur-md border border-white/60">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left – Auth */}
          <div className="flex items-center justify-center px-6 py-10 lg:px-10 bg-white/65">
            <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-xl border border-white/70 p-7 lg:p-8">
              {left}
            </div>
          </div>

          {/* Right – Marketing */}
          <div className="hidden lg:block relative overflow-hidden">
            {/* Background gradient + soft glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7FAFF] via-[#ECF2FF] to-[#E8F0FF]" />

            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#3B82F6]/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#6366F1]/10 blur-2xl" />

            {/* Subtle pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #1f2937 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            <div className="relative h-full flex items-center justify-center px-10 py-12">
              {right}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
