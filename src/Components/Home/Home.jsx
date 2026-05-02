import React, { useState } from "react";
import { Link } from "react-router-dom";
import CryptoMarket from "../CryptoMarket/CryptoMarket";
import ForexMarket from "../ForexMarket/ForexMarket";
import MetalMarket from "../MetalMarket/MetalMarket";
import TopMarket from "../TopMarket/TopMarket";
import SideNav from "../Header/SideNav/SideNav";
import belIcon from "../../Assets/images/icon_bell.svg";
import menuIcon from "../../Assets/images/icon_menu.svg";

const TABS = [
  { key: "crypto", label: "Digital Currency" },
  { key: "forex", label: "Foreign Exchange" },
  { key: "metal", label: "Precious Metal" },
  { key: "top", label: "Top" },
];

function Home() {
  const [activeTab, setActiveTab] = useState("crypto");
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    /* ── Page root: dark background ── */
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* ════════════════════════════════════════
          HEADER  — purple-gradient pill, same
          hue family as SideNav accents
      ════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden px-4 pt-6 pb-6"
        style={{
          background:
            "linear-gradient(145deg,#5b21b6 0%,#7c3aed 55%,#a78bfa 100%)",
          borderRadius: "0 0 8vw 8vw",
        }}
      >
        {/* decorative blobs */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            top: "-25%",
            right: "-15%",
            width: "55vw",
            height: "55vw",
            background: "rgba(196,132,252,0.2)",
          }}
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            bottom: "-30%",
            left: "-10%",
            width: "45vw",
            height: "45vw",
            background: "rgba(109,40,217,0.3)",
          }}
        />

        {/* top bar */}
        <div className="relative z-10 flex items-center justify-between mb-5">
          <Link to="/notification" className="p-2">
            <img
              src={belIcon}
              alt="Notifications"
              className="w-5 brightness-0 invert"
            />
          </Link>

          {/* brand */}
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
              <path
                d="M20 4L36 13V27L20 36L4 27V13L20 4Z"
                fill="rgba(255,255,255,0.25)"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M20 4L36 13L20 22L4 13L20 4Z"
                fill="rgba(255,255,255,0.55)"
              />
              <path
                d="M20 22L36 13V27L20 36V22Z"
                fill="rgba(255,255,255,0.35)"
              />
              <path d="M20 22L4 13V27L20 36V22Z" fill="rgba(255,255,255,0.2)" />
            </svg>
            <span>Trust Pro</span>
          </div>

          <button className="p-2" onClick={() => setToggleMenu(!toggleMenu)}>
            <img
              src={menuIcon}
              alt="Menu"
              className="w-5 brightness-0 invert"
            />
          </button>
        </div>

        {/* hero banner */}
        <div
          className="relative z-10 flex items-center justify-between rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg,rgba(46,7,100,0.75) 0%,rgba(76,29,149,0.85) 100%)",
            padding: "5vw 4vw 5vw 5vw",
            minHeight: "34vw",
          }}
        >
          <div className="flex-1 z-10">
            <h2
              className="text-white font-bold leading-snug"
              style={{ fontSize: "5.5vw" }}
            >
              Encryption tools for everyone Intelligently
            </h2>
          </div>

          <div
            className="flex-shrink-0 relative"
            style={{ width: "36vw", height: "28vw" }}
          >
            {/* dot accents */}
            <div
              className="absolute rounded-full bg-violet-400 opacity-70"
              style={{ width: "4vw", height: "4vw", top: "-2vw", left: "4vw" }}
            />
            <div
              className="absolute rounded-full bg-emerald-400 opacity-80"
              style={{
                width: "2.5vw",
                height: "2.5vw",
                bottom: "1vw",
                right: "2vw",
              }}
            />
            {/* screen mockup */}
            <div
              className="absolute right-0 top-0 flex items-center justify-around rounded-2xl"
              style={{
                width: "32vw",
                height: "24vw",
                background: "linear-gradient(135deg,#3730a3 0%,#4c1d95 100%)",
                border: "0.4vw solid rgba(196,132,252,0.55)",
                padding: "2vw",
                boxShadow: "0 4px 20px rgba(109,40,217,0.4)",
              }}
            >
              <span
                className="bg-violet-700 text-white font-bold rounded-xl"
                style={{ fontSize: "3.5vw", padding: "1.5vw 3vw" }}
              >
                DeFi
              </span>
              <span
                className="text-amber-400 font-bold"
                style={{ fontSize: "7.5vw" }}
              >
                ₿
              </span>
            </div>
          </div>
        </div>
      </div>

      <SideNav toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />

      {/* ════════════════════════════════════════
          MARKET SECTION
      ════════════════════════════════════════ */}
      <div className="px-4 pt-6 pb-2">
        {/* title */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: "1.1vw", height: "5.33vw", background: "#7c3aed" }}
          />
          <span className="text-white font-bold" style={{ fontSize: "5.33vw" }}>
            Market
          </span>
        </div>

        {/* tabs */}
        <div className="flex gap-2 flex-wrap mb-4">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="rounded-full font-medium transition-colors"
              style={{
                fontSize: "3.4vw",
                padding: "1.5vw 3.5vw",
                border: "0.02667rem solid #7c3aed",
                background: activeTab === key ? "#7c3aed" : "transparent",
                color: activeTab === key ? "#fff" : "#7c3aed",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* market lists */}
        <div id="crypto-market">
          {activeTab === "crypto" && <CryptoMarket />}
        </div>
        <div id="forex-market"> {activeTab === "forex" && <ForexMarket />}</div>
        <div id="metal-market"> {activeTab === "metal" && <MetalMarket />}</div>
        <div id="top-market"> {activeTab === "top" && <TopMarket />}</div>
      </div>

      {/* ════════════════════════════════════════
          FEATURE CARDS
      ════════════════════════════════════════ */}
      <div className="px-4 pt-4 pb-2 flex flex-col gap-4">
        {/* AI Smart Arbitrage */}
        <div
          className="flex items-center justify-between rounded-3xl overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "5vw",
            minHeight: "32vw",
          }}
        >
          <div className="flex-1 z-10 pr-2">
            <h3
              className="font-bold text-white mb-1"
              style={{ fontSize: "4.8vw" }}
            >
              Ai Smart Arbitrage
            </h3>
            <p className="text-slate-400" style={{ fontSize: "3.5vw" }}>
              Smart trading on 200 exchanges
            </p>
          </div>
          <div
            className="flex-shrink-0 relative"
            style={{ width: "30vw", height: "26vw" }}
          >
            <div
              className="absolute rounded-full opacity-40"
              style={{
                width: "22vw",
                height: "22vw",
                background: "linear-gradient(135deg,#c084fc,#7c3aed)",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <div
              className="absolute rounded-full opacity-60"
              style={{
                width: "13vw",
                height: "13vw",
                background: "linear-gradient(135deg,#a855f7,#6d28d9)",
                right: "7vw",
                top: 0,
              }}
            />
            <div
              className="absolute rounded-xl opacity-80 z-20"
              style={{
                width: "14vw",
                height: "10vw",
                background: "linear-gradient(135deg,#6d28d9,#9333ea)",
                right: "6vw",
                top: "28%",
              }}
            />
            <div
              className="absolute rounded-full flex items-center justify-center text-white font-bold z-30"
              style={{
                width: "8vw",
                height: "8vw",
                fontSize: "4vw",
                background: "#6b7280",
                right: "20vw",
                top: 0,
              }}
            >
              Ξ
            </div>
            <div
              className="absolute rounded-full flex items-center justify-center text-white font-bold z-30"
              style={{
                width: "8vw",
                height: "8vw",
                fontSize: "4vw",
                background: "#f59e0b",
                right: "2vw",
                bottom: "2vw",
              }}
            >
              ₿
            </div>
          </div>
        </div>

        {/* Leveraged Trading */}
        <div
          className="flex items-center justify-between rounded-3xl overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "5vw",
            minHeight: "32vw",
          }}
        >
          <div className="flex-1 z-10 pr-2">
            <h3
              className="font-bold text-white mb-1"
              style={{ fontSize: "4.8vw" }}
            >
              Leveraged trading
            </h3>
            <p className="text-slate-400" style={{ fontSize: "3.5vw" }}>
              Intelligent leveraged trading to improve the efficiency of ROI
            </p>
          </div>
          <div
            className="flex-shrink-0 relative"
            style={{ width: "30vw", height: "26vw" }}
          >
            <div
              className="absolute rounded-2xl opacity-65"
              style={{
                width: "22vw",
                height: "18vw",
                background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                right: "2vw",
                top: "50%",
                transform: "translateY(-50%)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              }}
            />
            <div
              className="absolute rounded-2xl opacity-50"
              style={{
                width: "16vw",
                height: "13vw",
                background: "linear-gradient(135deg,#4c1d95,#7c3aed)",
                right: "8vw",
                bottom: 0,
              }}
            />
            {/* floating BTC coin */}
            <div
              className="absolute rounded-full flex items-center justify-center text-white font-bold z-30"
              style={{
                width: "8vw",
                height: "8vw",
                fontSize: "4vw",
                background: "#f59e0b",
                right: "6vw",
                bottom: "2vw",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                animation: "floatCoin 3s ease-in-out infinite",
              }}
            >
              ₿
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          INVITE FRIENDS
      ════════════════════════════════════════ */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: "1.1vw", height: "5.33vw", background: "#7c3aed" }}
          />
          <h3
            className="text-white font-extrabold"
            style={{ fontSize: "5.33vw" }}
          >
            Invite friends
          </h3>
        </div>

        <div
          className="flex items-center rounded-3xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(130deg,#ec4899 0%,#a855f7 55%,#8b5cf6 100%)",
            padding: "5vw 5vw 5vw 4vw",
            minHeight: "38vw",
            boxShadow: "0 4px 20px rgba(168,85,247,0.3)",
          }}
        >
          {/* blob */}
          <div
            className="pointer-events-none absolute rounded-full"
            style={{
              top: "-20%",
              left: "-10%",
              width: "38vw",
              height: "38vw",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          {/* coins */}
          <div
            className="flex-shrink-0 relative"
            style={{ width: "32vw", height: "28vw" }}
          >
            <div
              className="absolute rounded-full flex items-center justify-center text-white font-bold"
              style={{
                width: "14vw",
                height: "14vw",
                fontSize: "6vw",
                background: "#f59e0b",
                top: "5%",
                left: "10%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              ₿
            </div>
            <div
              className="absolute rounded-full flex items-center justify-center text-white font-bold"
              style={{
                width: "10vw",
                height: "10vw",
                fontSize: "4.5vw",
                background: "#6b7280",
                bottom: "10%",
                right: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              Ξ
            </div>
            <div
              className="absolute rounded-full flex items-center justify-center text-white font-bold"
              style={{
                width: "7vw",
                height: "7vw",
                fontSize: "3vw",
                background: "#34d399",
                top: "45%",
                left: "50%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              }}
            >
              ◎
            </div>
          </div>

          <div className="flex-1 text-right z-10">
            <h3
              className="text-white font-bold"
              style={{ fontSize: "5vw", lineHeight: 1.3 }}
            >
              Invite friends to join
            </h3>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          NEWS
      ════════════════════════════════════════ */}
      <div className="px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{
                width: "1.1vw",
                height: "5.33vw",
                background: "#7c3aed",
              }}
            />
            <h3
              className="text-white font-extrabold"
              style={{ fontSize: "5.33vw" }}
            >
              News
            </h3>
          </div>
          <span
            className="text-violet-400 font-semibold"
            style={{ fontSize: "4vw" }}
          >
            More
          </span>
        </div>
        <div className="text-slate-500 text-center text-sm mt-4">
          News does not represent investment advice
        </div>
      </div>

      {/* float-coin keyframe */}
      <style>{`
        @keyframes floatCoin {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-2vw); }
        }
      `}</style>
    </div>
  );
}

export default Home;
