import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import CryptoMarket from "../CryptoMarket/CryptoMarket";
import ForexMarket from "../ForexMarket/ForexMarket";
import MetalMarket from "../MetalMarket/MetalMarket";
import TopMarket from "../TopMarket/TopMarket";
import SideNav from "../Header/SideNav/SideNav";
import belIcon from "../../Assets/images/icon_bell.svg";
import menuIcon from "../../Assets/images/icon_menu.svg";

const SLIDES = [
  { id: 1, src: "/assets/banner1.webp", alt: "Banner 1" },
  { id: 2, src: "/assets/banner2.webp", alt: "Banner 2" },
  {
    id: 3,
    src: "https://miro.medium.com/v2/resize:fit:1400/1*xJXiEZKZEiXLOsXGH90sgg.jpeg",
    alt: "Banner 3",
  },
  { id: 4, src: "/assets/banner4.jpg", alt: "Banner 4" },
];

const AUTO_PLAY_INTERVAL = 3500;

function HeroBannerSlider({ onMenuClick }) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const timerRef = useRef(null);
  const total = SLIDES.length;

  const goTo = useCallback(
    (index) => setCurrent((index + total) % total),
    [total],
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const onDragStart = (clientX) => {
    clearInterval(timerRef.current);
    setDragging(true);
    setDragStartX(clientX);
    setDragDelta(0);
  };
  const onDragMove = (clientX) => {
    if (!dragging) return;
    setDragDelta(clientX - dragStartX);
  };
  const onDragEnd = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragDelta < -40) next();
    else if (dragDelta > 40) goTo(current - 1);
    setDragDelta(0);
    resetTimer();
  };

  const iconBtnStyle = {
    width: 38,
    height: 38,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(10, 10, 15, 0.55)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
    flexShrink: 0,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        borderRadius: "0 0 7vw 7vw",
        background: "#0a0a0f",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
      onTouchEnd={onDragEnd}
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseMove={(e) => onDragMove(e.clientX)}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
        }}
      >
        <Link
          to="/notification"
          style={{ ...iconBtnStyle, textDecoration: "none" }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <img
            src={belIcon}
            alt="Notifications"
            style={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }}
          />
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(10, 10, 15, 0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
            borderRadius: 99,
            padding: "6px 14px 6px 8px",
          }}
        >
          <svg
            viewBox="0 0 40 40"
            fill="none"
            style={{ width: 26, height: 26, flexShrink: 0 }}
          >
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
            <path d="M20 22L36 13V27L20 36V22Z" fill="rgba(255,255,255,0.35)" />
            <path d="M20 22L4 13V27L20 36V22Z" fill="rgba(255,255,255,0.2)" />
          </svg>
          <span
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Trust Pro
          </span>
        </div>

        <button
          onClick={onMenuClick}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ ...iconBtnStyle, border: "none" }}
        >
          <img
            src={menuIcon}
            alt="Menu"
            style={{ width: 18, height: 18, filter: "brightness(0) invert(1)" }}
          />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          transition: dragging
            ? "none"
            : "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)",
          transform: `translateX(calc(${-current * 100}% + ${dragDelta}px))`,
          willChange: "transform",
        }}
      >
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            style={{
              minWidth: "100%",
              position: "relative",
              aspectRatio: "16/10",
              overflow: "hidden",
              background: "#1a1a2e",
            }}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "35%",
                background:
                  "linear-gradient(to top, rgba(10,10,15,0.65) 0%, transparent 100%)",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 6,
          zIndex: 20,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              goTo(i);
              resetTimer();
            }}
            style={{
              width: i === current ? 22 : 7,
              height: 7,
              borderRadius: 99,
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: i === current ? "#a78bfa" : "rgba(255,255,255,0.35)",
              transition:
                "width 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.25s",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          zIndex: 20,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          borderRadius: 99,
          padding: "3px 10px",
          color: "rgba(255,255,255,0.75)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        {current + 1} / {total}
      </div>
    </div>
  );
}

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
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <HeroBannerSlider onMenuClick={() => setToggleMenu((prev) => !prev)} />

      <SideNav toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />

      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: "1.1vw", height: "5.33vw", background: "#7c3aed" }}
          />
          <span className="text-white font-bold" style={{ fontSize: "5.33vw" }}>
            Market
          </span>
        </div>
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
        <div id="crypto-market">
          {activeTab === "crypto" && <CryptoMarket />}
        </div>
        <div id="forex-market"> {activeTab === "forex" && <ForexMarket />}</div>
        <div id="metal-market"> {activeTab === "metal" && <MetalMarket />}</div>
        <div id="top-market"> {activeTab === "top" && <TopMarket />}</div>
      </div>

      <div className="px-4 pt-4 pb-2 flex flex-col gap-4">
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
