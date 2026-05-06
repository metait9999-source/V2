import React, { useState } from "react";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import TransactionHistory from "./TransactionHistory";
import Header from "../Header/Header";
import { useNavigate } from "react-router";

const DARK_BG = "#0a0a0f";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_MUTED = "#64748b";
const ACCENT = "#7c3aed";

const Transaction = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [showHistory, setShowHistory] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const navigate = useNavigate();

  const openTransactionHistory = (details) => {
    setTransactionDetails(details);
    setShowHistory(true);
  };

  const closeTransactionHistory = () => {
    setShowHistory(false);
    setTransactionDetails(null);
  };

  const tabs = [
    {
      key: "deposit",
      label: "Deposit",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v14M5 10l7 7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 21h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      key: "withdraw",
      label: "Withdraw",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21V7M5 14l7-7 7 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 3h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0; transform: scale(1); }
          50%       { opacity: 1; transform: scale(1.015); }
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        .fund-wallet-btn {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .fund-wallet-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(124, 58, 237, 0.32) !important;
          border-color: rgba(167, 139, 250, 0.65) !important;
        }
        .fund-wallet-btn:active {
          transform: translateY(0px);
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.2) !important;
        }
        .fund-wallet-btn:hover .arrow-circle {
          background: rgba(124, 58, 237, 0.5) !important;
          transform: translateX(2px);
        }
        .arrow-circle {
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .glow-ring {
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          border: 1.5px solid rgba(167, 139, 250, 0.5);
          pointer-events: none;
          animation: glow-pulse 2.8s ease-in-out infinite;
        }
        .live-dot {
          animation: dot-blink 2s ease-in-out infinite;
        }
      `}</style>

      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "100dvh", background: DARK_BG }}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <Header pageTitle="Transaction" />
        </div>

        <div
          className="flex-shrink-0 px-4 pt-4 pb-0 sticky top-0 z-10"
          style={{
            background: DARK_CARD2,
            borderBottom: `1px solid ${DARK_BORDER}`,
          }}
        >
          <div className="flex gap-1 max-w-md mx-auto">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-t-xl font-semibold transition-all duration-200 focus:outline-none"
                style={{
                  fontSize: "3.8vw",
                  border: "none",
                  background:
                    activeTab === key ? "rgba(124,58,237,0.12)" : "transparent",
                  color: activeTab === key ? "#a78bfa" : TEXT_MUTED,
                }}
              >
                {icon}
                {label}
                <span
                  className="absolute bottom-0 left-3 right-3 rounded-full transition-all duration-300"
                  style={{
                    height: 2.5,
                    background: activeTab === key ? ACCENT : "transparent",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto px-4 pt-5">
            <div style={{ marginBottom: 20, position: "relative" }}>
              <button
                className="fund-wallet-btn"
                onClick={() => navigate("/account")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px 18px",
                  borderRadius: 16,
                  border: "1px solid rgba(124,58,237,0.4)",
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(139,92,246,0.10) 100%)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "visible",
                  textAlign: "left",
                }}
              >
                {/* Pulsing glow ring */}
                <span className="glow-ring" />

                {/* Left — icon + copy */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Wallet icon */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 13,
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 18px rgba(124,58,237,0.45)",
                      position: "relative",
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16 3H8L6 7h12l-2-4z"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="17" cy="13" r="1.5" fill="white" />
                    </svg>
                    {/* Live green dot */}
                    <span
                      className="live-dot"
                      style={{
                        position: "absolute",
                        top: -3,
                        right: -3,
                        width: 11,
                        height: 11,
                        borderRadius: "50%",
                        background: "#22c55e",
                        border: "2px solid #0a0a0f",
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#e2e8f0",
                        marginBottom: 3,
                        letterSpacing: "0.01em",
                      }}
                    >
                      Fund Wallet
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "#94a3b8",
                        fontWeight: 400,
                      }}
                    >
                      Add balance to your wallet
                    </div>
                  </div>
                </div>

                {/* Right — arrow */}
                <div
                  className="arrow-circle"
                  style={{
                    width: 33,
                    height: 33,
                    borderRadius: "50%",
                    background: "rgba(124,58,237,0.22)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(124,58,237,0.38)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="#a78bfa"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.07)",
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  color: "#475569",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                {activeTab === "deposit" ? "Or deposit via" : "Or withdraw via"}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.07)",
                }}
              />
            </div>

            {activeTab === "deposit" ? (
              <Deposit openTransactionHistory={openTransactionHistory} />
            ) : (
              <Withdraw openTransactionHistory={openTransactionHistory} />
            )}
          </div>
        </div>

        {showHistory && (
          <TransactionHistory
            details={transactionDetails}
            onClose={closeTransactionHistory}
          />
        )}
      </div>
    </>
  );
};

export default Transaction;
