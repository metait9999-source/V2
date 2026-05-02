import React from "react";

const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

const statusStyle = {
  approved: {
    color: "rgb(16,185,129)",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.2)",
  },
  pending: {
    color: "#fbbf24",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.2)",
  },
  rejected: {
    color: "rgb(239,68,68)",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.2)",
  },
};

const Row = ({ label, value, mono = false }) => (
  <div
    className="flex flex-col gap-1 px-5 py-3.5"
    style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
  >
    <span
      style={{
        fontSize: "3vw",
        color: TEXT_MUTED,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {label}
    </span>
    <span
      className={mono ? "font-mono break-all" : "font-semibold"}
      style={{
        fontSize: mono ? "3.2vw" : "3.8vw",
        color: TEXT_PRIMARY,
        lineHeight: 1.5,
      }}
    >
      {value || "—"}
    </span>
  </div>
);

const TransactionHistory = ({ details, onClose }) => {
  const status = details?.status?.toLowerCase() || "pending";
  const statusInfo = statusStyle[status] || statusStyle.pending;

  return (
    <div className="fixed inset-0 z-[2016] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md rounded-t-3xl overflow-hidden z-10"
        style={{
          background: "#111118",
          border: `1px solid ${DARK_BORDER}`,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "#1e293b" }}
          />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${DARK_BORDER}` }}
        >
          <div className="flex items-center gap-3">
            <img
              src={`/assets/images/coins/${details?.coin_symbol?.toLowerCase()}-logo.png`}
              alt={details?.coin_symbol}
              className="w-10 h-10 rounded-full object-contain flex-shrink-0"
            />
            <div>
              <p
                className="font-bold"
                style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
              >
                Transaction Details
              </p>
              <p style={{ fontSize: "3vw", color: TEXT_MUTED, marginTop: 2 }}>
                {details?.coin_symbol} Wallet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${DARK_BORDER}`,
              color: TEXT_MUTED,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status pill */}
        <div
          className="flex justify-center py-4"
          style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
        >
          <span
            className="flex items-center gap-2 px-5 py-2 rounded-full font-bold"
            style={{
              fontSize: "3.5vw",
              color: statusInfo.color,
              background: statusInfo.bg,
              border: `1px solid ${statusInfo.border}`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: statusInfo.color }}
            />
            {details?.status?.charAt(0).toUpperCase() +
              details?.status?.slice(1) || "Pending"}
          </span>
        </div>

        {/* Amount highlight */}
        <div
          className="flex flex-col items-center py-5"
          style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
        >
          <p style={{ fontSize: "3vw", color: TEXT_MUTED, marginBottom: 4 }}>
            Amount
          </p>
          <p
            className="font-black"
            style={{
              fontSize: "9vw",
              color: TEXT_PRIMARY,
              letterSpacing: "-0.02em",
            }}
          >
            {details ? parseFloat(details.amount).toFixed(2) : "—"}
          </p>
          <p style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
            {details?.coin_symbol} USDT
          </p>
        </div>

        {/* Detail rows */}
        <div className="pb-6">
          <Row label="Transaction Hash" value={details?.trans_hash} mono />
          <Row label="Sender" value={details?.wallet_from} mono />
          <Row label="Receiver" value={details?.wallet_to} mono />
          <Row label="Status" value={details?.status} />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
