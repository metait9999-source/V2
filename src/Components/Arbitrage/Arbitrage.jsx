import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "../../context/UserContext";
import { format } from "date-fns";
import Header from "../Header/Header";
import useWallets from "../../hooks/useWallets";
import {
  getPackages,
  getUserSubscriptions,
  subscribePackage,
  cancelSubscription,
} from "../../api/arbitrage.api";
import { useNavigate } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";

/* ─── Theme ── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";
const TEXT_SUB = "#475569";
const ACCENT = "#7c3aed";

const SUPPORTED_COINS = ["USDT", "BTC", "ETH"];
const COIN_COLORS = { USDT: "#26a17b", BTC: "#f7931a", ETH: "#627eea" };

/* ─── Status badge styles (dark-friendly) ── */
const statusStyle = {
  active: {
    background: "rgba(16,185,129,0.12)",
    color: "rgb(16,185,129)",
    border: "1px solid rgba(16,185,129,0.2)",
  },
  completed: {
    background: "rgba(100,116,139,0.12)",
    color: "white",
    border: "1px solid rgba(100,116,139,0.2)",
  },
  cancelled: {
    background: "rgba(239,68,68,0.12)",
    color: "rgb(239,68,68)",
    border: "1px solid rgba(239,68,68,0.2)",
  },
};

/* ─── Icons ── */
const CoinLogo = ({ symbol, size = 36, selected = false, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      padding: 0,
      border: selected
        ? `2.5px solid ${ACCENT}`
        : "2.5px solid rgba(255,255,255,0.1)",
      boxShadow: selected ? `0 0 0 2px rgba(124,58,237,0.3)` : "none",
      background: "none",
      cursor: onClick ? "pointer" : "default",
      flexShrink: 0,
      transition: "border 0.2s, box-shadow 0.2s",
    }}
  >
    <img
      src={`/assets/images/coins/${symbol.toLowerCase()}-logo.png`}
      alt={symbol}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        display: "block",
      }}
      onError={(e) => {
        e.target.style.display = "none";
        e.target.parentNode.style.background = COIN_COLORS[symbol] || "#333";
      }}
    />
  </button>
);

const ShieldIcon = () => (
  <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
    <path
      d="M10 1L2 4.5v6C2 15.1 5.5 19.6 10 21c4.5-1.4 8-5.9 8-10.5v-6L10 1z"
      fill="#22c55e"
      opacity=".15"
      stroke="#22c55e"
      strokeWidth="1.5"
    />
    <path
      d="M7 11l2 2 4-4"
      stroke="#22c55e"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="flex-shrink-0 mt-0.5"
  >
    <circle cx="8" cy="8" r="7" fill="#6366f1" opacity=".2" />
    <path
      d="M5 8l2 2 4-4"
      stroke="#818cf8"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowsUpDown = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M5 2L3 4l2 2M3 4h7M9 12l2-2-2-2M11 10H4"
      stroke="#818cf8"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ════════════════════════════════════════════════════════════════
   WALLET BALANCE BAR
════════════════════════════════════════════════════════════════ */
const WalletBalanceBar = ({ wallets }) => {
  const supported =
    wallets?.filter((w) =>
      SUPPORTED_COINS.includes(w.coin_symbol?.toUpperCase()),
    ) || [];

  return (
    <div className="mx-4 mb-4">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
        >
          <p
            className="font-semibold uppercase tracking-wide"
            style={{ fontSize: "3vw", color: TEXT_MUTED }}
          >
            My Wallets
          </p>
        </div>
        <div>
          {supported.length === 0 ? (
            <div
              className="px-4 py-4 text-center"
              style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}
            >
              No wallets found
            </div>
          ) : (
            supported.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: `${COIN_COLORS[w.coin_symbol] || "#333"}25`,
                    }}
                  >
                    <img
                      src={`/assets/images/coins/${w.coin_symbol.toLowerCase()}-logo.png`}
                      alt={w.coin_symbol}
                      className="w-6 h-6 rounded-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                    >
                      {w.coin_symbol}
                    </p>
                    <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                      {w.coin_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="font-bold"
                    style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                  >
                    {parseFloat(w.coin_amount || 0).toFixed(4)}
                  </p>
                  <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                    ≈ US$ {parseFloat(w.usd_amount || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   HOSTING WORK PAGE
════════════════════════════════════════════════════════════════ */
const HostingWorkPage = ({
  onGoToArbitrage,
  packages,
  subscriptions,
  loadingHistory,
  onCancelSubscription,
  wallets,
}) => {
  const totalEarned = subscriptions
    .reduce((sum, s) => sum + parseFloat(s.total_earned || 0), 0)
    .toFixed(4);
  const todayEarned = subscriptions
    .filter(
      (s) =>
        s.last_paid_at &&
        new Date(s.last_paid_at).toDateString() === new Date().toDateString(),
    )
    .reduce(
      (sum, s) => sum + (parseFloat(s.amount) * parseFloat(s.daily_rate)) / 100,
      0,
    )
    .toFixed(4);
  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen pb-8" style={{ background: DARK_BG }}>
      <Header pageTitle="Arbitrage" />

      {/* Hero */}
      <div
        className="relative overflow-hidden flex flex-col items-center pt-6 pb-12 px-5"
        style={{
          background:
            "linear-gradient(145deg,#7c3aed 0%,#a855f7 45%,#ec4899 100%)",
        }}
      >
        <div
          style={{
            background: "#fff",
            filter: "blur(48px)",
            transform: "translate(30%,-30%)",
          }}
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            bottom: 0,
            left: 0,
            width: "40vw",
            height: "40vw",
            background: "#a5b4fc",
            filter: "blur(36px)",
            transform: "translate(-20%,40%)",
            opacity: 0.15,
          }}
        />

        <p
          className="text-white/70 font-semibold tracking-widest uppercase relative z-10 mb-2"
          style={{ fontSize: "3vw" }}
        >
          Total Earnings
        </p>
        <div
          className="text-white font-black relative z-10 mb-1"
          style={{ fontSize: "10vw", letterSpacing: "-1px" }}
        >
          ${totalEarned}
        </div>
        <p
          className="text-white/60 relative z-10 mb-6"
          style={{ fontSize: "3vw" }}
        >
          {activeCount} active subscription{activeCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stats row */}
      <div className="mx-4 -mt-5 relative z-10 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Today", value: todayEarned, unit: "USDT" },
            { label: "Active", value: activeCount, unit: "plans" },
            { label: "Total", value: subscriptions.length, unit: "all time" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 text-center"
              style={{
                background: DARK_CARD2,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <p
                style={{ fontSize: "3vw", color: TEXT_MUTED, marginBottom: 4 }}
              >
                {s.label}
              </p>
              <p
                className="font-bold"
                style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
              >
                {s.value}
              </p>
              <p style={{ fontSize: "2.8vw", color: TEXT_MUTED }}>{s.unit}</p>
            </div>
          ))}
        </div>
      </div>

      <WalletBalanceBar wallets={wallets} />

      {/* Packages */}
      <div className="px-4 mb-4">
        <p
          className="font-extrabold mb-3"
          style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
        >
          Arbitrage Products
        </p>
        {packages.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            <p style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}>
              No packages available
            </p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-3xl overflow-hidden mb-4"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}
              />
              <div className="px-5 pt-4 pb-5">
                <div
                  className="flex items-start gap-3 mb-4 pb-4"
                  style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
                >
                  <div
                    className="px-3 py-1 rounded-xl font-bold flex-shrink-0"
                    style={{
                      background: "rgba(124,58,237,0.2)",
                      color: "#a78bfa",
                      fontSize: "3.5vw",
                    }}
                  >
                    {pkg.duration_days} Days
                  </div>
                  <p
                    style={{
                      color: TEXT_MUTED,
                      fontSize: "3.5vw",
                      lineHeight: 1.5,
                    }}
                  >
                    Financial product — redeemable within {pkg.duration_days}{" "}
                    days
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p
                      style={{
                        color: TEXT_MUTED,
                        fontSize: "3vw",
                        marginBottom: 4,
                      }}
                    >
                      Amount range
                    </p>
                    <p
                      className="font-semibold"
                      style={{ fontSize: "3.5vw", color: TEXT_PRIMARY }}
                    >
                      {Number(pkg.min_amount).toLocaleString()} –{" "}
                      {Number(pkg.max_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        color: TEXT_MUTED,
                        fontSize: "3vw",
                        marginBottom: 4,
                      }}
                    >
                      Daily income
                    </p>
                    <p
                      className="font-bold"
                      style={{ fontSize: "3.5vw", color: ACCENT }}
                    >
                      {pkg.daily_rate_min}–{pkg.daily_rate_max}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      style={{
                        color: TEXT_MUTED,
                        fontSize: "3vw",
                        marginBottom: 8,
                      }}
                    >
                      Supported coins
                    </p>
                    <div className="flex items-center gap-1.5">
                      {SUPPORTED_COINS.map((symbol) => (
                        <CoinLogo key={symbol} symbol={symbol} size={32} />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onGoToArbitrage(pkg)}
                    className="px-6 py-2.5 rounded-xl text-white font-bold transition-transform active:scale-95"
                    style={{
                      fontSize: "3.5vw",
                      background: "linear-gradient(90deg,#f472b6,#a855f7)",
                      boxShadow: "0 4px 14px rgba(168,85,247,0.35)",
                    }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subscription history */}
      <div className="px-4">
        <p
          className="font-extrabold mb-3"
          style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
        >
          My Subscriptions
        </p>
        {loadingHistory ? (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            <p style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}>Loading...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div
            className="rounded-3xl p-8 text-center"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            <p style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}>
              No subscriptions yet
            </p>
            <p style={{ color: TEXT_SUB, fontSize: "3vw", marginTop: 4 }}>
              Subscribe to a package to start earning
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: DARK_CARD,
                  border: `1px solid ${DARK_BORDER}`,
                }}
              >
                <div
                  className="h-0.5 w-full"
                  style={{
                    background: "linear-gradient(90deg,#7c3aed,#ec4899)",
                  }}
                />
                <div className="px-4 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p
                        className="font-bold"
                        style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                      >
                        {sub.package_name}
                      </p>
                      <p
                        style={{
                          fontSize: "3vw",
                          color: TEXT_MUTED,
                          marginTop: 2,
                        }}
                      >
                        {sub.duration_days} days · {sub.coin_id}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full font-semibold"
                      style={{
                        fontSize: "3vw",
                        ...(statusStyle[sub.status] || statusStyle.completed),
                      }}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div
                    className="grid grid-cols-3 gap-3 pt-3"
                    style={{ borderTop: `1px solid ${DARK_BORDER2}` }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "3vw",
                          color: TEXT_MUTED,
                          marginBottom: 2,
                        }}
                      >
                        Principal
                      </p>
                      <p
                        className="font-semibold"
                        style={{ fontSize: "3.5vw", color: TEXT_PRIMARY }}
                      >
                        {Number(sub.amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "3vw",
                          color: TEXT_MUTED,
                          marginBottom: 2,
                        }}
                      >
                        Daily rate
                      </p>
                      <p
                        className="font-semibold"
                        style={{ fontSize: "3.5vw", color: "#a78bfa" }}
                      >
                        {sub.daily_rate}%
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "3vw",
                          color: TEXT_MUTED,
                          marginBottom: 2,
                        }}
                      >
                        Earned
                      </p>
                      <p
                        className="font-semibold"
                        style={{ fontSize: "3.5vw", color: "rgb(16,185,129)" }}
                      >
                        +{Number(sub.total_earned).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between mt-3 pt-3"
                    style={{ borderTop: `1px solid ${DARK_BORDER2}` }}
                  >
                    <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                      Ends {format(new Date(sub.end_date), "dd MMM yyyy")}
                    </p>
                    {sub.status === "active" && (
                      <button
                        onClick={() => onCancelSubscription(sub.id)}
                        className="font-medium underline underline-offset-2"
                        style={{
                          fontSize: "3vw",
                          color: "rgb(239,68,68)",
                          background: "transparent",
                          border: "none",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ARBITRAGE DETAIL PAGE
════════════════════════════════════════════════════════════════ */
const ArbitragePage = ({ onBack, selectedPackage, onSubscribed, wallets }) => {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [sliderVal, setSliderVal] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState("USDT");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const pkg = selectedPackage;
  const selectedWallet = wallets?.find(
    (w) => w.coin_symbol?.toUpperCase() === selectedCoin,
  );
  const maxBalance = parseFloat(selectedWallet?.coin_amount || 0);
  const expectedEarnings =
    pkg && amount
      ? ((parseFloat(amount) * parseFloat(pkg.daily_rate_min)) / 100).toFixed(2)
      : "0.00";
  const isInsufficientBalance = parseFloat(amount) > maxBalance;

  const benefits = [
    "Daily income is sent to your USDT, BTC, ETH wallet",
    "Zero risk of your investment funds",
    "You can get your funds back anytime",
    "Artificial intelligence works 24 hours a day",
  ];

  const handleSubscribe = async () => {
    if (!pkg) return toast.error("Please select a package");
    if (!amount || parseFloat(amount) <= 0)
      return toast.error("Please enter an amount");
    if (parseFloat(amount) < parseFloat(pkg.min_amount))
      return toast.error(
        `Minimum amount is ${Number(pkg.min_amount).toLocaleString()}`,
      );
    if (parseFloat(amount) > parseFloat(pkg.max_amount))
      return toast.error(
        `Maximum amount is ${Number(pkg.max_amount).toLocaleString()}`,
      );
    if (isInsufficientBalance) return toast.error("Insufficient balance");
    try {
      setSubmitting(true);
      await subscribePackage({
        userId: user.id,
        packageId: pkg.id,
        coinId: selectedWallet?.coin_id,
        amount: parseFloat(amount),
      });
      toast.success("Subscribed successfully!");
      onSubscribed();
      onBack();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to subscribe");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecharge = () => {
    const wallet = wallets?.find(
      (w) => w.coin_symbol?.toUpperCase() === selectedCoin,
    );
    if (wallet)
      navigate("/funds", { state: { wallet, coinAmount: wallet.coin_amount } });
    else toast.error("Wallet not found for selected coin");
  };

  return (
    <div className="min-h-screen pb-8" style={{ background: DARK_BG }}>
      {/* Custom header with onBack wired to hosting page */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          background: "#0a0a0f",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <IoMdArrowRoundBack color="white" size={25} />
        </button>
        <span
          className="font-semibold truncate mx-3 flex-1 text-center"
          style={{ color: "#f1f5f9", fontSize: "4.2vw" }}
        >
          Arbitrage
        </span>
        <div className="w-9 h-9" />
      </div>

      {/* Gradient header */}
      <div
        className="relative overflow-hidden flex flex-col items-center pt-6 pb-16 px-5"
        style={{
          background:
            "linear-gradient(145deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)",
          minHeight: 160,
        }}
      >
        <div
          className="absolute top-0 right-0 w-52 h-52 rounded-full opacity-20 pointer-events-none"
          style={{
            background: "#fff",
            filter: "blur(48px)",
            transform: "translate(30%,-30%)",
          }}
        />
        <p
          className="text-white font-extrabold relative z-10"
          style={{ fontSize: "5.5vw" }}
        >
          {pkg ? pkg.name : "AI Arbitrage"}
        </p>
        {pkg && (
          <p
            className="text-white/70 relative z-10 mt-1"
            style={{ fontSize: "3.5vw" }}
          >
            {pkg.duration_days} days · {pkg.daily_rate_min}–{pkg.daily_rate_max}
            % daily
          </p>
        )}
      </div>

      {/* Hero banner */}
      <div className="mx-4 -mt-8 relative z-10 mb-4">
        <div
          className="rounded-3xl overflow-hidden shadow-xl"
          style={{
            background:
              "linear-gradient(135deg,#3b4fd8 0%,#6366f1 55%,#818cf8 100%)",
          }}
        >
          <div className="px-5 py-5 flex items-center justify-between">
            <div>
              <p
                className="text-cyan-300 font-extrabold mb-1"
                style={{ fontSize: "5.5vw" }}
              >
                Join AI Arbitrage
              </p>
              <p className="text-indigo-200" style={{ fontSize: "3.5vw" }}>
                Zero risk, fast return
              </p>
            </div>
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <div
                className="w-12 h-14 rounded-2xl flex flex-col items-center justify-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                </div>
                <div className="w-6 h-1.5 rounded-full bg-cyan-400" />
                <p
                  className="text-indigo-200 font-bold"
                  style={{ fontSize: "3vw" }}
                >
                  AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main detail card */}
      <div
        className="mx-4 rounded-3xl overflow-hidden mb-4"
        style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
      >
        <div
          className="h-1"
          style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}
        />
        <div className="px-5 py-5">
          {/* Header row */}
          <div
            className="flex items-center justify-between mb-5 pb-4"
            style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
          >
            <div className="flex items-center gap-2">
              <ShieldIcon />
              <span
                className="font-bold"
                style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
              >
                AI Arbitrage
              </span>
            </div>
            {pkg && (
              <div
                className="px-3 py-1 rounded-xl font-bold"
                style={{
                  background: "rgba(124,58,237,0.2)",
                  color: "#a78bfa",
                  fontSize: "3.5vw",
                }}
              >
                {pkg.duration_days} Days
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div
            className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5 pb-5"
            style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
          >
            <div>
              <p
                style={{ color: TEXT_MUTED, fontSize: "3vw", marginBottom: 4 }}
              >
                Amount range
              </p>
              <p
                className="font-semibold"
                style={{ fontSize: "3.5vw", color: TEXT_PRIMARY }}
              >
                {pkg
                  ? `${Number(pkg.min_amount).toLocaleString()} – ${Number(pkg.max_amount).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p
                style={{ color: TEXT_MUTED, fontSize: "3vw", marginBottom: 4 }}
              >
                Daily income
              </p>
              <p
                className="font-extrabold"
                style={{ fontSize: "3.5vw", color: "#a78bfa" }}
              >
                {pkg ? `${pkg.daily_rate_min}–${pkg.daily_rate_max}%` : "—"}
              </p>
            </div>
            <div>
              <p
                style={{ color: TEXT_MUTED, fontSize: "3vw", marginBottom: 4 }}
              >
                Available ({selectedCoin})
              </p>
              <p
                className="font-semibold"
                style={{ fontSize: "3.5vw", color: TEXT_PRIMARY }}
              >
                {maxBalance.toFixed(4)}
              </p>
            </div>
            <div>
              <p
                style={{ color: TEXT_MUTED, fontSize: "3vw", marginBottom: 4 }}
              >
                Expected earnings/day
              </p>
              <p
                className="font-extrabold"
                style={{ fontSize: "3.5vw", color: "rgb(16,185,129)" }}
              >
                {expectedEarnings}
              </p>
            </div>
          </div>

          {/* Coin selector */}
          <div
            className="mb-5 pb-5"
            style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
          >
            <p
              style={{
                color: TEXT_MUTED,
                fontSize: "3vw",
                fontWeight: 500,
                marginBottom: 12,
              }}
            >
              Select coin
            </p>
            <div className="flex items-center gap-3">
              {SUPPORTED_COINS.map((symbol) => (
                <div key={symbol} className="flex flex-col items-center gap-1">
                  <CoinLogo
                    symbol={symbol}
                    size={40}
                    selected={selectedCoin === symbol}
                    onClick={() => setSelectedCoin(symbol)}
                  />
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: "3vw",
                      color: selectedCoin === symbol ? "#a78bfa" : TEXT_MUTED,
                    }}
                  >
                    {symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                Hosting Amount
              </p>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                  {maxBalance.toFixed(4)} {selectedCoin}
                </span>
                {maxBalance <= 0 ? (
                  <button
                    onClick={handleRecharge}
                    className="font-bold px-2.5 py-1 rounded-lg text-white"
                    style={{
                      fontSize: "3vw",
                      background: "linear-gradient(90deg,#f472b6,#a855f7)",
                    }}
                  >
                    + Recharge
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAmount(maxBalance.toString());
                      setSliderVal(100);
                    }}
                    className="font-semibold"
                    style={{
                      fontSize: "3vw",
                      color: "#a78bfa",
                      background: "transparent",
                      border: "none",
                    }}
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{
                border: `2px solid ${isInsufficientBalance ? "#ef4444" : parseFloat(amount) > 0 ? ACCENT : DARK_BORDER}`,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <CoinLogo symbol={selectedCoin} size={32} />
              <div className="flex items-center gap-1">
                <ArrowsUpDown />
              </div>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val);
                  if (maxBalance > 0)
                    setSliderVal(
                      Math.min(100, (parseFloat(val) / maxBalance) * 100) || 0,
                    );
                }}
                placeholder="0.00"
                className="flex-1 bg-transparent font-bold outline-none"
                style={{ fontSize: "5vw", color: TEXT_PRIMARY }}
              />
              <span
                style={{
                  fontSize: "3.5vw",
                  color: TEXT_MUTED,
                  fontWeight: 500,
                }}
              >
                {selectedCoin}
              </span>
            </div>
          </div>

          {/* Insufficient / min-max */}
          <div className="flex items-center justify-between mb-5">
            {isInsufficientBalance ? (
              <div className="flex items-center justify-between w-full">
                <p
                  className="font-semibold"
                  style={{ fontSize: "3vw", color: "rgb(239,68,68)" }}
                >
                  Insufficient balance
                </p>
                <button
                  onClick={handleRecharge}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-white transition-transform active:scale-95"
                  style={{
                    fontSize: "3vw",
                    background: "linear-gradient(90deg,#f472b6,#a855f7)",
                    boxShadow: "0 4px 12px rgba(168,85,247,0.3)",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  Recharge {selectedCoin}
                </button>
              </div>
            ) : (
              <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                {pkg
                  ? `Min: ${Number(pkg.min_amount).toLocaleString()} · Max: ${Number(pkg.max_amount).toLocaleString()}`
                  : ""}
              </p>
            )}
          </div>

          {/* Slider */}
          <div className="mb-5">
            <input
              type="range"
              min={0}
              max={100}
              value={sliderVal}
              step={1}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setSliderVal(val);
                setAmount(((maxBalance * val) / 100).toFixed(4));
              }}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(90deg, ${ACCENT} ${sliderVal}%, rgba(255,255,255,0.1) ${sliderVal}%)`,
                accentColor: ACCENT,
              }}
            />
            <div
              className="flex justify-between mt-1"
              style={{ fontSize: "3vw", color: TEXT_SUB }}
            >
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            disabled={
              submitting ||
              !amount ||
              parseFloat(amount) <= 0 ||
              isInsufficientBalance
            }
            className="w-full py-4 rounded-2xl text-white font-extrabold transition-transform active:scale-98 disabled:opacity-50"
            style={{
              fontSize: "4.5vw",
              background: "linear-gradient(90deg,#f472b6,#a855f7)",
              boxShadow: "0 8px 24px rgba(168,85,247,0.4)",
            }}
          >
            {submitting ? "Processing..." : "Hosting Now"}
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div
        className="mx-4 rounded-3xl px-5 py-5"
        style={{ background: DARK_CARD, border: `1px solid ${DARK_BORDER}` }}
      >
        <p
          className="font-bold mb-4"
          style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
        >
          Why choose AI Arbitrage?
        </p>
        <div className="flex flex-col gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckIcon />
              <p
                style={{
                  fontSize: "3.5vw",
                  color: TEXT_MUTED,
                  lineHeight: 1.6,
                }}
              >
                {b}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════════════════════ */
export default function ArbitrageRoot() {
  const { user } = useUser();
  const { wallets } = useWallets(user?.id);
  const [page, setPage] = useState("hosting");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const supportedWallets =
    wallets?.filter((w) =>
      SUPPORTED_COINS.includes(w.coin_symbol?.toUpperCase()),
    ) || [];

  useEffect(() => {
    fetchPackages();
  }, []);
  useEffect(() => {
    if (user?.id) fetchSubscriptions();
  }, [user?.id]);

  const fetchPackages = async () => {
    try {
      const res = await getPackages();
      setPackages(res.data);
    } catch {
      toast.error("Failed to load packages");
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingHistory(true);
      const res = await getUserSubscriptions(user.id);
      setSubscriptions(res.data);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGoToArbitrage = (pkg) => {
    setSelectedPackage(pkg);
    setPage("arbitrage");
  };

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await cancelSubscription({ subscriptionId, userId: user.id });
      toast.success("Subscription cancelled — principal returned to balance");
      fetchSubscriptions();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  if (page === "arbitrage") {
    return (
      <ArbitragePage
        onBack={() => setPage("hosting")}
        selectedPackage={selectedPackage}
        onSubscribed={fetchSubscriptions}
        wallets={supportedWallets}
      />
    );
  }

  return (
    <HostingWorkPage
      onGoToArbitrage={handleGoToArbitrage}
      packages={packages}
      subscriptions={subscriptions}
      loadingHistory={loadingHistory}
      onCancelSubscription={handleCancelSubscription}
      wallets={supportedWallets}
    />
  );
}
