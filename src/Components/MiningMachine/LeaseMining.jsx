import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../Header/Header";
import { MACHINES, BENEFITS, MachineIcon, Stars } from "./miningUtils";

// ── Confirm Modal ──
const ConfirmModal = ({ amount, onConfirm, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-6"
    style={{ background: "rgba(0,0,0,0.55)" }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-8 pt-10 pb-8 text-center">
        {/* Check circle */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
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

        {/* Amount */}
        <div className="mb-2">
          <span className="font-black text-4xl" style={{ color: "#84cc16" }}>
            {amount.toLocaleString()}
          </span>
          <span className="text-gray-800 font-bold text-2xl ml-2">USDT</span>
        </div>

        <p className="text-gray-800 font-bold text-xl leading-snug mb-8">
          Your escrow amount
          <br />
          Mining machine leasing
        </p>

        <button
          onClick={onConfirm}
          className="w-full py-4 rounded-2xl text-white font-extrabold text-base mb-5 active:scale-95 transition-transform"
          style={{
            background: "linear-gradient(90deg, #f472b6, #a855f7)",
            boxShadow: "0 8px 24px rgba(168,85,247,0.35)",
          }}
        >
          Confirm
        </button>

        <p className="text-gray-400 text-sm leading-relaxed">
          The daily income of the miner will be automatically deposited into
          your wallet account
        </p>
      </div>
    </div>
  </div>
);

// ── Lease Detail Page ──
const LeaseMining = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefer machine passed via router state; fall back to MACHINES array
  const machine =
    location.state?.machine ?? MACHINES.find((m) => m.id === Number(id));

  const [qty, setQty] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const totalCost = machine ? machine.rentValue * qty : 0;

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Machine not found.</p>
      </div>
    );
  }

  const handleConfirm = () => {
    setShowConfirm(false);
    navigate("/mining");
  };

  return (
    <>
      {/* Full-height flex-col: content scrolls, button pinned at bottom */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ height: "100dvh", background: "#f3f4f8" }}
      >
        {/* ── Scrollable area ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Gradient header */}
          <div
            className="relative overflow-hidden px-5 pb-16"
            style={{
              background: `linear-gradient(135deg, ${machine.color}ee 0%, #a855f7 60%, #ec4899 100%)`,
            }}
          >
            {/* Decorative blob */}
            <div
              className="absolute"
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
                top: -50,
                right: -50,
              }}
            />

            {/* Reuse your existing Header — it handles back navigation */}
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
                  <p className="text-white font-semibold text-sm leading-snug mb-3">
                    {machine.description}
                  </p>
                  {/* Quantity control */}
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-lg active:scale-90 transition-transform"
                    >
                      −
                    </button>
                    <span className="text-white font-bold text-lg w-6 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-white font-bold text-lg active:scale-90 transition-transform"
                    >
                      +
                    </button>
                    <span className="text-white/80 text-sm font-medium ml-1">
                      {(machine.rentValue * qty).toLocaleString()} USDT
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Stars count={machine.stars} />
              </div>
            </div>
          </div>

          {/* Info cards — overlap header */}
          <div className="px-4 -mt-6 space-y-4 relative z-10 pb-6">
            {/* Introduction */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-gray-900 font-black text-base mb-1">
                  Introduction
                </h2>
              </div>
              <div className="px-5 pb-5 divide-y divide-gray-50">
                {[
                  { label: "Output", value: machine.output },
                  { label: "Computing power", value: machine.computing },
                  { label: "Power", value: machine.power },
                  { label: "Lease cycle", value: machine.cycle },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-gray-500 text-sm">{row.label}</span>
                    <span className="text-gray-900 font-bold text-sm">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose us */}
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h2 className="text-gray-900 font-black text-base mb-4">
                Choose us
              </h2>
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: "linear-gradient(135deg, #f0f0ff, #fdf0ff)",
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
                    <span className="text-gray-700 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* ── END scrollable area ── */}

        {/* ── Lease button — flex-shrink-0, always visible, never fixed ── */}
        <div
          className="flex-shrink-0 px-4 py-4 bg-white border-t border-gray-100"
          style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
        >
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-base text-white active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(90deg, #f472b6, #a855f7)",
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
              className="ml-2 px-3 py-1 rounded-xl text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.25)" }}
            >
              {totalCost.toLocaleString()} USDT
            </span>
          </button>
        </div>
      </div>

      {/* Confirm modal — fixed to viewport, outside flex container */}
      {showConfirm && (
        <ConfirmModal
          amount={totalCost}
          onConfirm={handleConfirm}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

export default LeaseMining;
