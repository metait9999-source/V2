import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Fast Approval",
    desc: "Get approved within 24 hours",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Secure & Private",
    desc: "Your data is fully encrypted",
    color: "#a855f7",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect
          x="2"
          y="7"
          width="20"
          height="14"
          rx="2"
          stroke="white"
          strokeWidth="1.8"
        />
        <path
          d="M16 7V5a2 2 0 00-4 0v2M2 11h20"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Flexible Repayment",
    desc: "Choose 7 to 90 day periods",
    color: "#ec4899",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.8" />
        <path
          d="M12 8v4l3 3"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "24/7 Support",
    desc: "Always here when you need us",
    color: "#0ea5e9",
  },
];

const STEPS_INFO = [
  { num: "01", label: "Fill personal details & select loan period" },
  { num: "02", label: "Upload credit card & ID card photos" },
  { num: "03", label: "Enter loan amount & submit application" },
  { num: "04", label: "Get approval and receive funds" },
];

const HelpLoanLanding = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        height: "100dvh",
        background: "#f3f4f8",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      {/* Header with history button */}
      <div className="flex-shrink-0 relative">
        <Header pageTitle="Help Loan" />
        <button
          onClick={() => navigate("/loan-history")}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#eef2ff", color: "#6366f1" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="9"
              y="3"
              width="6"
              height="4"
              rx="1"
              stroke="#6366f1"
              strokeWidth="2"
            />
          </svg>
          History
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div
          className="mx-4 mt-3 rounded-3xl p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #a855f7 55%, #ec4899 100%)",
          }}
        >
          <div
            className="absolute"
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              top: -40,
              right: -30,
            }}
          />
          <div
            className="absolute"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              bottom: -20,
              left: 20,
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-xs font-semibold mb-1">
                  Quick Loan
                </p>
                <p className="text-white font-black text-3xl leading-tight">
                  Up to
                  <br />
                  50,000 USDT
                </p>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.18)" }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="white"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 7v5l3.5 3.5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Min Period", value: "7 Days" },
                { label: "Min Rate", value: "2.5%" },
                { label: "Max Limit", value: "50K USDT" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center rounded-2xl py-2.5"
                  style={{ background: "rgba(255,255,255,0.13)" }}
                >
                  <p className="text-white font-black text-sm">{s.value}</p>
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-4 mt-4">
          <p className="text-gray-900 font-black text-base mb-3">
            Why choose us?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-4 shadow-sm">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: f.color }}
                >
                  {f.icon}
                </div>
                <p className="text-gray-900 font-bold text-sm mb-0.5">
                  {f.title}
                </p>
                <p className="text-gray-400 text-xs leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-4 mt-5">
          <p className="text-gray-900 font-black text-base mb-3">
            How it works
          </p>
          <div className="bg-white rounded-3xl shadow-sm p-5 space-y-4">
            {STEPS_INFO.map((s, i) => (
              <div key={s.num} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #6366f1, #a855f7)",
                      color: "white",
                    }}
                  >
                    {s.num}
                  </div>
                  {i < STEPS_INFO.length - 1 && (
                    <div
                      className="w-0.5 h-6 mt-1 rounded-full"
                      style={{ background: "#e9d5ff" }}
                    />
                  )}
                </div>
                <p className="text-gray-700 text-sm font-medium pt-2 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div
          className="mx-4 mt-4 mb-2 rounded-2xl p-4 flex gap-3"
          style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="flex-shrink-0 mt-0.5"
          >
            <path
              d="M12 2L2 19h20L12 2z"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 9v4M12 16h.01"
              stroke="#f97316"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-orange-700 text-xs leading-relaxed">
            Loans are subject to credit review. Approval is not guaranteed.
            Please ensure you can repay before applying.
          </p>
        </div>

        <div className="h-4" />
      </div>

      {/* CTA button */}
      <div
        className="flex-shrink-0 px-4 py-4 bg-white border-t border-gray-100"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
      >
        <button
          onClick={() => navigate("/help-loan")}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold text-base text-white active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(90deg, #f472b6, #a855f7)",
            boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
            <path
              d="M12 8v8M8 12h8"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Apply for a Loan
        </button>
      </div>
    </div>
  );
};

export default HelpLoanLanding;
