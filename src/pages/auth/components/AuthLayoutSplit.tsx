import type { ReactNode } from "react";

export default function AuthLayoutSplit({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      
      {/* Left – Auth */}
      <div className="flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md px-6">
          {left}
        </div>
      </div>

      {/* Right – Marketing */}
      <div className="hidden lg:flex items-center justify-center bg-[#EAF1FF] relative">
        {right}
      </div>
    </div>
  );
}
