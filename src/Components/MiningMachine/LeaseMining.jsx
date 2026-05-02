import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Header from "../Header/Header";
import { BENEFITS, MachineIcon, Stars } from "./miningUtils";
import { useUser } from "../../context/UserContext";
import {
  getMiningPackages,
  subscribeMining,
  getUserMiningSubscriptions,
  cancelMiningSubscription,
} from "../../api/mining.api";

/* ─── Theme ── */
const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";

/* ─── Status badges ── */
const statusStyle = {
  active: {
    background: "rgba(16,185,129,0.12)",
    color: "rgb(16,185,129)",
    border: "1px solid rgba(16,185,129,0.2)",
  },
  completed: {
    background: "rgba(100,116,139,0.12)",
    color: "#64748b",
    border: "1px solid rgba(100,116,139,0.2)",
  },
  cancelled: {
    background: "rgba(239,68,68,0.12)",
    color: "rgb(239,68,68)",
    border: "1px solid rgba(239,68,68,0.2)",
  },
};

/* ── Confirm Modal ── */
const ConfirmModal = ({ amount, qty, onConfirm, onClose, loading }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-6"
    style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: "#111118", border: `1px solid ${DARK_BORDER}` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-8 pt-10 pb-8 text-center">
        {/* Check circle */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg,#6366f1,#a855f7)",
            boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18l7 7 13-13"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mb-2">
          <span
            className="font-black"
            style={{ fontSize: "9vw", color: "#84cc16" }}
          >
            {Number(amount).toLocaleString()}
          </span>
          <span
            className="font-bold ml-2"
            style={{ fontSize: "6vw", color: TEXT_PRIMARY }}
          >
            USDT
          </span>
        </div>

        {qty > 1 && (
          <p className="mb-2" style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
            {qty} machines × {Number(amount / qty).toLocaleString()} USDT each
          </p>
        )}

        <p
          className="font-bold leading-snug mb-8"
          style={{ fontSize: "5vw", color: TEXT_PRIMARY }}
        >
          Your escrow amount
          <br />
          Mining machine leasing
        </p>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-extrabold mb-5 active:scale-95 transition-transform disabled:opacity-50"
          style={{
            fontSize: "4.5vw",
            background: "linear-gradient(90deg,#f472b6,#a855f7)",
            boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
          }}
        >
          {loading ? "Processing..." : "Confirm"}
        </button>

        <p style={{ fontSize: "3.5vw", color: TEXT_MUTED, lineHeight: 1.6 }}>
          The daily income of the miner will be automatically deposited into
          your wallet account
        </p>
      </div>
    </div>
  </div>
);

/* ── Lease Detail Page ── */
const LeaseMining = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  const [machine, setMachine] = useState(location.state?.machine || null);
  const [qty, setQty] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingPackage, setLoadingPackage] = useState(
    !location.state?.machine,
  );

  const totalCost = machine ? parseFloat(machine.rent_amount) * qty : 0;

  useEffect(() => {
    if (!location.state?.machine) {
      setLoadingPackage(true);
      getMiningPackages()
        .then((res) => {
          const pkg = res.data.find((p) => p.id === parseInt(id));
          if (pkg) setMachine(pkg);
          else {
            toast.error("Package not found");
            navigate("/mining");
          }
        })
        .catch(() => {
          toast.error("Failed to load package");
          navigate("/mining");
        })
        .finally(() => setLoadingPackage(false));
    }
  }, [id, location.state, navigate]);

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

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await subscribeMining({
        userId: user.id,
        packageId: machine.id,
        quantity: qty,
      });
      toast.success("Mining subscription started!");
      setShowConfirm(false);
      await fetchSubscriptions();
      setShowHistory(true);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to subscribe");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (subscriptionId) => {
    try {
      await cancelMiningSubscription({ subscriptionId, userId: user.id });
      toast.success("Subscription cancelled — principal returned");
      fetchSubscriptions();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  if (loadingPackage) {
    return (
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "100dvh", background: DARK_BG }}
      >
        <div className="flex-shrink-0">
          <Header pageTitle="Leasehold Mining" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p style={{ color: TEXT_MUTED, fontSize: "3.5vw" }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!machine) return null;

  return (
    <>
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "100dvh", background: DARK_BG }}
      >
        {/* ── Scrollable area ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Gradient header */}
          <div
            className="relative overflow-hidden px-5 pb-16"
            style={{
              background: `linear-gradient(135deg,${machine.color}ee 0%,#a855f7 60%,#ec4899 100%)`,
            }}
          >
            <div
              className="absolute pointer-events-none rounded-full"
              style={{
                width: 200,
                height: 200,
                background: "rgba(255,255,255,0.07)",
                top: -50,
                right: -50,
              }}
            />

            <Header pageTitle="Leasehold Mining" />

            {/* Machine hero card */}
            <div
              className="relative z-10 rounded-3xl p-5"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  <MachineIcon size={56} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-yellow-300 font-black mb-1"
                    style={{ fontSize: "4.5vw" }}
                  >
                    {machine.name}
                  </p>
                  <p
                    className="text-white/80 leading-snug mb-3"
                    style={{ fontSize: "3.3vw" }}
                  >
                    Financial product — not redeemable within{" "}
                    {machine.duration_days} days
                  </p>
                  {/* Quantity control */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold active:scale-90 transition-transform"
                      style={{ fontSize: "5vw" }}
                    >
                      −
                    </button>
                    <span
                      className="text-white font-bold w-6 text-center"
                      style={{ fontSize: "4.5vw" }}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold active:scale-90 transition-transform"
                      style={{ fontSize: "5vw" }}
                    >
                      +
                    </button>
                    <span
                      className="text-white/80 font-medium ml-1"
                      style={{ fontSize: "3.5vw" }}
                    >
                      {totalCost.toLocaleString()} USDT
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Stars count={machine.stars || 5} />
              </div>
            </div>
          </div>

          {/* Info cards — overlap header */}
          <div className="px-4 -mt-6 space-y-4 relative z-10 pb-6">
            {/* Introduction */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div className="px-5 pt-5 pb-2">
                <h2
                  className="font-black"
                  style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
                >
                  Introduction
                </h2>
              </div>
              <div className="px-5 pb-5">
                {[
                  { label: "Output", value: `${machine.daily_rate}% USDT/Day` },
                  { label: "Computing power", value: machine.computing },
                  { label: "Power", value: machine.power },
                  {
                    label: "Lease cycle",
                    value: `${machine.duration_days} Days`,
                  },
                  {
                    label: "Rent amount",
                    value: `${Number(machine.rent_amount).toLocaleString()} USDT`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
                  >
                    <span style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
                      {row.label}
                    </span>
                    <span
                      className="font-bold"
                      style={{ fontSize: "3.5vw", color: TEXT_PRIMARY }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose us */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <h2
                className="font-black mb-4"
                style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
              >
                Choose us
              </h2>
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.15)",
                }}
              >
                {BENEFITS.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: "#6366f1" }}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 5l2 2 4-4"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span style={{ fontSize: "3.5vw", color: TEXT_MUTED }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* My subscriptions */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: DARK_CARD,
                border: `1px solid ${DARK_BORDER}`,
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setShowHistory(!showHistory)}
              >
                <h2
                  className="font-black"
                  style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
                >
                  My Subscriptions
                  {subscriptions.filter((s) => s.status === "active").length >
                    0 && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded-full font-bold"
                      style={{
                        fontSize: "2.8vw",
                        background: "rgba(16,185,129,0.15)",
                        color: "rgb(16,185,129)",
                      }}
                    >
                      {
                        subscriptions.filter((s) => s.status === "active")
                          .length
                      }{" "}
                      active
                    </span>
                  )}
                </h2>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    transform: showHistory ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .2s",
                  }}
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke={TEXT_MUTED}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {showHistory && (
                <div className="px-5 pb-5">
                  {loadingHistory ? (
                    <p
                      className="text-center py-4"
                      style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
                    >
                      Loading...
                    </p>
                  ) : subscriptions.length === 0 ? (
                    <p
                      className="text-center py-4"
                      style={{ fontSize: "3.5vw", color: TEXT_MUTED }}
                    >
                      No subscriptions yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {subscriptions.map((sub) => (
                        <div
                          key={sub.id}
                          className="rounded-2xl overflow-hidden"
                          style={{ border: `1px solid ${DARK_BORDER}` }}
                        >
                          <div
                            className="h-0.5 w-full"
                            style={{
                              background: `linear-gradient(90deg,${machine.color},#a855f7)`,
                            }}
                          />
                          <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p
                                  className="font-bold"
                                  style={{
                                    fontSize: "3.2vw",
                                    color: TEXT_PRIMARY,
                                  }}
                                >
                                  {sub.package_name}
                                </p>
                                <p
                                  style={{ fontSize: "3vw", color: TEXT_MUTED }}
                                >
                                  {sub.duration_days} days · Qty: {sub.quantity}
                                </p>
                              </div>
                              <span
                                className="px-2 py-0.5 rounded-full font-semibold"
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
                              className="grid grid-cols-3 gap-2 pt-2"
                              style={{ borderTop: `1px solid ${DARK_BORDER2}` }}
                            >
                              <div>
                                <p
                                  style={{ fontSize: "3vw", color: TEXT_MUTED }}
                                >
                                  Rent paid
                                </p>
                                <p
                                  className="font-bold"
                                  style={{
                                    fontSize: "3.2vw",
                                    color: TEXT_PRIMARY,
                                  }}
                                >
                                  {Number(sub.rent_amount).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{ fontSize: "3vw", color: TEXT_MUTED }}
                                >
                                  Daily
                                </p>
                                <p
                                  className="font-bold"
                                  style={{
                                    fontSize: "3.2vw",
                                    color: "#a78bfa",
                                  }}
                                >
                                  {sub.daily_rate}%
                                </p>
                              </div>
                              <div>
                                <p
                                  style={{ fontSize: "3vw", color: TEXT_MUTED }}
                                >
                                  Earned
                                </p>
                                <p
                                  className="font-bold"
                                  style={{
                                    fontSize: "3.2vw",
                                    color: "rgb(16,185,129)",
                                  }}
                                >
                                  +{Number(sub.total_earned).toFixed(4)}
                                </p>
                              </div>
                            </div>
                            <div
                              className="flex items-center justify-between mt-2 pt-2"
                              style={{ borderTop: `1px solid ${DARK_BORDER2}` }}
                            >
                              <p style={{ fontSize: "3vw", color: TEXT_MUTED }}>
                                Ends{" "}
                                {format(new Date(sub.end_date), "dd MMM yyyy")}
                              </p>
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
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ── END scrollable area ── */}

        {/* ── Lease button ── */}
        <div
          className="flex-shrink-0 px-4 py-4"
          style={{ background: DARK_BG, borderTop: `1px solid ${DARK_BORDER}` }}
        >
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-white active:scale-95 transition-transform"
            style={{
              fontSize: "4.5vw",
              background: "linear-gradient(90deg,#f472b6,#a855f7)",
              boxShadow: "0 8px 24px rgba(168,85,247,0.4)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="2"
                y="7"
                width="20"
                height="14"
                rx="2"
                fill="white"
                opacity="0.3"
              />
              <path
                d="M16 7V5a2 2 0 00-4 0v2M2 11h20"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="16" cy="14" r="1.5" fill="white" />
            </svg>
            <span>Lease now</span>
            <span
              className="ml-2 px-3 py-1 rounded-xl font-bold"
              style={{ fontSize: "3.5vw", background: "rgba(255,255,255,0.2)" }}
            >
              {totalCost.toLocaleString()} USDT
            </span>
          </button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          amount={totalCost}
          qty={qty}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
          loading={submitting}
        />
      )}
    </>
  );
};

export default LeaseMining;
