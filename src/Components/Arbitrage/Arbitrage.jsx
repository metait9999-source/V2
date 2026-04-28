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

const SUPPORTED_COINS = ["USDT", "BTC", "ETH"];

const COIN_COLORS = {
  USDT: "#26a17b",
  BTC: "#f7931a",
  ETH: "#627eea",
};

const CoinLogo = ({ symbol, size = 36, selected = false, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      padding: 0,
      border: selected ? "2.5px solid #7c3aed" : "2.5px solid transparent",
      boxShadow: selected ? "0 0 0 2px #ede9fe" : "none",
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
        e.target.parentNode.style.background = COIN_COLORS[symbol] || "#ccc";
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
    <circle cx="8" cy="8" r="7" fill="#6366f1" opacity=".12" />
    <path
      d="M5 8l2 2 4-4"
      stroke="#6366f1"
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
      stroke="#6366f1"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const statusStyle = {
  active: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-500",
  cancelled: "bg-red-100 text-red-500",
};

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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            My Wallets
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {supported.length === 0 ? (
            <div className="px-4 py-4 text-center text-gray-400 text-sm">
              No wallets found
            </div>
          ) : (
            supported.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background: `${COIN_COLORS[w.coin_symbol] || "#ccc"}20`,
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
                    <p className="text-sm font-semibold text-gray-800">
                      {w.coin_symbol}
                    </p>
                    <p className="text-xs text-gray-400">{w.coin_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {parseFloat(w.coin_amount || 0).toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-400">
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
    .filter((s) => {
      if (!s.last_paid_at) return false;
      return (
        new Date(s.last_paid_at).toDateString() === new Date().toDateString()
      );
    })
    .reduce((sum, s) => {
      return sum + (parseFloat(s.amount) * parseFloat(s.daily_rate)) / 100;
    }, 0)
    .toFixed(4);

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header pageTitle="Arbitrage" />

      {/* Hero gradient header */}
      <div
        className="relative overflow-hidden flex flex-col items-center pt-6 pb-12 px-5"
        style={{
          background:
            "linear-gradient(145deg,#7c3aed 0%,#a855f7 45%,#ec4899 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
          style={{
            background: "#fff",
            filter: "blur(48px)",
            transform: "translate(30%,-30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-15"
          style={{
            background: "#a5b4fc",
            filter: "blur(36px)",
            transform: "translate(-20%,40%)",
          }}
        />

        <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-2 relative z-10">
          Total Earnings
        </p>
        <div
          className="text-white font-black text-5xl mb-1 relative z-10"
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "-1px" }}
        >
          US$ {totalEarned}
        </div>
        <p className="text-white/60 text-xs relative z-10 mb-6">
          {activeCount} active subscription{activeCount !== 1 ? "s" : ""}
        </p>

        <button
          onClick={() => onGoToArbitrage(null)}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-bold text-base relative z-10 transition-transform active:scale-95"
          style={{
            background: "linear-gradient(90deg,#f472b6,#a855f7)",
            boxShadow: "0 8px 24px rgba(168,85,247,0.45)",
          }}
        >
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
            <rect
              x="0"
              y="8"
              width="4"
              height="8"
              rx="1"
              fill="white"
              opacity=".8"
            />
            <rect
              x="7"
              y="4"
              width="4"
              height="12"
              rx="1"
              fill="white"
              opacity=".9"
            />
            <rect x="14" y="0" width="4" height="16" rx="1" fill="white" />
          </svg>
          Start Hosting
        </button>
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
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 text-center"
            >
              <p className="text-gray-400 text-xs mb-1">{s.label}</p>
              <p className="text-gray-800 font-bold text-base">{s.value}</p>
              <p className="text-gray-400 text-xs">{s.unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet balances */}
      <WalletBalanceBar wallets={wallets} />

      {/* Packages */}
      <div className="px-4 mb-4">
        <p
          className="text-gray-900 font-extrabold text-lg mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Arbitrage Products
        </p>
        {packages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No packages available</p>
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4"
            >
              <div
                className="h-1 w-full"
                style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}
              />
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div
                    className="px-3 py-1 rounded-xl text-sm font-bold flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                      color: "#7c3aed",
                    }}
                  >
                    {pkg.duration_days} Days
                  </div>
                  <p className="text-gray-500 text-sm leading-snug">
                    Financial product — redeemable within {pkg.duration_days}{" "}
                    days
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Amount range</p>
                    <p className="text-gray-800 font-semibold text-sm">
                      {Number(pkg.min_amount).toLocaleString()} –{" "}
                      {Number(pkg.max_amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Daily income</p>
                    <p
                      className="font-bold text-sm"
                      style={{ color: "#7c3aed" }}
                    >
                      {pkg.daily_rate_min}–{pkg.daily_rate_max}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-2">
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
                    className="px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-transform active:scale-95"
                    style={{
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
          className="text-gray-900 font-extrabold text-lg mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          My Subscriptions
        </p>
        {loadingHistory ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">No subscriptions yet</p>
            <p className="text-gray-300 text-xs mt-1">
              Subscribe to a package to start earning
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
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
                      <p className="font-bold text-gray-800 text-sm">
                        {sub.package_name}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {sub.duration_days} days · {sub.coin_id}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle[sub.status]}`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Principal</p>
                      <p className="text-gray-800 font-semibold text-sm">
                        {Number(sub.amount).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Daily rate</p>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: "#7c3aed" }}
                      >
                        {sub.daily_rate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-0.5">Earned</p>
                      <p className="text-green-600 font-semibold text-sm">
                        +{Number(sub.total_earned).toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <p className="text-gray-400 text-xs">
                      Ends {format(new Date(sub.end_date), "dd MMM yyyy")}
                    </p>
                    {sub.status === "active" && (
                      <button
                        onClick={() => onCancelSubscription(sub.id)}
                        className="text-xs text-red-400 font-medium underline underline-offset-2"
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

  // Get user balance for selected coin
  const selectedWallet = wallets?.find(
    (w) => w.coin_symbol?.toUpperCase() === selectedCoin,
  );
  const maxBalance = parseFloat(selectedWallet?.coin_amount || 0);

  const expectedEarnings =
    pkg && amount
      ? ((parseFloat(amount) * parseFloat(pkg.daily_rate_min)) / 100).toFixed(2)
      : "0.00";

  const benefits = [
    "Daily income is sent to your USDT, BTC, ETH wallet",
    "Zero risk of your investment funds",
    "You can get your funds back anytime",
    "Artificial intelligence works 24 hours a day",
  ];

  const isInsufficientBalance = parseFloat(amount) > maxBalance;

  const handleSubscribe = async () => {
    if (!pkg) {
      toast.error("Please select a package");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter an amount");
      return;
    }
    if (parseFloat(amount) < parseFloat(pkg.min_amount)) {
      toast.error(
        `Minimum amount is ${Number(pkg.min_amount).toLocaleString()}`,
      );
      return;
    }
    if (parseFloat(amount) > parseFloat(pkg.max_amount)) {
      toast.error(
        `Maximum amount is ${Number(pkg.max_amount).toLocaleString()}`,
      );
      return;
    }
    if (isInsufficientBalance) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      setSubmitting(true);
      await subscribePackage({
        userId: user.id,
        packageId: pkg.id,
        coinId: selectedWallet?.coin_id, // ✅ use coin_id not coin_symbol
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

  // ── Recharge handler ──────────────────────────────────────
  const handleRecharge = () => {
    const wallet = wallets?.find(
      (w) => w.coin_symbol?.toUpperCase() === selectedCoin,
    );
    if (wallet) {
      navigate("/funds", {
        state: {
          wallet,
          coinAmount: wallet.coin_amount,
        },
      });
    } else {
      toast.error("Wallet not found for selected coin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <Header pageTitle="Arbitrage" />

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
          className="absolute top-0 right-0 w-52 h-52 rounded-full opacity-20"
          style={{
            background: "#fff",
            filter: "blur(48px)",
            transform: "translate(30%,-30%)",
          }}
        />
        <p
          className="text-white font-extrabold text-xl relative z-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {pkg ? pkg.name : "AI Arbitrage"}
        </p>
        {pkg && (
          <p className="text-white/70 text-sm relative z-10 mt-1">
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
                className="text-cyan-300 text-xl font-extrabold mb-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Join AI Arbitrage
              </p>
              <p className="text-indigo-200 text-sm">Zero risk, fast return</p>
            </div>
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <div
                className="w-12 h-14 rounded-2xl flex flex-col items-center justify-center gap-1"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                }}
              >
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                </div>
                <div className="w-6 h-1.5 rounded-full bg-cyan-400" />
                <p className="text-indigo-600 text-xs font-bold">AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main detail card */}
      <div className="mx-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div
          className="h-1"
          style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}
        />
        <div className="px-5 py-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldIcon />
              <span className="text-gray-800 font-bold text-base">
                AI Arbitrage
              </span>
            </div>
            {pkg && (
              <div
                className="px-3 py-1 rounded-xl text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
                  color: "#7c3aed",
                }}
              >
                {pkg.duration_days} Days
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5 pb-5 border-b border-gray-100">
            <div>
              <p className="text-gray-400 text-xs mb-1">Amount range</p>
              <p className="text-gray-800 font-semibold text-sm">
                {pkg
                  ? `${Number(pkg.min_amount).toLocaleString()} – ${Number(pkg.max_amount).toLocaleString()}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Daily income</p>
              <p
                className="font-extrabold text-sm"
                style={{ color: "#7c3aed" }}
              >
                {pkg ? `${pkg.daily_rate_min}–${pkg.daily_rate_max}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">
                Available ({selectedCoin})
              </p>
              <p className="text-gray-800 font-semibold text-sm">
                {maxBalance.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">
                Expected earnings/day
              </p>
              <p
                className="font-extrabold text-sm"
                style={{ color: "#22c55e" }}
              >
                {expectedEarnings}
              </p>
            </div>
          </div>

          {/* Coin selector */}
          <div className="mb-5 pb-5 border-b border-gray-100">
            <p className="text-gray-500 text-xs font-medium mb-3">
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
                    className="text-xs font-semibold"
                    style={{
                      color: selectedCoin === symbol ? "#7c3aed" : "#9ca3af",
                    }}
                  >
                    {symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            {/* Label + balance + max/recharge */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-700 font-semibold text-sm">
                Hosting Amount
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {maxBalance.toFixed(4)} {selectedCoin}
                </span>
                {maxBalance <= 0 ? (
                  <button
                    onClick={handleRecharge}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                    style={{
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
                    className="text-xs font-semibold"
                    style={{ color: "#7c3aed" }}
                  >
                    Max
                  </button>
                )}
              </div>
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all"
              style={{
                borderColor: isInsufficientBalance
                  ? "#ef4444"
                  : parseFloat(amount) > 0
                    ? "#7c3aed"
                    : "#e5e7eb",
                background: "#fafafa",
              }}
            >
              <CoinLogo symbol={selectedCoin} size={32} />
              <div className="flex items-center gap-1 text-indigo-400">
                <ArrowsUpDown />
              </div>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val);
                  if (maxBalance > 0) {
                    setSliderVal(
                      Math.min(100, (parseFloat(val) / maxBalance) * 100) || 0,
                    );
                  }
                }}
                placeholder="0.00"
                className="flex-1 bg-transparent text-gray-800 font-bold text-lg outline-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <span className="text-gray-400 text-sm font-medium">
                {selectedCoin}
              </span>
            </div>
          </div>

          {/* Balance status + recharge */}
          <div className="flex items-center justify-between mb-5">
            {isInsufficientBalance ? (
              <div className="flex items-center justify-between w-full">
                <p className="text-red-500 text-xs font-semibold">
                  Insufficient balance
                </p>
                <button
                  onClick={handleRecharge}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-transform active:scale-95"
                  style={{
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
              <p className="text-gray-400 text-xs">
                {pkg
                  ? `Min: ${Number(pkg.min_amount).toLocaleString()} · Max: ${Number(pkg.max_amount).toLocaleString()}`
                  : ""}
              </p>
            )}
          </div>

          {/* Slider */}
          <div className="mb-2">
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
                background: `linear-gradient(90deg, #7c3aed ${sliderVal}%, #e5e7eb ${sliderVal}%)`,
                accentColor: "#7c3aed",
              }}
            />
            <div className="flex justify-between text-xs text-gray-300 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Balance status */}
          <div className="flex items-center justify-between mb-5">
            {isInsufficientBalance ? (
              <p className="text-red-500 text-xs font-semibold">
                Insufficient balance
              </p>
            ) : (
              <p className="text-gray-400 text-xs">
                {pkg
                  ? `Min: ${Number(pkg.min_amount).toLocaleString()} · Max: ${Number(pkg.max_amount).toLocaleString()}`
                  : ""}
              </p>
            )}
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
            className="w-full py-4 rounded-2xl text-white font-extrabold text-base transition-transform active:scale-98 disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg,#f472b6,#a855f7)",
              boxShadow: "0 8px 24px rgba(168,85,247,0.4)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {submitting ? "Processing..." : "Hosting Now"}
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="mx-4 bg-white rounded-3xl shadow-sm border border-gray-100 px-5 py-5">
        <p className="font-bold text-gray-800 text-sm mb-4">
          Why choose AI Arbitrage?
        </p>
        <div className="flex flex-col gap-3">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckIcon />
              <p className="text-gray-600 text-sm leading-snug">{b}</p>
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

  // Filter only supported coins
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
