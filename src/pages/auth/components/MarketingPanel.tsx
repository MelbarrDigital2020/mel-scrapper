// src/pages/auth/components/MarketingPanel.tsx
import { FiCheckCircle } from "react-icons/fi";

const points = [
  {
    title: "Identify High-Intent Leads",
    desc: "Find prospects actively searching for solutions.",
  },
  {
    title: "Analyze Market Trends",
    desc: "Convert signals into clear insights and actions.",
  },
  {
    title: "Boost Your Sales Pipeline",
    desc: "Prioritize high-value accounts and close faster.",
  },
];

export default function MarketingPanel() {
  return (
    <div className="w-full max-w-xl">
      {/* ✅ tighter spacing */}
      <div className="mb-5">
        <p className="text-xs font-semibold tracking-wide text-[#1D4ED8]/80">
          Welcome to
        </p>

        <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          Mel-DemandScraper
        </h2>

        <p className="mt-2 text-lg font-semibold text-[#1D4ED8]">
          Supercharge your B2B lead generation.
        </p>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-lg">
          Discover new leads, track demand signals, and convert faster with a
          clean workflow.
        </p>
      </div>

      <div className="space-y-4">
        {points.map((p) => (
          <div key={p.title} className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1D4ED8]/10">
              <FiCheckCircle className="text-[#1D4ED8]" />
            </span>

            <div>
              <p className="text-base font-semibold text-slate-900">
                {p.title}
              </p>
              <p className="text-sm text-slate-600">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6">
        <button
          type="button"
          className="rounded-xl px-6 py-3 text-sm font-semibold
          bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-lg
          hover:brightness-110 active:brightness-95 transition"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
