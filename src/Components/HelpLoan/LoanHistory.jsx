import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { useUser } from "../../context/UserContext";
import { getMyLoans } from "../../api/loan.api";
import { API_BASE_URL } from "../../api/getApiURL";

/* ─── Theme ── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";
const TABS = [
  {
    key: "all",
    label: "All",
    color: "#818cf8",
    bg: "rgba(99,102,241,0.15)",
    dot: "#6366f1",
  },
  {
    key: "pending",
    label: "Pending",
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.15)",
    dot: "#f59e0b",
  },
  {
    key: "approved",
    label: "Approved",
    color: "rgb(16,185,129)",
    bg: "rgba(16,185,129,0.15)",
    dot: "#10b981",
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "rgb(239,68,68)",
    bg: "rgba(239,68,68,0.15)",
    dot: "#ef4444",
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    pending: {
      label: "Pending",
      color: "#fbbf24",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
    },
    approved: {
      label: "Approved",
      color: "rgb(16,185,129)",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    rejected: {
      label: "Rejected",
      color: "rgb(239,68,68)",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.25)",
    },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold"
      style={{
        fontSize: "3vw",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div
    className="rounded-3xl p-5 animate-pulse"
    style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div
          className="w-24 h-3 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="w-36 h-4 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      </div>
      <div
        className="w-20 h-6 rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <div
            className="w-12 h-2.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="w-16 h-3.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>
      ))}
    </div>
  </div>
);

const LoanCard = ({ loan }) => {
  const [expanded, setExpanded] = useState(false);

  const date = loan.created_at
    ? new Date(loan.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const dueDate =
    loan.created_at && loan.loan_period
      ? new Date(
          new Date(loan.created_at).getTime() + loan.loan_period * 86400000,
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p style={{ fontSize: "3vw", color: TEXT_MUTED, marginBottom: 2 }}>
              #{loan.id} · {date}
            </p>
            <p
              className="font-black"
              style={{ fontSize: "5.5vw", color: TEXT_PRIMARY }}
            >
              {parseFloat(loan.loan_amount || 0).toLocaleString()} USDT
            </p>
          </div>
          <StatusBadge status={loan.status ?? "pending"} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Period",
              value: loan.loan_period ? `${loan.loan_period} Days` : "—",
            },
            {
              label: "Interest",
              value: loan.interest_rate ? `${loan.interest_rate}%` : "—",
            },
            { label: "Due Date", value: dueDate },
          ].map((item) => (
            <div key={item.label}>
              <p
                style={{ fontSize: "3vw", color: TEXT_MUTED, marginBottom: 2 }}
              >
                {item.label}
              </p>
              <p
                className="font-bold"
                style={{ fontSize: "3.2vw", color: TEXT_PRIMARY }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 transition-colors"
        style={{
          fontSize: "3.2vw",
          color: expanded ? "#a78bfa" : TEXT_MUTED,
          borderTop: `1px solid ${DARK_BORDER2}`,
          background: "transparent",
        }}
      >
        {expanded ? "Hide details" : "View details"}
        <svg
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          style={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div
          className="px-5 pb-5 space-y-3"
          style={{
            borderTop: `1px solid ${DARK_BORDER2}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <p
            className="font-bold pt-4 mb-2 uppercase tracking-wide"
            style={{ fontSize: "3vw", color: TEXT_MUTED }}
          >
            Applicant Details
          </p>
          {[
            { label: "Full Name", value: loan.full_name },
            { label: "Phone", value: loan.phone },
            { label: "Address", value: loan.home_address },
            {
              label: "Total Repay",
              value: loan.total_repay
                ? `${Number(loan.total_repay).toLocaleString()} USDT`
                : null,
            },
          ].map((row) =>
            row.value ? (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4"
              >
                <span
                  style={{ fontSize: "3vw", color: TEXT_MUTED, flexShrink: 0 }}
                >
                  {row.label}
                </span>
                <span
                  className="font-semibold text-right"
                  style={{ fontSize: "3vw", color: TEXT_PRIMARY }}
                >
                  {row.value}
                </span>
              </div>
            ) : null,
          )}

          <p
            className="font-bold pt-2 uppercase tracking-wide"
            style={{ fontSize: "3vw", color: TEXT_MUTED }}
          >
            Documents
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Card Front", key: "credit_front" },
              { label: "Card Back", key: "credit_back" },
              { label: "ID Card", key: "id_card" },
            ].map((doc) => (
              <a
                key={doc.key}
                href={`${API_BASE_URL}/${loan[doc.key]}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={`${API_BASE_URL}/${loan[doc.key]}`}
                  alt={doc.label}
                  className="w-full h-16 object-cover rounded-xl"
                  style={{ border: `1px solid ${DARK_BORDER}` }}
                />
                <p
                  className="text-center mt-1"
                  style={{ fontSize: "3vw", color: TEXT_MUTED }}
                >
                  {doc.label}
                </p>
              </a>
            ))}
          </div>

          {loan.status === "rejected" && loan.reject_reason && (
            <div
              className="rounded-2xl px-4 py-3 mt-2"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <p
                className="font-bold mb-0.5"
                style={{ fontSize: "3vw", color: "rgb(239,68,68)" }}
              >
                Rejection Reason
              </p>
              <p style={{ fontSize: "3vw", color: "#fca5a5" }}>
                {loan.reject_reason}
              </p>
            </div>
          )}

          {loan.status === "approved" && (
            <div
              className="rounded-2xl px-4 py-3 mt-2"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <p
                className="font-bold mb-0.5"
                style={{ fontSize: "3vw", color: "rgb(16,185,129)" }}
              >
                Approved
              </p>
              <p style={{ fontSize: "3vw", color: "#6ee7b7" }}>
                Your loan has been approved. Funds have been deposited to your
                USDT balance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LoanHistory = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("all");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      try {
        const res = await getMyLoans(user?.id);
        setLoans(res.data ?? []);
      } catch {
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchLoans();
  }, [user?.id]);

  const filtered =
    activeTab === "all" ? loans : loans.filter((l) => l.status === activeTab);
  const counts = {
    all: loans.length,
    pending: loans.filter((l) => l.status === "pending").length,
    approved: loans.filter((l) => l.status === "approved").length,
    rejected: loans.filter((l) => l.status === "rejected").length,
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: DARK_BG }}
    >
      <div className="flex-shrink-0">
        <Header pageTitle="Loan History" />
      </div>

      {/* Summary banner */}
      <div
        className="flex-shrink-0 mx-4 mt-3 rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(135deg,#6366f1 0%,#a855f7 55%,#ec4899 100%)",
        }}
      >
        <p
          className="text-white/70 font-semibold mb-3"
          style={{ fontSize: "3vw" }}
        >
          Loan Overview
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total", value: counts.all, color: "white" },
            {
              label: "Approved",
              value: counts.approved,
              color: "rgb(110,231,183)",
            },
            {
              label: "Pending",
              value: counts.pending,
              color: "rgb(253,230,138)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-2xl py-3"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <p
                className="font-black"
                style={{ fontSize: "6vw", color: stat.color }}
              >
                {loading ? "—" : stat.value}
              </p>
              <p className="text-white/60" style={{ fontSize: "3vw" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex-shrink-0 px-4 pt-3">
        <div
          className="rounded-2xl p-1 flex gap-1"
          style={{ background: DARK_CARD2, border: `1px solid ${DARK_BORDER}` }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold transition-all duration-200"
              style={{
                fontSize: "3.2vw",
                background: activeTab === tab.key ? tab.bg : "transparent",
                color: activeTab === tab.key ? tab.color : TEXT_MUTED,
                border: "none",
              }}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{
                    fontSize: 9,
                    background:
                      activeTab === tab.key ? tab.dot : "rgba(255,255,255,0.1)",
                  }}
                >
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: `1px solid rgba(124,58,237,0.2)`,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="#a855f7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p
              className="font-bold mb-1"
              style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
            >
              No loans found
            </p>
            <p
              className="text-center"
              style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
            >
              {activeTab === "all"
                ? "You haven't applied for any loans yet."
                : `No ${activeTab} applications.`}
            </p>
          </div>
        ) : (
          filtered.map((loan) => <LoanCard key={loan.id} loan={loan} />)
        )}
        <div className="h-4" />
      </div>

      {/* Bottom buttons */}
      <div
        className="flex-shrink-0 px-4 py-4 flex gap-3"
        style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BORDER}` }}
      >
        {/* Back to landing page */}
        <button
          onClick={() => navigate("/loan-landing")}
          className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
          style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {/* Apply button */}
        <button
          onClick={() => navigate("/help-loan")}
          className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-extrabold text-white active:scale-95 transition-transform"
          style={{
            fontSize: "4vw",
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
          Apply for a New Loan
        </button>
      </div>
    </div>
  );
};

export default LoanHistory;
