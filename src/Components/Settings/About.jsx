import React, { useEffect, useRef, useState } from "react";
import Header from "../Header/Header";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

function SectionTitle({ label, title }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        marginBottom: "6vw",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginBottom: "2vw",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: "4vw",
            borderRadius: 99,
            background: "#7c3aed",
          }}
        />
        <span
          style={{
            fontSize: "3.2vw",
            fontWeight: 600,
            color: "#7c3aed",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
      <h2
        style={{
          fontSize: "6.5vw",
          fontWeight: 800,
          color: "#f1f5f9",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          fontFamily: "'Georgia', serif",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function StatItem({ value, suffix, label, start }) {
  const count = useCountUp(value, 1800, start);
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div
        style={{
          fontSize: "7vw",
          fontWeight: 800,
          color: "#a78bfa",
          lineHeight: 1,
          letterSpacing: "-0.02em",
          fontFamily: "'Georgia', serif",
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div
        style={{
          fontSize: "3vw",
          color: "#64748b",
          marginTop: 4,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, accent, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}33`,
        borderRadius: 20,
        padding: "5vw",
        position: "relative",
        overflow: "hidden",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: `${accent}22`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${accent}20`,
          border: `1px solid ${accent}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "3.5vw",
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: "4.2vw",
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: "1.5vw",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "3.4vw", color: "#64748b", lineHeight: 1.65 }}>
        {desc}
      </div>
    </div>
  );
}

function TimelineItem({ year, title, desc, isLast = false, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        gap: "3vw",
        alignItems: "flex-start",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateX(0)" : "translateX(-20px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {/* Node + line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 3,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#7c3aed",
            boxShadow: "0 0 0 4px rgba(124,58,237,0.2)",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: 1,
              flex: 1,
              background: "rgba(124,58,237,0.2)",
              minHeight: 36,
              marginTop: 4,
            }}
          />
        )}
      </div>
      {/* Content */}
      <div style={{ paddingBottom: isLast ? 0 : "4vw" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(124,58,237,0.18)",
            border: "1px solid rgba(124,58,237,0.35)",
            borderRadius: 99,
            padding: "2px 10px",
            fontSize: "3vw",
            fontWeight: 700,
            color: "#a78bfa",
            marginBottom: "1.5vw",
          }}
        >
          {year}
        </div>
        <div
          style={{
            fontSize: "3.8vw",
            fontWeight: 700,
            color: "#e2e8f0",
            marginBottom: "1vw",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "3.2vw", color: "#64748b", lineHeight: 1.6 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function IndustryCard({ icon, label, color, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        borderRadius: 18,
        background: `${color}12`,
        border: `1px solid ${color}30`,
        padding: "5vw 4vw",
        textAlign: "center",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div style={{ fontSize: "8vw", marginBottom: "2vw" }}>{icon}</div>
      <div style={{ fontSize: "3.4vw", fontWeight: 700, color: "#e2e8f0" }}>
        {label}
      </div>
    </div>
  );
}

function TeamCard({ initials, name, role, color, image, delay }) {
  const [ref, inView] = useInView();
  const [imgError, setImgError] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "4vw",
        textAlign: "center",
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.92)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow behind avatar */}
      <div
        style={{
          position: "absolute",
          top: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "60%",
          height: 60,
          borderRadius: "50%",
          background: `${color}22`,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />

      {/* Avatar — image or initials fallback */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          margin: "0 auto 3vw",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Glowing ring */}
        <div
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${color}, ${color}55)`,
            zIndex: 0,
          }}
        />
        {/* Inner white separator ring */}
        <div
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: "50%",
            background: "#0a0a0f",
            zIndex: 1,
          }}
        />

        {/* Profile image */}
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              position: "relative",
              zIndex: 2,
            }}
          />
        ) : (
          /* Initials fallback */
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${color}cc, ${color}66)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5.5vw",
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Georgia', serif",
              position: "relative",
              zIndex: 2,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: "3.6vw",
          fontWeight: 700,
          color: "#e2e8f0",
          marginBottom: "1vw",
        }}
      >
        {name}
      </div>

      {/* Role badge */}
      <div
        style={{
          display: "inline-block",
          background: `${color}18`,
          border: `1px solid ${color}35`,
          borderRadius: 99,
          padding: "2px 10px",
          fontSize: "2.8vw",
          color: color,
          fontWeight: 600,
        }}
      >
        {role}
      </div>
    </div>
  );
}

function ImageBlock({
  src,
  alt,
  fallbackIcon,
  fallbackLabel,
  aspectRatio = "16/9",
  borderColor = "rgba(124,58,237,0.25)",
  bg = "linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)",
  shadow = "0 12px 40px rgba(124,58,237,0.18)",
  badge,
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        aspectRatio,
        background: bg,
        border: `1px solid ${borderColor}`,
        boxShadow: shadow,
        position: "relative",
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: "12vw", opacity: 0.3 }}>{fallbackIcon}</div>
        <div
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "3.2vw",
            fontWeight: 600,
          }}
        >
          {fallbackLabel}
        </div>
      </div>
      {badge && (
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 14,
            background: "rgba(10,10,15,0.72)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: "8px 12px",
          }}
        >
          <div style={{ fontSize: "3vw", color: "#a78bfa", fontWeight: 700 }}>
            {badge.title}
          </div>
          <div style={{ fontSize: "2.8vw", color: "#64748b" }}>{badge.sub}</div>
        </div>
      )}
    </div>
  );
}

export default function AboutUs() {
  const [statsRef, statsInView] = useInView(0.3);

  const features = [
    {
      icon: "🤖",
      title: "AI Trading Bot",
      desc: "Our AI engine analyses 10,000+ signals per second across 200 exchanges, executing trades with precision no human could match.",
      accent: "#7c3aed",
      delay: 0,
    },
    {
      icon: "⚡",
      title: "Smart Arbitrage",
      desc: "Automatically identifies and exploits price discrepancies across markets in real-time, generating consistent returns.",
      accent: "#0891b2",
      delay: 80,
    },
    {
      icon: "🛡️",
      title: "Bank-Grade Security",
      desc: "256-bit encryption, cold wallet storage, and multi-factor authentication protect every asset 24/7.",
      accent: "#059669",
      delay: 160,
    },
    {
      icon: "📊",
      title: "Leveraged Trading",
      desc: "Access up to 100x leverage on major pairs with intelligent risk management that protects your capital automatically.",
      accent: "#d97706",
      delay: 240,
    },
    {
      icon: "🌐",
      title: "Global Markets",
      desc: "Trade Crypto, Forex, Precious Metals, and Commodities from one unified platform with a single account.",
      accent: "#ec4899",
      delay: 320,
    },
    {
      icon: "📱",
      title: "Mobile-First",
      desc: "Full-featured trading platform built for mobile — never miss an opportunity wherever you are in the world.",
      accent: "#7c3aed",
      delay: 400,
    },
  ];

  const timeline = [
    {
      year: "2018",
      title: "Founded",
      desc: "Born from a vision to democratize institutional-grade trading tools for everyone.",
      delay: 0,
    },
    {
      year: "2020",
      title: "AI Engine Launch",
      desc: "Released our first AI trading bot, achieving 94% signal accuracy in 5-year backtesting.",
      delay: 100,
    },
    {
      year: "2022",
      title: "1M Users",
      desc: "Crossed one million active traders across 80 countries, managing over $2B in assets.",
      delay: 200,
    },
    {
      year: "2024",
      title: "Multi-Asset Platform",
      desc: "Expanded from Crypto into Forex and Precious Metals — a true all-in-one trading ecosystem.",
      delay: 300,
    },
  ];

  const industries = [
    { icon: "₿", label: "Cryptocurrency", color: "#f59e0b", delay: 0 },
    { icon: "💱", label: "Forex Trading", color: "#0891b2", delay: 80 },
    { icon: "🥇", label: "Precious Metals", color: "#d97706", delay: 160 },
    { icon: "📈", label: "Commodities", color: "#059669", delay: 240 },
  ];

  const team = [
    {
      initials: "AK",
      name: "Alex Kim",
      role: "CEO & Co-Founder",
      color: "#7c3aed",
      image:
        "https://media.licdn.com/dms/image/v2/D4E03AQFXjmSFhCVXoA/profile-displayphoto-scale_200_200/B4EZfGrcEVHwAc-/0/1751384965788?e=2147483647&v=beta&t=6N5rC33Uy6tFRsRu7dlbjsS9IhPDZaDqw-45WwlkUq8",
      delay: 0,
    },
    {
      initials: "SR",
      name: "Sofia Ramos",
      role: "CTO & AI Lead",
      color: "#0891b2",
      image:
        "https://media.licdn.com/dms/image/v2/D5603AQGqMlev2bNlQQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1728390189568?e=2147483647&v=beta&t=NRXA-p7nKAhiwiJUV7e_9jbvq-77ABJpV5TcDFXLZX0",
      delay: 80,
    },
    {
      initials: "MJ",
      name: "Marcus J.",
      role: "Head of Trading",
      color: "#059669",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWSIhcak19CtkPCl8PQkJdjSHaA6KOWDoJQA&s",
      delay: 160,
    },
    {
      initials: "NP",
      name: "Nina Patel",
      role: "Chief Security",
      color: "#ec4899",
      image:
        "https://www.cedarcrest.edu/wp-content/uploads/2024/10/Nina_Patel_2.jpg",
      delay: 240,
    },
  ];

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh" }}>
      <div className="flex-shrink-0">
        <Header pageTitle="About Us" />
      </div>

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "10vw 6vw 12vw",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "90vw",
            height: "90vw",
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-block",
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 99,
            padding: "4px 14px",
            fontSize: "3.2vw",
            fontWeight: 600,
            color: "#a78bfa",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "4vw",
          }}
        >
          Est. 2018 · Trusted Worldwide
        </div>

        <h1
          style={{
            fontSize: "8vw",
            fontWeight: 900,
            color: "#f1f5f9",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontFamily: "'Georgia', serif",
            marginBottom: "4vw",
          }}
        >
          The Future of
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#a78bfa,#60a5fa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Intelligent Trading
          </span>
        </h1>

        <p
          style={{
            fontSize: "3.8vw",
            color: "#94a3b8",
            lineHeight: 1.7,
            maxWidth: 320,
            margin: "0 auto",
          }}
        >
          Trust Pro combines cutting-edge AI with institutional-grade
          infrastructure to give every trader an unfair advantage in global
          markets.
        </p>
      </div>

      {/* ── Hero Banner Image ── */}
      <div style={{ padding: "0 5vw 8vw" }}>
        <ImageBlock
          src="https://img.freepik.com/premium-photo/electronic-display-live-stock-chart-computer-screen-providing-realtime-market-analysis-graph-chart-stock-market-investment-trading-ai-generated_538213-36827.jpg"
          alt="Trust Pro Platform"
          aspectRatio="16/9"
          badge={{ title: "LIVE PLATFORM", sub: "Trusted by 2M+ traders" }}
        />
      </div>

      {/* ── Stats ── */}
      <div
        ref={statsRef}
        style={{
          margin: "0 5vw 10vw",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "6vw 4vw",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "2vw",
            marginBottom: "6vw",
          }}
        >
          <StatItem
            value={2000000}
            suffix="+"
            label="Active Traders"
            start={statsInView}
          />
          <div style={{ width: 1, background: "rgba(255,255,255,0.07)" }} />
          <StatItem
            value={200}
            suffix="+"
            label="Exchanges"
            start={statsInView}
          />
        </div>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            marginBottom: "6vw",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "2vw",
          }}
        >
          <StatItem
            value={80}
            suffix="+"
            label="Countries"
            start={statsInView}
          />
          <div style={{ width: 1, background: "rgba(255,255,255,0.07)" }} />
          <StatItem
            value={99}
            suffix="%"
            label="Uptime SLA"
            start={statsInView}
          />
        </div>
      </div>

      {/* ── Our Story ── */}
      <div style={{ padding: "0 5vw 10vw" }}>
        <SectionTitle label="Our Story" title="Built by traders, for traders" />
        <p
          style={{
            fontSize: "3.8vw",
            color: "#94a3b8",
            lineHeight: 1.75,
            marginBottom: "4vw",
          }}
        >
          Trust Pro was founded in 2018 by a team of quantitative analysts and
          software engineers who were frustrated by the gap between
          institutional trading tools and what everyday investors could access.
        </p>
        <ImageBlock
          src="/assets/headquaters.png"
          alt="Our Team"
          fallbackIcon="🏢"
          fallbackLabel="Our Headquarters"
          aspectRatio="4/3"
          bg="linear-gradient(135deg,#0c4a6e,#075985)"
          borderColor="rgba(8,145,178,0.2)"
          shadow="0 8px 28px rgba(8,145,178,0.12)"
        />
        <p
          style={{
            fontSize: "3.8vw",
            color: "#94a3b8",
            lineHeight: 1.75,
            marginTop: "4vw",
          }}
        >
          Today we power over 2 million traders across 80 countries with our
          AI-driven platform that analyses billions of data points daily to
          deliver smarter, faster, and more profitable decisions.
        </p>
      </div>

      {/* ── Features ── */}
      <div style={{ padding: "0 5vw 10vw" }}>
        <SectionTitle
          label="What We Offer"
          title="Everything you need to win"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5vw" }}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>

      {/* ── AI Bot Highlight ── */}
      <div style={{ padding: "0 5vw 10vw" }}>
        <div
          style={{
            borderRadius: 24,
            overflow: "hidden",
            background:
              "linear-gradient(135deg,rgba(124,58,237,0.2) 0%,rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(124,58,237,0.3)",
            padding: "6vw",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.2)",
              filter: "blur(40px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.35)",
              borderRadius: 99,
              padding: "3px 12px",
              marginBottom: "4vw",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
              }}
            />
            <span
              style={{ fontSize: "3vw", color: "#a78bfa", fontWeight: 600 }}
            >
              AI ENGINE LIVE
            </span>
          </div>

          <h2
            style={{
              fontSize: "6vw",
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.2,
              marginBottom: "3vw",
              fontFamily: "'Georgia', serif",
            }}
          >
            Our AI Bot Never Sleeps
          </h2>
          <p
            style={{
              fontSize: "3.6vw",
              color: "#94a3b8",
              lineHeight: 1.7,
              marginBottom: "5vw",
            }}
          >
            Operating 24/7 across 200+ exchanges, our neural network processes
            over 10,000 market signals per second — spotting opportunities
            invisible to the human eye.
          </p>

          <div style={{ display: "flex", gap: "3vw", marginBottom: "5vw" }}>
            {[
              { val: "10K+", label: "Signals/sec" },
              { val: "94%", label: "Accuracy" },
              { val: "<1ms", label: "Latency" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "rgba(10,10,15,0.5)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  borderRadius: 14,
                  padding: "3vw",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "5vw",
                    fontWeight: 800,
                    color: "#a78bfa",
                    fontFamily: "'Georgia', serif",
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{ fontSize: "2.8vw", color: "#475569", marginTop: 2 }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <ImageBlock
            src="https://www.celebremagazine.world/wp-content/uploads/2024/11/aok-1170x600.jpg"
            alt="AI Trading Bot"
            aspectRatio="16/7"
            bg="rgba(10,10,15,0.4)"
            borderColor="rgba(124,58,237,0.15)"
            shadow="none"
          />
        </div>
      </div>

      <div style={{ padding: "0 5vw 10vw" }}>
        <SectionTitle label="Our Journey" title="Milestones that shaped us" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {timeline.map((item, i) => (
            <TimelineItem
              key={i}
              {...item}
              isLast={i === timeline.length - 1}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: "0 5vw 10vw" }}>
        <SectionTitle label="Industries" title="Markets we power" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3vw",
          }}
        >
          {industries.map((ind, i) => (
            <IndustryCard key={i} {...ind} />
          ))}
        </div>
      </div>

      <div style={{ padding: "0 5vw 10vw" }}>
        <SectionTitle label="The Team" title="Minds behind the machine" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3vw",
          }}
        >
          {team.map((m, i) => (
            <TeamCard key={i} {...m} />
          ))}
        </div>
      </div>

      <div style={{ padding: "0 5vw 16vw" }}>
        <div
          style={{
            borderRadius: 24,
            background:
              "linear-gradient(135deg,#ec4899 0%,#a855f7 55%,#7c3aed 100%)",
            padding: "8vw 6vw",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(168,85,247,0.35)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30%",
              left: "-10%",
              width: "60vw",
              height: "60vw",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.07)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontSize: "3.2vw",
              fontWeight: 700,
              color: "rgba(255,255,255,0.65)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "3vw",
            }}
          >
            Our Mission
          </div>
          <h2
            style={{
              fontSize: "7vw",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: "4vw",
              fontFamily: "'Georgia', serif",
            }}
          >
            Democratize Wealth Through Intelligent Trading
          </h2>
          <p
            style={{
              fontSize: "3.6vw",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
            }}
          >
            We believe everyone deserves access to the same tools that hedge
            funds and institutional traders use. Trust Pro is our promise to
            make that a reality.
          </p>
        </div>
      </div>
    </div>
  );
}
