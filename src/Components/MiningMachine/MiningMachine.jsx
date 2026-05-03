import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../Header/Header";
import { MachineIcon, Stars } from "./miningUtils";
import {
  getMiningPackages,
  getUserMiningSubscriptions,
  cancelMiningSubscription,
} from "../../api/mining.api";
import { useUser } from "../../context/UserContext";
import { format } from "date-fns";

const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

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

const CountdownTimer = ({ endDate }) => {
  // useCallback so the function reference is stable — fixes the missing dep warning
  const calc = useCallback(() => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [endDate]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    setTime(calc()); // sync immediately on mount / endDate change
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [calc]);

  if (!time)
    return (
      <span
        style={{ fontSize: "2.6vw", color: "rgb(239,68,68)", fontWeight: 600 }}
      >
        Ending soon
      </span>
    );

  return (
    <div
      className="flex items-center gap-1"
      style={{
        background: "rgba(251,191,36,0.10)",
        border: "1px solid rgba(251,191,36,0.2)",
        borderRadius: 8,
        padding: "3px 8px",
        display: "inline-flex",
      }}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2" />
        <path
          d="M12 6v6l4 2"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontSize: "2.8vw",
          color: "#fbbf24",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {time.d}d {String(time.h).padStart(2, "0")}h{" "}
        {String(time.m).padStart(2, "0")}m {String(time.s).padStart(2, "0")}s
      </span>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MINING MACHINE
════════════════════════════════════════════════════════════════ */
const MiningMachine = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getMiningPackages();
      setPackages(res.data);
    } catch {
      toast.error("Failed to load mining packages");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await getUserMiningSubscriptions(user.id);
      setSubscriptions(res.data);
    } catch {
      toast.error("Failed to load subscription history");
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) fetchSubscriptions();
  }, [user?.id, fetchSubscriptions]);

  const handleCancel = async (subscriptionId) => {
    try {
      await cancelMiningSubscription({ subscriptionId, userId: user.id });
      toast.success("Subscription cancelled — principal returned");
      fetchSubscriptions();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  /* ── Derived stats ── */
  const totalMiningEarned = subscriptions
    .reduce((sum, s) => sum + parseFloat(s.total_earned || 0), 0)
    .toFixed(4);

  const todayMiningEarned = subscriptions
    .filter(
      (s) =>
        s.last_paid_at &&
        new Date(s.last_paid_at).toDateString() === new Date().toDateString(),
    )
    .reduce((sum, s) => sum + parseFloat(s.daily_earnings || 0), 0)
    .toFixed(4);

  const activeMiningCount = subscriptions.filter(
    (s) => s.status === "active",
  ).length;

  const activeList = subscriptions.filter((s) => s.status === "active");
  const historyList = subscriptions.filter((s) => s.status !== "active");
  const displayList = activeTab === "active" ? activeList : historyList;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: DARK_BG }}
    >
      {/* ── Header ── */}
      <div className="flex-shrink-0">
        <Header pageTitle="Mining Machine" />
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Hero / Total Earned ── */}
        <div
          className="relative overflow-hidden flex flex-col items-center pt-6 pb-12 px-5"
          style={{
            background:
              "linear-gradient(145deg,#0f4c81 0%,#1e40af 45%,#3b82f6 100%)",
          }}
        >
          {/* Glow blobs */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              bottom: 0,
              left: 0,
              width: "40vw",
              height: "40vw",
              background: "#93c5fd",
              filter: "blur(36px)",
              transform: "translate(-20%,40%)",
              opacity: 0.18,
            }}
          />
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              top: 0,
              right: 0,
              width: "30vw",
              height: "30vw",
              background: "#60a5fa",
              filter: "blur(32px)",
              transform: "translate(20%,-30%)",
              opacity: 0.15,
            }}
          />

          <p
            className="text-blue-200 font-semibold tracking-widest uppercase relative z-10 mb-2"
            style={{ fontSize: "3vw" }}
          >
            Mining Earnings
          </p>
          <div
            className="text-white font-black relative z-10 mb-1"
            style={{ fontSize: "10vw", letterSpacing: "-1px" }}
          >
            ${totalMiningEarned}
          </div>
          <p
            className="text-blue-200/70 relative z-10"
            style={{ fontSize: "3vw" }}
          >
            {activeMiningCount} active machine
            {activeMiningCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Stats row — overlaps hero ── */}
        <div className="mx-4 -mt-5 relative z-10 mb-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Today", value: todayMiningEarned, unit: "USDT" },
              { label: "Active", value: activeMiningCount, unit: "machines" },
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
                  style={{
                    fontSize: "3vw",
                    color: TEXT_MUTED,
                    marginBottom: 4,
                  }}
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

        {/* ── Inner scrollable content ── */}
        <div className="px-4 py-2 space-y-4">
          {/* Sub-heading */}
          <div className="flex items-center justify-between px-1">
            <p
              className="font-bold"
              style={{ fontSize: "3.8vw", color: TEXT_PRIMARY }}
            >
              Mining Machine leasing
            </p>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4m0 4h.01"
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* ── Machine cards ── */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}>
                Loading packages...
              </p>
            </div>
          ) : packages.length === 0 ? (
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
                className="rounded-3xl overflow-hidden shadow-lg"
                style={{
                  background: `linear-gradient(135deg,${pkg.color}dd 0%,${pkg.color}99 100%)`,
                }}
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                  >
                    <MachineIcon size={56} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-yellow-300 font-black mb-1"
                      style={{ fontSize: "5vw" }}
                    >
                      {pkg.name}
                    </p>
                    <p
                      className="text-white/90 leading-snug mb-2"
                      style={{ fontSize: "3.3vw" }}
                    >
                      Financial product — not redeemable within{" "}
                      {pkg.duration_days} days
                    </p>
                    <p className="text-white/70" style={{ fontSize: "3vw" }}>
                      Rent{" "}
                      <span className="text-white font-bold">
                        {Number(pkg.rent_amount).toLocaleString()} USDT
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/mining/${pkg.id}`, { state: { machine: pkg } })
                    }
                    className="flex-shrink-0 px-5 py-2.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform"
                    style={{
                      fontSize: "3.5vw",
                      background: "linear-gradient(135deg,#f472b6,#a855f7)",
                    }}
                  >
                    Check
                  </button>
                </div>
                <div className="px-5 pb-4">
                  <Stars count={pkg.stars || 5} />
                </div>
              </div>
            ))
          )}

          {/* Cloud mining info card */}
          <div
            className="rounded-3xl p-5"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            <p
              className="font-bold mb-2"
              style={{ fontSize: "4vw", color: "#818cf8" }}
            >
              Cloud mining machine
            </p>
            <p
              className="mb-4"
              style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
            >
              Safe and stable money making tool
            </p>
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{
                background: "#0d0d14",
                height: 160,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div className="text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: "#ff0000" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white/70" style={{ fontSize: "3vw" }}>
                  Watch on YouTube
                </p>
              </div>
            </div>
          </div>

          {/* ── My Subscriptions ── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: DARK_CARD,
              border: `1px solid ${DARK_BORDER}`,
            }}
          >
            {/* Section header */}
            <div
              className="px-5 pt-5 pb-3"
              style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  className="font-black"
                  style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
                >
                  My Subscriptions
                </h2>
                {activeList.length > 0 && (
                  <span
                    className="px-2.5 py-1 rounded-full font-bold"
                    style={{
                      fontSize: "2.8vw",
                      background: "rgba(16,185,129,0.15)",
                      color: "rgb(16,185,129)",
                    }}
                  >
                    {activeList.length} active
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { key: "active", label: "Active", count: activeList.length },
                  {
                    key: "history",
                    label: "History",
                    count: historyList.length,
                  },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold transition-all"
                    style={{
                      fontSize: "3.2vw",
                      border: "none",
                      background:
                        activeTab === key
                          ? "#7c3aed"
                          : "rgba(255,255,255,0.06)",
                      color: activeTab === key ? "#fff" : TEXT_MUTED,
                    }}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded-full font-bold"
                        style={{
                          fontSize: "2.5vw",
                          background:
                            activeTab === key
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(255,255,255,0.08)",
                          color: activeTab === key ? "#fff" : TEXT_MUTED,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="px-5 py-4">
              {loadingHistory ? (
                <p
                  className="text-center py-6"
                  style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
                >
                  Loading...
                </p>
              ) : displayList.length === 0 ? (
                <p
                  className="text-center py-6"
                  style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
                >
                  {activeTab === "active"
                    ? "No active subscriptions"
                    : "No history yet"}
                </p>
              ) : (
                <div className="space-y-3">
                  {displayList.map((sub) => {
                    const pkgColor =
                      packages.find((p) => p.name === sub.package_name)
                        ?.color || "#1e40af";
                    return (
                      <div
                        key={sub.id}
                        className="rounded-2xl overflow-hidden"
                        style={{ border: `1px solid ${DARK_BORDER}` }}
                      >
                        <div
                          className="h-0.5 w-full"
                          style={{
                            background: `linear-gradient(90deg,${pkgColor},#3b82f6)`,
                          }}
                        />
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p
                                className="font-bold"
                                style={{
                                  fontSize: "3.8vw",
                                  color: TEXT_PRIMARY,
                                }}
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
                                {sub.duration_days} days · Qty: {sub.quantity}
                              </p>
                            </div>
                            <span
                              className="px-2.5 py-1 rounded-full font-semibold"
                              style={{
                                fontSize: "2.8vw",
                                ...(statusStyle[sub.status] ||
                                  statusStyle.completed),
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
                                Rent paid
                              </p>
                              <p
                                className="font-bold"
                                style={{
                                  fontSize: "3.5vw",
                                  color: TEXT_PRIMARY,
                                }}
                              >
                                {Number(sub.rent_amount).toLocaleString()}
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
                                Daily
                              </p>
                              <p
                                className="font-bold"
                                style={{ fontSize: "3.5vw", color: "#60a5fa" }}
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
                                className="font-bold"
                                style={{
                                  fontSize: "3.5vw",
                                  color: "rgb(16,185,129)",
                                }}
                              >
                                +{Number(sub.total_earned).toFixed(4)}
                              </p>
                            </div>
                          </div>

                          {/* Footer row with countdown */}
                          <div
                            className="flex items-center justify-between mt-3 pt-3"
                            style={{ borderTop: `1px solid ${DARK_BORDER2}` }}
                          >
                            <div className="flex flex-col gap-1">
                              <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                                Ends{" "}
                                {format(new Date(sub.end_date), "dd MMM yyyy")}
                              </p>
                              {sub.status === "active" && (
                                <CountdownTimer endDate={sub.end_date} />
                              )}
                            </div>
                            {sub.status === "active" && (
                              <button
                                onClick={() => handleCancel(sub.id)}
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
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
};

export default MiningMachine;
