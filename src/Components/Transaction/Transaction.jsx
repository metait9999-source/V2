import React, { useState } from "react";
import Deposit from "./Deposit";
import Withdraw from "./Withdraw";
import TransactionHistory from "./TransactionHistory";
import Header from "../Header/Header";

const DARK_BG = "#0a0a0f";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_MUTED = "#64748b";
const ACCENT = "#7c3aed";

const Transaction = () => {
  const [activeTab, setActiveTab] = useState("deposit");
  const [showHistory, setShowHistory] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

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
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: DARK_BG }}
    >
      <div className="flex-shrink-0">
        <Header pageTitle="Transaction" />
      </div>

      {/* Tab switcher */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "deposit" ? (
          <Deposit openTransactionHistory={openTransactionHistory} />
        ) : (
          <Withdraw openTransactionHistory={openTransactionHistory} />
        )}
      </div>

      {showHistory && (
        <TransactionHistory
          details={transactionDetails}
          onClose={closeTransactionHistory}
        />
      )}
    </div>
  );
};

export default Transaction;
