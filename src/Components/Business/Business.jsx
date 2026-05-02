import React, { useState, useEffect, useRef, memo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Chart, registerables } from "chart.js";
import useWallets from "../../hooks/useWallets";
import { useUser } from "../../context/UserContext";
import useCryptoTradeConverter from "../../hooks/userCryptoTradeConverter";
import { useFetchUserBalance } from "../../hooks/useFetchUserBalance";
import { useUpdateUserBalance } from "../../hooks/useUpdateUserBalance";
import { API_BASE_URL } from "../../api/getApiURL";
import useTimerProfit from "../../hooks/useTimerProfit";
import fetchMarketData from "../utils/getMarketData";
import numberFormat from "../utils/numberFormat";
import getMetalCoinName from "../utils/getMetalCoinName";
import Header from "../Header/Header";

Chart.register(...registerables);

/* ─── Theme constants (matches SideNav / Home dark palette) ─── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";
// const TEXT_SUB      = "#475569";
const ACCENT = "#7c3aed";

/* ─── Coin logo with image fallback ─────────────────────────── */
const COIN_COLORS = {
  BTC: "#f7931a",
  ETH: "#627eea",
  BCH: "#8dc351",
  EOS: "#443f54",
  DOGE: "#c2a633",
  ADA: "#0033ad",
  LTC: "#345d9d",
  BNB: "#f3ba2f",
  SOL: "#9945ff",
  XRP: "#346aa9",
};
const getCoinColor = (sym) => COIN_COLORS[sym?.toUpperCase()] || ACCENT;

const CoinLogo = ({ symbol, size = 40 }) => {
  const [err, setErr] = useState(false);
  if (!err) {
    return (
      <img
        src={`/assets/images/coins/${symbol?.toLowerCase()}-logo.png`}
        alt={symbol}
        width={size}
        height={size}
        className="rounded-full object-cover flex-shrink-0 bg-white"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: getCoinColor(symbol),
        fontSize: size * 0.28,
      }}
    >
      {symbol?.substring(0, 3)}
    </div>
  );
};

/* ─── Icons ──────────────────────────────────────────────────── */
const ClockIcon = ({ color = "#7c3aed", size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.3" />
    <path
      d="M7 4v3l2 2"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronDown = ({ color = "#64748b" }) => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
    <path
      d="M1 1l4 4 4-4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BarChartIcon = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
    <rect x="0" y="9" width="5" height="9" rx="1" fill="#475569" />
    <rect x="8" y="4" width="5" height="14" rx="1" fill="#475569" />
    <rect x="16" y="0" width="5" height="18" rx="1" fill="#7c3aed" />
  </svg>
);

/* ─── Sparkline ──────────────────────────────────────────────── */
const SparkLine = memo(({ change, color }) => {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const pts = [0];
    for (let i = 1; i < 24; i++)
      pts.push(pts[i - 1] + (Math.random() - 0.48) * 1.5);
    const trend = change >= 0 ? 1 : -1;
    const data = pts.map((v, i) => v + trend * i * 0.12);
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: data.map((_, i) => i),
        datasets: [
          {
            data,
            borderColor: color,
            borderWidth: 1.5,
            pointRadius: 0,
            fill: true,
            backgroundColor: color + "28",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [change, color]);
  return <canvas ref={ref} width={90} height={40} />;
});

/* ─── Full trade area chart ──────────────────────────────────── */
const TradeAreaChart = memo(({ price, isPositive, timeframe }) => {
  const ref = useRef(null);
  const chartRef = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (chartRef.current) chartRef.current.destroy();
    const pts = 80;
    const data = [];
    let v = parseFloat(price) || 100;
    for (let i = 0; i < pts; i++) {
      v += (Math.random() - 0.488) * v * 0.004;
      data.push(parseFloat(v.toFixed(4)));
    }
    const lineColor = isPositive ? "#f5a623" : "#ef4444";
    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: data.map((_, i) => i),
        datasets: [
          {
            data,
            borderColor: lineColor,
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            backgroundColor: (ctx) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
              g.addColorStop(
                0,
                isPositive ? "rgba(245,166,35,0.45)" : "rgba(239,68,68,0.35)",
              );
              g.addColorStop(1, "rgba(10,10,15,0)");
              return g;
            },
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
      },
    });
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [price, isPositive, timeframe]);
  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
});

/* ════════════════════════════════════════════════════════════════
   SCREEN — Coin Market List
════════════════════════════════════════════════════════════════ */
const CoinMarketList = ({ onSelectCoin }) => {
  const [coins, setCoins] = useState([]);
  const { setLoading } = useUser();

  useEffect(() => {
    setLoading(true);
    fetch(
      "https://api.coinlore.net/api/ticker/?id=90,2679,2,257,80,1,89,2713,2321,58,48543,118,2710",
    )
      .then((r) => r.json())
      .then((data) => {
        setCoins(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [setLoading]);

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <Header />

      <div className="flex flex-col">
        {coins.map((coin, idx) => {
          const pct = parseFloat(coin.percent_change_24h);
          const isUp = pct >= 0;
          const sparkColor = getCoinColor(coin.symbol);
          const priceUsd = parseFloat(coin.price_usd);

          return (
            <div
              key={coin.id}
              className="flex items-center px-4 py-3 cursor-pointer"
              style={{
                borderBottom: `1px solid ${DARK_BORDER2}`,
                background: idx === 0 ? "rgba(124,58,237,0.08)" : "transparent",
              }}
              onClick={() => onSelectCoin(coin)}
            >
              {/* Logo */}
              <CoinLogo symbol={coin.symbol} size={44} />

              {/* Name */}
              <div className="ml-3 flex-shrink-0" style={{ width: "3.5rem" }}>
                <div
                  className="font-bold"
                  style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                >
                  {coin.symbol}
                </div>
                <div
                  className="mt-0.5"
                  style={{ fontSize: "3.2vw", color: TEXT_MUTED }}
                >
                  USDT
                </div>
              </div>

              {/* Sparkline */}
              <div className="flex-1 flex justify-center items-center">
                <SparkLine change={pct} color={sparkColor} />
              </div>

              {/* Price + % */}
              <div
                className="text-right flex-shrink-0"
                style={{ minWidth: "100px" }}
              >
                <div
                  className="font-semibold"
                  style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                >
                  $
                  {priceUsd < 1
                    ? priceUsd.toFixed(5)
                    : priceUsd.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: "3.2vw",
                      color: isUp ? "rgb(19,178,111)" : "rgb(207,32,47)",
                    }}
                  >
                    {pct.toFixed(3)}%
                  </span>
                  <span style={{ fontSize: "2.8vw", color: TEXT_MUTED }}>
                    24 Hrs
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   COIN SWITCH POPUP
════════════════════════════════════════════════════════════════ */
const CoinSwitchPopup = ({ currentCoin, onSelect, onClose }) => {
  const [coins, setCoins] = useState([]);
  useEffect(() => {
    fetch(
      "https://api.coinlore.net/api/ticker/?id=90,2679,2,257,80,1,89,2713,2321,58,48543,118",
    )
      .then((r) => r.json())
      .then(setCoins)
      .catch(() => {});
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[70vh] overflow-y-auto"
        style={{ background: "#111118", border: `1px solid ${DARK_BORDER}` }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-9 h-1 rounded-full"
            style={{ background: "#1e293b" }}
          />
        </div>
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${DARK_BORDER}` }}
        >
          <span
            className="font-bold"
            style={{ color: TEXT_PRIMARY, fontSize: "1rem" }}
          >
            Select Coin
          </span>
          <button
            onClick={onClose}
            className="text-xl leading-none"
            style={{ color: TEXT_MUTED, background: "transparent" }}
          >
            ✕
          </button>
        </div>
        {coins.map((c) => {
          const pct = parseFloat(c.percent_change_24h);
          const isSelected = c.id === currentCoin;
          return (
            <div
              key={c.id}
              className="flex items-center px-5 py-3 cursor-pointer"
              style={{
                borderBottom: `1px solid ${DARK_BORDER2}`,
                background: isSelected
                  ? "rgba(124,58,237,0.12)"
                  : "transparent",
              }}
              onClick={() => onSelect(c)}
            >
              <CoinLogo symbol={c.symbol} size={36} />
              <div className="ml-3 flex-1">
                <div
                  className="font-bold"
                  style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                >
                  {c.symbol}
                </div>
                <div style={{ fontSize: "3.2vw", color: TEXT_MUTED }}>
                  US${" "}
                  {parseFloat(c.price_usd) < 1
                    ? parseFloat(c.price_usd).toFixed(5)
                    : parseFloat(c.price_usd).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                </div>
              </div>
              <div
                className="font-medium"
                style={{
                  fontSize: "3.2vw",
                  color: pct >= 0 ? "rgb(19,178,111)" : "rgb(207,32,47)",
                }}
              >
                {pct >= 0 ? "+" : ""}
                {pct.toFixed(3)}%
              </div>
              {isSelected && (
                <div
                  className="ml-3 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: ACCENT }}
                >
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          );
        })}
        <div className="h-6" />
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   TRADE POPUP
════════════════════════════════════════════════════════════════ */
const TradePopup = ({
  market,
  displayName,
  symbolKey,
  type,
  userBalance,
  userCoinBalance,
  timerProfits,
  selectedWallet,
  purchasePrice,
  coin,
  user,
  convertUSDTToCoin,
  updateUserBalance,
  setLoading,
  onClose,
}) => {
  const [selectedType, setSelectedType] = useState("Buy");
  const [selectedTime, setSelectedTime] = useState(
    timerProfits?.[0]?.timer || "60S",
  );
  const [selectedProfit, setSelectedProfit] = useState(
    timerProfits?.[0]?.profit || "10",
  );
  const [selectedMiniUsdt, setSelectedMiniUsdt] = useState(
    timerProfits?.[0]?.mini_usdt || "10",
  );
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (timerProfits?.length) {
      setSelectedTime(timerProfits[0].timer);
      setSelectedProfit(timerProfits[0].profit);
      setSelectedMiniUsdt(timerProfits[0].mini_usdt);
    }
  }, [timerProfits]);

  const estimation = amount
    ? (parseFloat(amount) * (1 + parseInt(selectedProfit || 0) / 100)).toFixed(
        2,
      )
    : "0.00";

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amount || amt <= 0) return toast.error("Amount is required!");
    if (amt < parseFloat(selectedMiniUsdt))
      return toast.error(`Minimum is ${selectedMiniUsdt} USDT`);
    if (amt > parseFloat(userBalance))
      return toast.error("Insufficient balance");
    if (0 >= parseInt(user?.trade_limit))
      return toast.error("Trade limit reached");
    try {
      setLoading(true);
      const result = await convertUSDTToCoin(amount, selectedWallet?.coin_id);
      const wAmount = selectedWallet?.coin_name === "Tether" ? amount : result;
      const order_id = Math.floor(100000 + Math.random() * 900000);
      const percent = parseInt(selectedProfit) / 100;
      await axios.post(`${API_BASE_URL}/tradeorder`, {
        order_id,
        order_type: type,
        order_position: selectedType.toLowerCase(),
        user_id: user?.id,
        user_wallet: user?.user_wallet,
        wallet_coin_id: selectedWallet?.coin_id,
        trade_coin_id: coin,
        trade_coin_symbol: market?.symbol,
        amount,
        wallet_amount: wAmount,
        profit_amount: amt * percent,
        purchase_price: purchasePrice,
        wallet_profit_amount: parseFloat(userCoinBalance) * percent,
        delivery_time: selectedTime,
        profit_level: selectedProfit,
        is_profit: user?.is_profit,
      });
      updateUserBalance(user.id, selectedWallet.coin_id, userCoinBalance - amt);
      toast.success("Trade order placed successfully!");
      setAmount("");
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* shared input/row style */
  const rowCard = {
    background: DARK_CARD,
    border: `1px solid ${DARK_BORDER}`,
    borderRadius: "0.75rem",
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto max-h-[90vh]"
        style={{ background: "#111118", border: `1px solid ${DARK_BORDER}` }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-9 h-1 rounded-full"
            style={{ background: "#1e293b" }}
          />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-5 py-3">
          <span
            className="font-bold"
            style={{ color: TEXT_PRIMARY, fontSize: "1.1rem" }}
          >
            {displayName} Coin Delivery
          </span>
          <button
            onClick={onClose}
            className="text-xl font-light leading-none"
            style={{ color: "#818cf8", background: "transparent" }}
          >
            ✕
          </button>
        </div>

        {/* Coin + timer row */}
        <div
          className="flex items-center justify-between px-5 pb-4"
          style={{ borderBottom: `1px solid ${DARK_BORDER}` }}
        >
          <div className="flex items-center gap-3">
            <CoinLogo symbol={symbolKey} size={38} />
            <div>
              <div
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                {displayName} Coin
              </div>
              <div style={{ fontSize: "3.2vw", color: TEXT_MUTED }}>
                {selectedType}&nbsp;
                <span
                  style={{
                    color:
                      selectedType === "Buy"
                        ? "rgb(19,178,111)"
                        : "rgb(207,32,47)",
                  }}
                >
                  {selectedType === "Buy" ? "Bullish" : "Bearish"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <ClockIcon color={ACCENT} />
              <span
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                {selectedTime}
              </span>
            </div>
            <div style={{ fontSize: "3.2vw", color: TEXT_MUTED, marginTop: 2 }}>
              {parseFloat(userBalance).toFixed(2)} USDT
            </div>
          </div>
        </div>

        {/* Delivery time */}
        <div className="px-5 pt-4">
          <div
            className="font-medium mb-3"
            style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
          >
            Delivery time
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${DARK_BORDER}`,
              }}
              onClick={() => setTimePickerVisible(true)}
            >
              <ClockIcon color={ACCENT} />
              <span
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                {selectedTime}
              </span>
              <ChevronDown />
            </button>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setSelectedType("Buy")}
                className="px-5 py-2.5 rounded-full font-semibold transition-all"
                style={{
                  fontSize: "3.5vw",
                  background:
                    selectedType === "Buy"
                      ? "linear-gradient(135deg,#f59e0b,#f97316)"
                      : "rgba(255,255,255,0.06)",
                  color: selectedType === "Buy" ? "#fff" : TEXT_MUTED,
                  border: "none",
                }}
              >
                Bullish
              </button>
              <button
                onClick={() => setSelectedType("Sell")}
                className="px-5 py-2.5 rounded-full font-semibold transition-all"
                style={{
                  fontSize: "3.5vw",
                  background:
                    selectedType === "Sell"
                      ? "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "rgba(255,255,255,0.06)",
                  color: selectedType === "Sell" ? "#fff" : TEXT_MUTED,
                  border: "none",
                }}
              >
                Bearish
              </button>
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="px-5 pt-4">
          <div
            className="font-medium mb-2"
            style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
          >
            Return of Investment
          </div>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={rowCard}
          >
            <span style={{ fontSize: "3.8vw", color: TEXT_MUTED }}>
              (*{selectedProfit}%)
            </span>
            <ChevronDown />
          </div>
        </div>

        {/* Purchase price */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="font-medium"
              style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
            >
              Purchase price
            </span>
            <span style={{ fontSize: "3.2vw", color: TEXT_MUTED }}>
              Fee: 0.1%
            </span>
          </div>
          <div
            className="flex items-center overflow-hidden"
            style={{ ...rowCard, borderRadius: "0.75rem" }}
          >
            <div
              className="flex items-center gap-2 px-3 py-3 flex-shrink-0"
              style={{ borderRight: `1px solid ${DARK_BORDER}` }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "#26a17b" }}
              >
                <span
                  className="text-white font-bold"
                  style={{ fontSize: "0.7rem" }}
                >
                  T
                </span>
              </div>
              <span
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                USDT
              </span>
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 px-3 py-3 outline-none"
              style={{
                background: "transparent",
                color: TEXT_PRIMARY,
                fontSize: "3.8vw",
              }}
            />
            <button
              className="px-4 py-3 font-bold flex-shrink-0"
              style={{
                background: "transparent",
                color: ACCENT,
                fontSize: "3.5vw",
              }}
              onClick={() =>
                setAmount(Math.floor(parseFloat(userBalance)).toString())
              }
            >
              Max
            </button>
          </div>
        </div>

        {/* Balance info */}
        <div className="px-5 pt-3 pb-2">
          <div style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
            Available Balance:
            <span className="font-medium ml-1" style={{ color: TEXT_PRIMARY }}>
              {parseFloat(userBalance).toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
              At least:{" "}
              <span className="font-medium" style={{ color: TEXT_PRIMARY }}>
                {selectedMiniUsdt}
              </span>
            </span>
            <span
              className="font-medium"
              style={{ fontSize: "3.5vw", color: "#818cf8" }}
            >
              Expected: {estimation} USDT
            </span>
          </div>
        </div>

        {/* Trade button */}
        <div className="px-5 pt-2 pb-8">
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl text-white font-semibold"
            style={{
              fontSize: "4.5vw",
              background: "linear-gradient(90deg,#f472b6 0%,#a855f7 100%)",
            }}
          >
            Trade
          </button>
        </div>

        {/* Time picker sub-sheet */}
        {timePickerVisible && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setTimePickerVisible(false)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-3xl"
              style={{
                background: "#111118",
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div
                  className="w-9 h-1 rounded-full"
                  style={{ background: "#1e293b" }}
                />
              </div>
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: `1px solid ${DARK_BORDER}` }}
              >
                <span
                  className="font-bold"
                  style={{ color: TEXT_PRIMARY, fontSize: "1rem" }}
                >
                  Delivery time
                </span>
                <button
                  onClick={() => setTimePickerVisible(false)}
                  className="text-xl leading-none"
                  style={{ color: TEXT_MUTED, background: "transparent" }}
                >
                  ✕
                </button>
              </div>
              {(timerProfits || []).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  style={{
                    borderBottom: `1px solid ${DARK_BORDER2}`,
                    background:
                      item.timer === selectedTime
                        ? "rgba(124,58,237,0.12)"
                        : "transparent",
                  }}
                  onClick={() => {
                    setSelectedTime(item.timer);
                    setSelectedProfit(item.profit);
                    setSelectedMiniUsdt(item.mini_usdt);
                    setTimePickerVisible(false);
                  }}
                >
                  <div>
                    <div
                      className="font-semibold"
                      style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                    >
                      {item.timer}
                    </div>
                    <div
                      style={{
                        fontSize: "3.2vw",
                        color: TEXT_MUTED,
                        marginTop: 2,
                      }}
                    >
                      Profit: {item.profit}% · Min: {item.mini_usdt} USDT
                    </div>
                  </div>
                  {item.timer === selectedTime && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: ACCENT }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
              <div className="h-8" />
            </div>
          </>
        )}
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   SCREEN — Business / Trade View
════════════════════════════════════════════════════════════════ */
const BusinessView = ({ coin, type, onBack }) => {
  const { user, setLoading } = useUser();
  const { timerProfits } = useTimerProfit();
  const { wallets } = useWallets(user?.id);
  const { convertUSDTToCoin } = useCryptoTradeConverter();
  const { updateUserBalance } = useUpdateUserBalance();

  const [market, setMarket] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState(null);
  const [userBalance, setUserBalance] = useState(0.0);
  const [userCoinBalance, setUserCoinBalance] = useState(0.0);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("5M");
  const [tradePopupVisible, setTradePopupVisible] = useState(false);
  const [coinSwitchVisible, setCoinSwitchVisible] = useState(false);

  const { balance } = useFetchUserBalance(user?.id, selectedWallet?.coin_id);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (coin && type && wallets.length > 0) {
        const marketData = await fetchMarketData(coin, type);
        if (marketData) {
          if (type === "crypto") {
            setPurchasePrice(marketData[0].price_usd);
            setMarket(marketData[0]);
          } else {
            setMarket(marketData[0]?.meta);
            setPurchasePrice(marketData[0]?.meta.regularMarketPrice);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [coin, type, wallets.length, setLoading]);

  useEffect(() => {
    const w = wallets.find((w) => w.coin_id === "518");
    if (w) setSelectedWallet(w);
    if (user?.id && selectedWallet?.coin_id) {
      setUserBalance(balance ? balance.coin_amount : "0.0000");
      setUserCoinBalance(balance ? balance.coin_amount : "0.0000");
    }
  }, [balance, selectedWallet, user, wallets]);

  if (!market || wallets.length === 0) return null;

  const isPositive =
    type === "crypto"
      ? parseFloat(market.percent_change_24h) >= 0
      : market.regularMarketPrice - market.previousClose >= 0;

  const priceVal =
    type === "crypto" ? market.price_usd : market.regularMarketPrice;
  const changeAmt =
    type === "crypto"
      ? ((market.price_usd * market.percent_change_24h) / 100).toFixed(2)
      : (market.regularMarketPrice - market.previousClose).toFixed(5);
  const changePct = type === "crypto" ? market.percent_change_24h : null;

  const displayName =
    type === "crypto"
      ? market.symbol
      : type === "metal"
        ? getMetalCoinName(market.symbol.split("=")[0].trim())
        : market.shortName;

  const symbolKey =
    type === "crypto" ? market.symbol : market.symbol?.split("=")[0]?.trim();

  return (
    <div
      className="min-h-screen relative pb-24"
      style={{ background: DARK_BG }}
    >
      <Header />

      {/* Coin info row */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(124,58,237,0.08)",
          borderBottom: `1px solid ${DARK_BORDER}`,
        }}
      >
        <div className="flex items-center">
          <CoinLogo symbol={symbolKey} size={44} />
          <button
            className="flex flex-col items-start ml-3"
            style={{ background: "transparent", border: "none" }}
            onClick={() => setCoinSwitchVisible(true)}
          >
            <div className="flex items-center gap-1">
              <span
                className="font-bold"
                style={{ fontSize: "4.2vw", color: TEXT_PRIMARY }}
              >
                {displayName}
              </span>
              <ChevronDown />
            </div>
            <div style={{ fontSize: "3.2vw", color: TEXT_MUTED }}>USDT</div>
          </button>
        </div>
        <Link
          to="/profit-stat"
          onClick={(e) => {
            if (tradePopupVisible) e.preventDefault();
          }}
        >
          <BarChartIcon />
        </Link>
      </div>

      {/* Price block */}
      <div className="px-4 pt-4 pb-1">
        <div
          className="font-bold"
          style={{ fontSize: "7.5vw", color: TEXT_PRIMARY }}
        >
          $
          {parseFloat(priceVal).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div
          className="mt-1 font-medium"
          style={{
            fontSize: "4vw",
            color: isPositive ? "rgb(19,178,111)" : "rgb(207,32,47)",
          }}
        >
          {changeAmt}
          {changePct != null && ` (${parseFloat(changePct).toFixed(2)}%)`}
        </div>
      </div>

      {/* Area chart */}
      <div className="w-full" style={{ height: 280 }}>
        <TradeAreaChart
          price={priceVal}
          isPositive={isPositive}
          timeframe={activeTab}
        />
      </div>

      {/* Timeframe tabs */}
      <div
        className="flex items-center px-4 py-2 gap-1"
        style={{ borderBottom: `1px solid ${DARK_BORDER}` }}
      >
        {["5M", "15M", "1H", "6H", "1D", "1W"].map((tf) => (
          <button
            key={tf}
            onClick={() => setActiveTab(tf)}
            className="flex-1 py-1.5 rounded transition-colors"
            style={{
              fontSize: "3.5vw",
              background:
                activeTab === tf ? "rgba(124,58,237,0.2)" : "transparent",
              color: activeTab === tf ? "#a78bfa" : TEXT_MUTED,
              fontWeight: activeTab === tf ? "700" : "400",
              border: "none",
            }}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Functions (crypto only) */}
      {type === "crypto" && (
        <div className="px-4 pt-4 pb-3">
          <div
            className="font-bold mb-3"
            style={{ fontSize: "4.5vw", color: TEXT_PRIMARY }}
          >
            Functions
          </div>
          <div className="flex gap-3">
            <div
              className="flex-1 rounded-xl p-3"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div
                style={{
                  fontSize: "3.2vw",
                  color: TEXT_MUTED,
                  marginBottom: 4,
                }}
              >
                24h volume
              </div>
              <div
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                {market?.volume24?.toLocaleString()}
              </div>
            </div>
            <div
              className="flex-1 rounded-xl p-3"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div
                style={{
                  fontSize: "3.2vw",
                  color: TEXT_MUTED,
                  marginBottom: 4,
                }}
              >
                Market Cap
              </div>
              <div
                className="font-semibold"
                style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
              >
                ${numberFormat(market?.market_cap_usd, 2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Trade button */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-4 py-4"
        style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BORDER}` }}
      >
        <button
          onClick={() => setTradePopupVisible(true)}
          className="w-full py-4 rounded-2xl text-white font-semibold"
          style={{
            fontSize: "4.5vw",
            background: "linear-gradient(90deg,#f472b6 0%,#a855f7 100%)",
          }}
        >
          Trade
        </button>
      </div>

      {tradePopupVisible && (
        <TradePopup
          market={market}
          displayName={displayName}
          symbolKey={symbolKey}
          type={type}
          userBalance={userBalance}
          userCoinBalance={userCoinBalance}
          timerProfits={timerProfits}
          selectedWallet={selectedWallet}
          purchasePrice={purchasePrice}
          coin={coin}
          user={user}
          convertUSDTToCoin={convertUSDTToCoin}
          updateUserBalance={updateUserBalance}
          setLoading={setLoading}
          onClose={() => setTradePopupVisible(false)}
        />
      )}

      {coinSwitchVisible && (
        <CoinSwitchPopup
          currentCoin={coin}
          onSelect={(c) => {
            onBack(c);
            setCoinSwitchVisible(false);
          }}
          onClose={() => setCoinSwitchVisible(false)}
        />
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   ROOT
════════════════════════════════════════════════════════════════ */
const Business = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const coin = searchParams.get("coin");
  const type = searchParams.get("type") || "crypto";

  const handleSelectCoin = (c) =>
    setSearchParams({ coin: c.id, type: "crypto" });
  const handleBack = (switchedCoin) => {
    if (switchedCoin?.id)
      setSearchParams({ coin: switchedCoin.id, type: "crypto" });
    else setSearchParams({});
  };

  if (!coin) return <CoinMarketList onSelectCoin={handleSelectCoin} />;
  return <BusinessView coin={coin} type={type} onBack={handleBack} />;
};

export default Business;
