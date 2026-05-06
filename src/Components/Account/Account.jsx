import React, { useEffect, useState, useCallback } from "react";
import Header from "../Header/Header";
import { Link } from "react-router-dom";
import useWallets from "../../hooks/useWallets";
import { useUser } from "../../context/UserContext";
import useCryptoTradeConverter from "../../hooks/userCryptoTradeConverter";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import { MdVerified } from "react-icons/md";

const VerifiedBadge = () => (
  <MdVerified
    size={15}
    style={{
      flexShrink: 0,
      color: "#1877F2",
      filter: "drop-shadow(0 0 0 white)",
    }}
  />
);

// ── Coin logo: resolves uploaded file, CDN URL, or local asset ───────────────
const resolveLogoSrc = (wallet) => {
  const { coin_logo, coin_symbol } = wallet;
  if (coin_logo) {
    if (coin_logo.startsWith("uploads/")) return `${API_BASE_URL}/${coin_logo}`;
    if (coin_logo.startsWith("http")) return coin_logo; // CDN URL
  }
  return `/assets/images/coins/${coin_symbol.toLowerCase()}-logo.png`; // local fallback
};

function Account() {
  const { user, setUser } = useUser();
  const { wallets } = useWallets(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [coinValues, setCoinValues] = useState({});
  const { convertUSDTToCoin } = useCryptoTradeConverter();
  const [balanceVisible, setBalanceVisible] = useState(
    () => user?.balance_visible === 1 || user?.balance_visible === true,
  );

  const fetchConvertedValues = useCallback(async () => {
    if (!wallets?.length) return;
    const newCoinValues = {};
    for (const wallet of wallets) {
      try {
        const convertedCoin = await convertUSDTToCoin(
          wallet?.coin_amount,
          wallet.coin_id,
        );
        newCoinValues[wallet.coin_id] = convertedCoin;
      } catch {
        newCoinValues[wallet.coin_id] = null;
      }
    }
    setCoinValues(newCoinValues);
  }, [wallets, convertUSDTToCoin]);

  useEffect(() => {
    fetchConvertedValues();
  }, [fetchConvertedValues]);

  const toggleBalance = async () => {
    const newVal = !balanceVisible;
    setBalanceVisible(newVal);
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}/balance-visibility`, {
        balance_visible: newVal ? 1 : 0,
      });
      if (setUser)
        setUser((prev) => ({ ...prev, balance_visible: newVal ? 1 : 0 }));
    } catch {
      setBalanceVisible(!newVal);
    }
  };

  const totalBalance =
    wallets?.reduce(
      (sum, wallet) => sum + parseFloat(wallet.coin_amount || 0),
      0,
    ) ?? 0;

  const filtered = wallets?.filter((w) =>
    w.coin_symbol.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const blurStyle = {
    filter: balanceVisible ? "blur(0px)" : "blur(7px)",
    transition: "filter 0.35s cubic-bezier(0.4,0,0.2,1)",
    userSelect: balanceVisible ? "text" : "none",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <Header pageTitle="" />

      {/* ── Banner ── */}
      <div
        className="relative px-5 pt-6 pb-6 mx-4 mt-4 rounded-3xl"
        style={{
          zIndex: 0,
          background:
            "linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4c1d95 100%)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow:
            "0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Glow blobs */}
        <div
          className="absolute bottom-0 left-0 w-56 h-40 rounded-full opacity-30"
          style={{
            background: "#6366f1",
            filter: "blur(50px)",
            transform: "translate(-20%,30%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
          style={{
            background: "#a78bfa",
            filter: "blur(40px)",
            transform: "translate(20%,-20%)",
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex-1">
            <p
              className="text-violet-300 font-semibold uppercase tracking-widest mb-1"
              style={{ fontSize: "2.6vw" }}
            >
              Your Portfolio
            </p>
            <h1
              className="text-white font-extrabold leading-tight mb-4"
              style={{ fontSize: "5.2vw" }}
            >
              Send Crypto Now
            </h1>

            {/* Balance card */}
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 6, height: 6, background: "#34d399" }}
                />
                <span
                  className="text-violet-300 font-semibold uppercase tracking-widest"
                  style={{ fontSize: "2.6vw" }}
                >
                  Total Balance
                </span>
                <button
                  onClick={toggleBalance}
                  aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                  style={{
                    background: "rgba(139,92,246,0.25)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    padding: 0,
                    transition: "all 0.2s",
                    marginLeft: "auto",
                  }}
                >
                  {balanceVisible ? (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>

              <p
                className="text-white font-extrabold leading-none select-none"
                style={{
                  fontSize: "1.35rem",
                  letterSpacing: "-0.03em",
                  ...blurStyle,
                }}
              >
                ${totalBalance.toFixed(2)}
                <span
                  className="text-violet-300 font-semibold ml-1"
                  style={{ fontSize: "3vw" }}
                >
                  USDT
                </span>
              </p>

              <div className="flex items-center justify-between mt-2">
                <p className="text-violet-400" style={{ fontSize: "2.8vw" }}>
                  {wallets?.length ?? 0} wallet
                  {wallets?.length !== 1 ? "s" : ""}
                </p>
                <div
                  className="rounded-full px-2 py-0.5 flex items-center gap-1"
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#34d399",
                    }}
                  />
                  <span
                    style={{
                      color: "#34d399",
                      fontSize: "2.4vw",
                      fontWeight: 600,
                    }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Icon */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-2xl"
            style={{
              width: "18vw",
              height: "18vw",
              maxWidth: 72,
              maxHeight: 72,
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.2) 100%)",
              border: "1px solid rgba(139,92,246,0.4)",
              boxShadow:
                "0 4px 24px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="url(#walletGrad)"
              style={{
                width: "10vw",
                height: "10vw",
                maxWidth: 40,
                maxHeight: 40,
              }}
            >
              <defs>
                <linearGradient
                  id="walletGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <path d="M2 7a2 2 0 012-2h16a2 2 0 012 2v1H2V7zm0 3h20v9a2 2 0 01-2 2H4a2 2 0 01-2-2v-9zm13 3a1 1 0 000 2h2a1 1 0 000-2h-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Select + Search ── */}
      <div className="px-4 py-4 flex items-center gap-3">
        <h2
          className="font-extrabold whitespace-nowrap"
          style={{ color: "#f1f5f9", fontSize: "4.5vw" }}
        >
          Select a wallet
        </h2>
        <div
          className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2.5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            className="flex-shrink-0"
          >
            <circle cx="7" cy="7" r="5" stroke="#475569" strokeWidth="1.5" />
            <path
              d="M11 11l3 3"
              stroke="#475569"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="search"
            placeholder="Search"
            className="flex-1 bg-transparent outline-none"
            style={{ color: "#f1f5f9", fontSize: "3.8vw" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Wallet list ── */}
      <div
        className="px-4 mx-4 rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {filtered?.map((wallet, idx) => (
          <Link
            key={wallet.id}
            to="/funds"
            state={{ wallet, coinAmount: coinValues[wallet.coin_id] }}
            className="flex items-center justify-between py-4 no-underline"
            style={{
              borderBottom:
                idx < filtered.length - 1
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "none",
            }}
          >
            {/* Left: logo + name */}
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  className="rounded-full object-contain bg-white"
                  style={{
                    width: "10vw",
                    height: "10vw",
                    maxWidth: 40,
                    maxHeight: 40,
                  }}
                  src={resolveLogoSrc(wallet)}
                  alt={wallet.coin_symbol}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                {/* Initials fallback */}
                <div
                  style={{
                    display: "none",
                    width: "10vw",
                    height: "10vw",
                    maxWidth: 40,
                    maxHeight: 40,
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.25)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                    fontWeight: 700,
                    fontSize: "3vw",
                  }}
                >
                  {wallet.coin_symbol?.slice(0, 2)}
                </div>
              </div>

              <div>
                {/* Coin name + bluetick inline */}
                <div className="flex items-center gap-1 leading-tight">
                  <p
                    className="font-bold"
                    style={{
                      color: "#f1f5f9",
                      fontSize: "3.8vw",
                      lineHeight: 1.2,
                    }}
                  >
                    {wallet.coin_symbol} Wallet
                  </p>
                  {/* ── Bluetick verified badge ── */}
                  <VerifiedBadge />
                </div>
                <p
                  className="mt-0.5"
                  style={{ color: "#64748b", fontSize: "3.2vw" }}
                >
                  {wallet.coin_name}
                </p>
              </div>
            </div>

            {/* Right: balance */}
            <div className="text-right">
              <p
                className="font-semibold"
                style={{ color: "#f1f5f9", fontSize: "3.8vw" }}
              >
                {balanceVisible
                  ? `$${parseFloat(wallet.coin_amount || 0).toFixed(4)}`
                  : "$****"}
              </p>
              <p
                className="mt-0.5"
                style={{ color: "#64748b", fontSize: "3.2vw" }}
              >
                {balanceVisible
                  ? `${coinValues[wallet.coin_id] !== undefined ? coinValues[wallet.coin_id] : "0.0000"} ${wallet.coin_symbol}`
                  : `**** ${wallet.coin_symbol}`}
              </p>
            </div>
          </Link>
        ))}

        {/* Empty state */}
        {filtered?.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-10 gap-2"
            style={{ color: "#475569" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#334155"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: "3.4vw" }}>No wallets match your search</p>
          </div>
        )}
      </div>

      {/* bottom spacing */}
      <div className="h-8" />
    </div>
  );
}

export default Account;
