import React, { useEffect, useState, useCallback } from "react";
import imgWallet from "../../Assets/images/img_wallet.png";
import Header from "../Header/Header";
import { Link } from "react-router-dom";
import useWallets from "../../hooks/useWallets";
import { useUser } from "../../context/UserContext";
import useCryptoTradeConverter from "../../hooks/userCryptoTradeConverter";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";

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
        className="relative overflow-hidden px-5 pt-6 pb-6 mx-4 mt-4 rounded-3xl"
        style={{
          background:
            "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%)",
        }}
      >
        <div
          className="absolute bottom-0 left-0 w-56 h-40 rounded-full opacity-20"
          style={{
            background: "#a5b4fc",
            filter: "blur(40px)",
            transform: "translate(-20%,30%)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
          style={{
            background: "#f9a8d4",
            filter: "blur(36px)",
            transform: "translate(20%,-20%)",
          }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h1
              className="text-white font-extrabold leading-tight mb-0.5"
              style={{ fontSize: "5.5vw" }}
            >
              Send Crypto Now
            </h1>
            <p
              className="text-white/80 leading-snug mb-4"
              style={{ fontSize: "3.5vw" }}
            >
              Choose a wallet to send crypto from
            </p>

            {/* Balance card */}
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="text-white/70 font-semibold uppercase tracking-wider"
                  style={{ fontSize: "2.8vw" }}
                >
                  Total Balance
                </span>
                <button
                  onClick={toggleBalance}
                  aria-label={balanceVisible ? "Hide balance" : "Show balance"}
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    border: "none",
                    borderRadius: "50%",
                    width: 27,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    padding: 0,
                    transition: "background 0.2s, transform 0.15s",
                  }}
                >
                  {balanceVisible ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
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
                  fontSize: "1.2rem",
                  letterSpacing: "-0.02em",
                  ...blurStyle,
                }}
              >
                ${totalBalance.toFixed(2)}
              </p>
              <p className="text-white/55 mt-1.5" style={{ fontSize: "3vw" }}>
                {wallets?.length ?? 0} wallet{wallets?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <img
            src={imgWallet}
            alt="Wallet"
            className="w-28 h-24 object-contain flex-shrink-0"
            style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" }}
          />
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
        {filtered?.map((wallet) => (
          <Link
            key={wallet.id}
            to="/funds"
            state={{ wallet, coinAmount: coinValues[wallet.coin_id] }}
            className="flex items-center justify-between py-4 no-underline"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <img
                className="w-10 h-10 rounded-full object-contain"
                src={`/assets/images/coins/${wallet.coin_symbol.toLowerCase()}-logo.png`}
                alt={wallet.coin_symbol}
              />
              <div>
                <p
                  className="font-bold leading-tight"
                  style={{ color: "#f1f5f9", fontSize: "3.8vw" }}
                >
                  {wallet.coin_symbol} Wallet
                </p>
                <p
                  className="mt-0.5"
                  style={{ color: "#64748b", fontSize: "3.2vw" }}
                >
                  {wallet.coin_symbol} Coin
                </p>
              </div>
            </div>

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
      </div>

      {/* bottom spacing */}
      <div className="h-8" />
    </div>
  );
}

export default Account;
