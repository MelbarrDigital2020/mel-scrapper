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

      {/* ✅ Smaller illustration so no scroll */}
      <div className="mt-6 relative">
        <div className="absolute -inset-5 rounded-3xl bg-white/35 blur-xl" />
        <div className="relative rounded-3xl border border-white/60 bg-white/40 backdrop-blur p-4 overflow-hidden">
          <svg viewBox="0 0 900 300" className="w-full h-[170px]">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#DBEAFE" />
                <stop offset="1" stopColor="#EEF2FF" />
              </linearGradient>
              <linearGradient id="g2" x1="0" x2="1">
                <stop offset="0" stopColor="#2563EB" />
                <stop offset="1" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>

            <rect
              x="0"
              y="0"
              width="900"
              height="300"
              rx="26"
              fill="url(#g1)"
            />

            {/* laptop */}
            <rect
              x="250"
              y="70"
              width="380"
              height="165"
              rx="18"
              fill="#fff"
              opacity="0.95"
            />
            <rect
              x="270"
              y="90"
              width="340"
              height="110"
              rx="12"
              fill="#EFF6FF"
            />
            <rect
              x="220"
              y="238"
              width="440"
              height="22"
              rx="11"
              fill="#CBD5E1"
              opacity="0.7"
            />

            {/* bars */}
            <rect
              x="310"
              y="160"
              width="24"
              height="40"
              rx="8"
              fill="#93C5FD"
            />
            <rect
              x="348"
              y="142"
              width="24"
              height="58"
              rx="8"
              fill="#60A5FA"
            />
            <rect
              x="386"
              y="120"
              width="24"
              height="80"
              rx="8"
              fill="#3B82F6"
            />
            <rect
              x="424"
              y="135"
              width="24"
              height="65"
              rx="8"
              fill="#60A5FA"
            />
            <rect
              x="462"
              y="110"
              width="24"
              height="90"
              rx="8"
              fill="#1D4ED8"
              opacity="0.9"
            />

            {/* trend */}
            <path
              d="M305 175 C340 150, 380 148, 420 130 C470 110, 520 130, 570 105"
              fill="none"
              stroke="url(#g2)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <circle cx="305" cy="175" r="6" fill="#2563EB" />
            <circle cx="420" cy="130" r="6" fill="#2563EB" />
            <circle cx="570" cy="105" r="6" fill="#2563EB" />

            {/* target */}
            <circle cx="160" cy="190" r="48" fill="#fff" opacity="0.9" />
            <circle cx="160" cy="190" r="34" fill="#DBEAFE" />
            <circle cx="160" cy="190" r="20" fill="#93C5FD" />
            <circle cx="160" cy="190" r="9" fill="#2563EB" />
          </svg>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium text-slate-700">
              Intent → Leads → Pipeline
            </span>
            <span className="text-slate-500">Real-time intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
