import React, { useEffect, useState } from "react";
import imgNoData from "../../Assets/images/img_nodata.png";
import Header from "../Header/Header";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import { IoClose } from "react-icons/io5";
import { MdTrendingUp, MdTrendingDown, MdAccessTime } from "react-icons/md";
import { RiArrowRightSLine } from "react-icons/ri";
import { BsClockHistory, BsLightningChargeFill } from "react-icons/bs";

/* ─── Theme ── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";
const TEXT_SUB = "#475569";
const ACCENT = "#7c3aed";

/* ─── Helpers ── */
const parseDuration = (duration) => {
  const durationMap = {
    S: 1000,
    H: 3600000,
    D: 86400000,
    W: 604800000,
    M: 2592000000,
    Y: 31536000000,
  };
  const match = duration.match(/^(\d+)([SHDWMY])$/);
  if (match) return parseInt(match[1]) * (durationMap[match[2]] || 0);
  return 0;
};

const getFormattedDeliveryTime = (createdAt) =>
  new Date(createdAt)
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .replace(",", "");

const extractUnit = (deliveryTime) => {
  const match = deliveryTime.match(/[SHDWMY]/);
  return match ? match[0] : null;
};

const calculateDeliveryPrice = (
  isProfit,
  orderPosition,
  deliveryTime,
  purchasePrice,
) => {
  const unit = extractUnit(deliveryTime);
  let price = parseFloat(purchasePrice);
  const deltas = {
    S: [90, 30],
    H: [350, 150],
    D: [550, 350],
    W: [850, 550],
    M: [1850, 850],
    Y: [5850, 5850],
  };
  const [gain, loss] = deltas[unit] || [0, 0];
  if (isProfit) {
    if (orderPosition === "buy")
      price +=
        price > 50
          ? gain
          : unit === "S"
            ? 2
            : unit === "H"
              ? 5
              : unit === "D"
                ? 8
                : unit === "W"
                  ? 12
                  : unit === "M"
                    ? 20
                    : 25;
    else price -= price > 50 ? loss : 0.05;
  } else {
    price -= price > 50 ? loss : 0.05;
  }
  return price.toFixed(2);
};

/* ─── Countdown ── */
const Countdown = ({
  createdTime,
  duration,
  setStatus,
  id,
  setRunningOrders,
  runningOrders,
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const deliveryTime = parseDuration(duration);
    const createdAt = new Date(createdTime);
    const updateTimer = () => {
      const diff = new Date(createdAt.getTime() + deliveryTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setStatus("finished");
        setRunningOrders((prev) => prev.filter((item) => item.id !== id));
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(
        2,
        "0",
      );
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(
        2,
        "0",
      );
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(
        2,
        "0",
      );
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      if (years > 0)
        setTimeLeft(
          `${years}y ${Math.floor((days % 365) / 30)}mo ${hours}h ${minutes}m ${seconds}s`,
        );
      else if (months > 0)
        setTimeLeft(
          `${months}mo ${days % 30}d ${hours}h ${minutes}m ${seconds}s`,
        );
      else if (days > 0)
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      else setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdTime, duration, setStatus, id, runningOrders, setRunningOrders]);

  return (
    <span
      className="font-mono tracking-wider font-bold"
      style={{ color: "#f59e0b", fontSize: "3.2vw" }}
    >
      {timeLeft}
    </span>
  );
};

/* ─── Empty State ── */
const EmptyState = ({ label = "No Data" }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <img
      src={imgNoData}
      alt="No Data"
      className="w-32 h-32 object-contain opacity-40"
    />
    <p
      className="font-semibold"
      style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}
    >
      {label}
    </p>
  </div>
);

/* ─── Coin Image ── */
const CoinImg = ({ order }) => {
  const src =
    order?.order_type === "metal" || order?.order_type === "forex"
      ? `./assets/images/coins/${order?.trade_coin_id?.toLowerCase()}-logo.png`
      : `./assets/images/coins/${order?.trade_coin_symbol?.toLowerCase()}-logo.png`;
  return (
    <img
      src={src}
      alt={order?.coin_name}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      style={{ border: "2px solid rgba(255,255,255,0.1)" }}
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
};

/* ─── Detail Row ── */
const DetailRow = ({ label, value, highlight, isProfit }) => (
  <div
    className="flex items-center justify-between px-4 py-3 rounded-xl"
    style={{
      background: highlight
        ? isProfit
          ? "rgba(16,185,129,0.1)"
          : "rgba(239,68,68,0.1)"
        : DARK_CARD,
      border: `1px solid ${
        highlight
          ? isProfit
            ? "rgba(16,185,129,0.2)"
            : "rgba(239,68,68,0.2)"
          : DARK_BORDER
      }`,
    }}
  >
    <span style={{ fontSize: "3.2vw", color: TEXT_MUTED, fontWeight: 500 }}>
      {label}
    </span>
    <span
      style={{
        fontSize: "3.4vw",
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: highlight
          ? isProfit
            ? "rgb(16,185,129)"
            : "rgb(239,68,68)"
          : TEXT_PRIMARY,
      }}
    >
      {value}
    </span>
  </div>
);

/* ─── Main ── */
const ProfitStatistics = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [runningOrders, setRunningOrders] = useState([]);
  const [status, setStatus] = useState("running");
  const { setLoading, user } = useUser();

  const switchTab = (tab) => {
    setActiveTab(tab);
    setStatus(tab === "finished" ? "finished" : "running");
  };

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      (async () => {
        try {
          const res = await fetch(
            `${API_BASE_URL}/tradeorder/user/${user?.id}?status=${status}`,
          );
          const data = await res.json();
          if (res.status !== 404) {
            status === "finished" ? setOrders(data) : setRunningOrders(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [setLoading, user, status]);

  const tabs = [
    { key: "active", label: "Active Orders", icon: BsLightningChargeFill },
    { key: "finished", label: "Finished", icon: BsClockHistory },
  ];

  return (
    <div className="min-h-screen" style={{ background: DARK_BG }}>
      <Header pageTitle="Profit Statistics" />

      {/* ── Tab switcher ── */}
      <div
        className="sticky top-0 z-10 px-4 pt-4 pb-0"
        style={{
          background: "#0d0d14",
          borderBottom: `1px solid ${DARK_BORDER}`,
        }}
      >
        <div className="flex gap-1 max-w-lg mx-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className="relative flex-1 flex items-center justify-center gap-2 py-3 rounded-t-xl transition-all focus:outline-none"
              style={{
                fontSize: "3.5vw",
                fontWeight: 600,
                border: "none",
                background:
                  activeTab === key ? "rgba(124,58,237,0.12)" : "transparent",
                color: activeTab === key ? "#a78bfa" : TEXT_MUTED,
              }}
            >
              <Icon size={14} />
              {label}
              <span
                className="absolute bottom-0 left-4 right-4 rounded-full transition-all"
                style={{
                  height: 2.5,
                  background: activeTab === key ? ACCENT : "transparent",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {/* Active Orders */}
        {activeTab === "active" &&
          (runningOrders.length === 0 ? (
            <EmptyState label="No Active Orders" />
          ) : (
            runningOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl p-4"
                style={{
                  background: DARK_CARD,
                  border: `1px solid ${DARK_BORDER}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CoinImg order={order} />
                    <div>
                      <p
                        className="font-bold tracking-wide"
                        style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                      >
                        {order?.trade_coin_symbol}/{order?.coin_symbol}
                      </p>
                      <p
                        style={{
                          fontSize: "3vw",
                          color: TEXT_MUTED,
                          marginTop: 2,
                        }}
                      >
                        {getFormattedDeliveryTime(order.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {/* Running badge */}
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold"
                      style={{
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.25)",
                        color: "#f59e0b",
                        fontSize: "2.8vw",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Running
                    </span>
                    <div
                      className="flex items-center gap-1"
                      style={{ color: TEXT_MUTED }}
                    >
                      <MdAccessTime size={11} />
                      <Countdown
                        createdTime={getFormattedDeliveryTime(order.created_at)}
                        duration={order.delivery_time}
                        setStatus={setStatus}
                        setRunningOrders={setRunningOrders}
                        id={order?.id}
                        runningOrders={runningOrders}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ))}

        {/* Finished Orders */}
        {activeTab === "finished" &&
          (orders.length === 0 ? (
            <EmptyState label="No Finished Orders" />
          ) : (
            orders.map((order) => {
              const isProfit = order?.is_profit;
              return (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowPopup(true);
                  }}
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: DARK_CARD,
                    border: `1px solid ${DARK_BORDER}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CoinImg order={order} />
                      <div>
                        <p
                          className="font-bold tracking-wide"
                          style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
                        >
                          {order?.trade_coin_symbol}/{order?.coin_symbol}
                        </p>
                        <p
                          style={{
                            fontSize: "3vw",
                            color: TEXT_MUTED,
                            marginTop: 2,
                          }}
                        >
                          {getFormattedDeliveryTime(order?.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div
                          className="flex items-center gap-1 justify-end font-semibold"
                          style={{
                            fontSize: "3.2vw",
                            color: isProfit
                              ? "rgb(16,185,129)"
                              : "rgb(239,68,68)",
                          }}
                        >
                          {isProfit ? (
                            <MdTrendingUp size={14} />
                          ) : (
                            <MdTrendingDown size={14} />
                          )}
                          {isProfit ? "Profit" : "Loss"}
                        </div>
                        <p
                          className="font-bold mt-0.5"
                          style={{
                            fontSize: "4vw",
                            color: isProfit
                              ? "rgb(16,185,129)"
                              : "rgb(239,68,68)",
                          }}
                        >
                          US$ {order?.profit_amount}
                        </p>
                      </div>
                      <RiArrowRightSLine
                        size={18}
                        style={{ color: TEXT_SUB }}
                      />
                    </div>
                  </div>
                </button>
              );
            })
          ))}
      </div>

      {/* ── Detail Popup ── */}
      {showPopup && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setShowPopup(false)}
          />
          <div
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
            style={{
              background: "#111118",
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#1e293b" }}
              />
            </div>

            {/* Popup header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${DARK_BORDER}` }}
            >
              <div className="flex items-center gap-3">
                <CoinImg order={selectedOrder} />
                <div>
                  <p
                    className="font-bold"
                    style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
                  >
                    {selectedOrder?.trade_coin_symbol}/
                    {selectedOrder?.coin_symbol}
                  </p>
                  <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                    {getFormattedDeliveryTime(selectedOrder.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${DARK_BORDER}`,
                  color: TEXT_MUTED,
                }}
              >
                <IoClose size={16} />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-2 max-h-[65vh] overflow-y-auto">
              <DetailRow label="Purchase Amount" value={selectedOrder.amount} />
              <DetailRow
                label="Direction"
                value={
                  <span
                    className="capitalize px-2.5 py-0.5 rounded-lg font-bold"
                    style={{
                      fontSize: "3vw",
                      background:
                        selectedOrder.order_position === "buy"
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(239,68,68,0.15)",
                      color:
                        selectedOrder.order_position === "buy"
                          ? "rgb(16,185,129)"
                          : "rgb(239,68,68)",
                    }}
                  >
                    {selectedOrder.order_position}
                  </span>
                }
              />
              <DetailRow
                label="Purchase Price"
                value={selectedOrder.purchase_price}
              />
              <DetailRow label="Contract" value={selectedOrder.delivery_time} />
              <DetailRow
                label={selectedOrder.is_profit ? "Profit" : "Loss"}
                value={`US$ ${selectedOrder.profit_amount}`}
                highlight
                isProfit={selectedOrder.is_profit}
              />
              <DetailRow
                label="Delivery Price"
                value={calculateDeliveryPrice(
                  selectedOrder?.is_profit,
                  selectedOrder.order_position,
                  selectedOrder.delivery_time,
                  selectedOrder.purchase_price,
                )}
              />
              <DetailRow
                label="Delivery Time"
                value={getFormattedDeliveryTime(selectedOrder.created_at)}
              />
              <DetailRow label="Status" value="Finished" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfitStatistics;
