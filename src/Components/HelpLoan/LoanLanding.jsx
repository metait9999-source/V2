import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";

/* ─── Theme ── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

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
      style={{ height: "100dvh", background: DARK_BG }}
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <Header pageTitle="Help Loan" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div
          className="mx-4 mt-3 rounded-3xl p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,#6366f1 0%,#a855f7 55%,#ec4899 100%)",
          }}
        >
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 160,
              height: 160,
              background: "rgba(255,255,255,0.07)",
              top: -40,
              right: -30,
            }}
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: 80,
              height: 80,
              background: "rgba(255,255,255,0.06)",
              bottom: -20,
              left: 20,
            }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p
                  className="text-white/70 font-semibold mb-1"
                  style={{ fontSize: "3vw" }}
                >
                  Quick Loan
                </p>
                <p
                  className="text-white font-black leading-tight"
                  style={{ fontSize: "7.5vw" }}
                >
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
                  <p
                    className="text-white font-black"
                    style={{ fontSize: "3.8vw" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-white/60" style={{ fontSize: "3vw" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="px-4 mt-4">
          <p
            className="font-black mb-3"
            style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
          >
            Why choose us?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-4"
                style={{
                  background: DARK_CARD,
                  border: `1px solid ${DARK_BORDER}`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: f.color }}
                >
                  {f.icon}
                </div>
                <p
                  className="font-bold mb-0.5"
                  style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: "3.2vw",
                    color: TEXT_MUTED,
                    lineHeight: 1.5,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="px-4 mt-5">
          <p
            className="font-black mb-3"
            style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
          >
            How it works
          </p>
          <div
            className="rounded-3xl p-5 space-y-4"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            {STEPS_INFO.map((s, i) => (
              <div key={s.num} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-black flex-shrink-0"
                    style={{
                      fontSize: "3.5vw",
                      background: "linear-gradient(135deg,#6366f1,#a855f7)",
                      color: "white",
                    }}
                  >
                    {s.num}
                  </div>
                  {i < STEPS_INFO.length - 1 && (
                    <div
                      className="w-0.5 h-6 mt-1 rounded-full"
                      style={{ background: "rgba(168,85,247,0.3)" }}
                    />
                  )}
                </div>
                <p
                  className="font-medium pt-2 leading-snug"
                  style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div
          className="mx-4 mt-4 mb-2 rounded-2xl p-4 flex gap-3"
          style={{
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.25)",
          }}
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
          <p style={{ fontSize: "3.2vw", color: "#fb923c", lineHeight: 1.6 }}>
            Loans are subject to credit review. Approval is not guaranteed.
            Please ensure you can repay before applying.
          </p>
        </div>

        <div className="h-4" />
      </div>

      {/* CTA buttons */}
      <div
        className="flex-shrink-0 px-4 py-4 flex gap-3"
        style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BORDER}` }}
      >
        {/* Loan History */}
        <button
          onClick={() => navigate("/loan-history")}
          className="flex items-center gap-2 px-4 py-4 rounded-2xl font-bold flex-shrink-0 transition-transform active:scale-95"
          style={{
            fontSize: "3.5vw",
            background: "rgba(99,102,241,0.12)",
            color: "#818cf8",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="9"
              y="3"
              width="6"
              height="4"
              rx="1"
              stroke="#818cf8"
              strokeWidth="2"
            />
          </svg>
          History
        </button>
        {/* Apply */}
        <button
          onClick={() => navigate("/help-loan")}
          className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold text-white active:scale-95 transition-transform"
          style={{
            fontSize: "4.5vw",
            background: "linear-gradient(90deg,#f472b6,#a855f7)",
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
