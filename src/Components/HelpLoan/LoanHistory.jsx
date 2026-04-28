import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { useUser } from "../../context/UserContext";
import { getMyLoans } from "../../api/loan.api";
import { API_BASE_URL } from "../../api/getApiURL";

const TABS = [
  { key: "all", label: "All", color: "#6366f1", bg: "#eef2ff", dot: "#6366f1" },
  {
    key: "pending",
    label: "Pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    dot: "#f59e0b",
  },
  {
    key: "approved",
    label: "Approved",
    color: "#10b981",
    bg: "#ecfdf5",
    dot: "#10b981",
  },
  {
    key: "rejected",
    label: "Rejected",
    color: "#ef4444",
    bg: "#fef2f2",
    dot: "#ef4444",
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    pending: {
      label: "Pending",
      color: "#f59e0b",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    approved: {
      label: "Approved",
      color: "#10b981",
      bg: "#ecfdf5",
      border: "#6ee7b7",
    },
    rejected: {
      label: "Rejected",
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fca5a5",
    },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
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
  <div className="bg-white rounded-3xl p-5 shadow-sm animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div className="w-24 h-3 bg-gray-200 rounded-full" />
        <div className="w-36 h-4 bg-gray-200 rounded-full" />
      </div>
      <div className="w-20 h-6 bg-gray-200 rounded-full" />
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="w-12 h-2.5 bg-gray-200 rounded-full" />
          <div className="w-16 h-3.5 bg-gray-200 rounded-full" />
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
          new Date(loan.created_at).getTime() +
            loan.loan_period * 24 * 60 * 60 * 1000,
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div
      className="bg-white rounded-3xl shadow-sm overflow-hidden"
      style={{ border: "1px solid #f3f4f6" }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs font-medium mb-0.5">
              #{loan.id} · {date}
            </p>
            <p className="text-gray-900 font-black text-xl">
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
              <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
              <p className="text-gray-800 font-bold text-xs">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-gray-50 text-xs font-semibold text-gray-400 hover:text-purple-500 transition-colors"
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
          className="px-5 pb-5 space-y-3 border-t border-gray-50"
          style={{ background: "#fafafa" }}
        >
          <p className="text-gray-500 text-xs font-bold pt-4 mb-2 uppercase tracking-wide">
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
                : "—",
            },
          ].map((row) =>
            row.value ? (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4"
              >
                <span className="text-gray-400 text-xs flex-shrink-0">
                  {row.label}
                </span>
                <span className="text-gray-700 text-xs font-semibold text-right">
                  {row.value}
                </span>
              </div>
            ) : null,
          )}

          {/* Documents */}
          <p className="text-gray-500 text-xs font-bold pt-2 uppercase tracking-wide">
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
                  className="w-full h-16 object-cover rounded-xl border border-gray-100"
                />
                <p className="text-xs text-gray-400 text-center mt-1">
                  {doc.label}
                </p>
              </a>
            ))}
          </div>

          {loan.status === "rejected" && loan.reject_reason && (
            <div
              className="rounded-2xl px-4 py-3 mt-2"
              style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}
            >
              <p className="text-red-500 text-xs font-bold mb-0.5">
                Rejection Reason
              </p>
              <p className="text-red-400 text-xs">{loan.reject_reason}</p>
            </div>
          )}

          {loan.status === "approved" && (
            <div
              className="rounded-2xl px-4 py-3 mt-2"
              style={{ background: "#ecfdf5", border: "1px solid #6ee7b7" }}
            >
              <p className="text-emerald-600 text-xs font-bold mb-0.5">
                Approved
              </p>
              <p className="text-emerald-500 text-xs">
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

      <div className="flex-shrink-0">
        <Header pageTitle="Loan History" />
      </div>

      {/* Summary banner */}
      <div
        className="flex-shrink-0 mx-4 mt-3 rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(135deg, #6366f1 0%, #a855f7 55%, #ec4899 100%)",
        }}
      >
        <p className="text-white/70 text-xs font-semibold mb-3">
          Loan Overview
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total", value: counts.all, color: "white" },
            { label: "Approved", value: counts.approved, color: "#6ee7b7" },
            { label: "Pending", value: counts.pending, color: "#fde68a" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center rounded-2xl py-3"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <p className="font-black text-2xl" style={{ color: stat.color }}>
                {loading ? "—" : stat.value}
              </p>
              <p className="text-white/60 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex-shrink-0 px-4 pt-3">
        <div className="bg-white rounded-2xl shadow-sm p-1 flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: activeTab === tab.key ? tab.bg : "transparent",
                color: activeTab === tab.key ? tab.color : "#9ca3af",
              }}
            >
              {tab.label}
              {counts[tab.key] > 0 && (
                <span
                  className="w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{
                    fontSize: 9,
                    background: activeTab === tab.key ? tab.dot : "#d1d5db",
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
            {" "}
            <SkeletonCard /> <SkeletonCard /> <SkeletonCard />{" "}
          </>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background: "linear-gradient(135deg, #f0f0ff, #fdf4ff)",
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
            <p className="text-gray-700 font-bold text-base mb-1">
              No loans found
            </p>
            <p className="text-gray-400 text-sm text-center">
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

      {/* Apply button */}
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
          Apply for a New Loan
        </button>
      </div>
    </div>
  );
};

export default LoanHistory;
