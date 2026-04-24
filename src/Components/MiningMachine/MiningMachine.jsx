import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header/Header";
import { MACHINES, MachineIcon, Stars } from "./miningUtils";

const MiningMachine = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: "#f3f4f8" }}
    >
      {/* Header */}
      <div className="flex-shrink-0">
        <Header pageTitle="Mining Machine" />
      </div>

      {/* Scrollable cards */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Sub-heading */}
        <div className="flex items-center justify-between px-1">
          <p className="text-gray-700 font-bold text-sm">
            Mining Machine leasing
          </p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4m0 4h.01"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Machine cards */}
        {MACHINES.map((m) => (
          <div
            key={m.id}
            className="rounded-3xl overflow-hidden shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${m.color}dd 0%, ${m.color}99 100%)`,
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
                <p className="text-yellow-300 font-black text-xl mb-1">
                  {m.label}
                </p>
                <p className="text-white/90 text-sm leading-snug mb-2">
                  {m.description}
                </p>
                <p className="text-white/70 text-xs">
                  Rent <span className="text-white font-bold">{m.rent}</span>
                </p>
              </div>
              <button
                onClick={() =>
                  navigate(`/mining/${m.id}`, { state: { machine: m } })
                }
                className="flex-shrink-0 px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform text-white"
                style={{
                  background: "linear-gradient(135deg, #f472b6, #a855f7)",
                }}
              >
                Check
              </button>
            </div>
            <div className="px-5 pb-4">
              <Stars count={m.stars} />
            </div>
          </div>
        ))}

        {/* Cloud mining info card */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <p className="text-indigo-500 font-bold text-base mb-2">
            Cloud mining machine
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Safe and stable money making tool
          </p>
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ background: "#1a1a2e", height: 160 }}
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
              <p className="text-white text-xs opacity-70">Watch on YouTube</p>
            </div>
          </div>
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
};

export default MiningMachine;
