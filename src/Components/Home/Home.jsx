import React, { useState } from "react";
import { Link } from "react-router-dom";
import CryptoMarket from "../CryptoMarket/CryptoMarket";
import ForexMarket from "../ForexMarket/ForexMarket";
import MetalMarket from "../MetalMarket/MetalMarket";
import TopMarket from "../TopMarket/TopMarket";
import SideNav from "../Header/SideNav/SideNav";
import belIcon from "../../Assets/images/icon_bell.svg";
import menuIcon from "../../Assets/images/icon_menu.svg";
import "./Home.css";

function Home() {
  const [activeTab, setActiveTab] = useState("crypto");
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div className="user-panel">
      {/* ── Purple gradient header ── */}
      <div className="home-header">
        <div className="home-header-top">
          <Link to="/notification" className="header-icon-btn">
            <img src={belIcon} alt="Notifications" />
          </Link>

          <div className="metaverse-brand">
            <div className="metaverse-logo-icon">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
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
                <path
                  d="M20 22L36 13V27L20 36V22Z"
                  fill="rgba(255,255,255,0.35)"
                />
                <path
                  d="M20 22L4 13V27L20 36V22Z"
                  fill="rgba(255,255,255,0.2)"
                />
              </svg>
            </div>
            <span>Meta</span>
          </div>

          <button
            className="header-icon-btn"
            onClick={() => setToggleMenu(!toggleMenu)}
          >
            <img src={menuIcon} alt="Menu" />
          </button>
        </div>

        {/* Hero banner */}
        <div className="hero-banner-card">
          <div className="hero-banner-content">
            <h2>Encryption tools for everyone Intelligently</h2>
          </div>
          <div className="hero-banner-visual">
            <div className="defi-dot defi-dot-1" />
            <div className="defi-dot defi-dot-2" />
            <div className="defi-screen-mockup">
              <div className="defi-badge">DeFi</div>
              <div className="hero-coin-icon">₿</div>
            </div>
          </div>
        </div>
      </div>

      <SideNav toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />

      {/* ── Market section ── */}
      <div className="market_container">
        <div className="market_title">
          <span>Market</span>
        </div>
        <div className="market_tabs">
          <div
            className={`tab_item ${activeTab === "crypto" ? "active" : ""}`}
            onClick={() => setActiveTab("crypto")}
          >
            Digital Currency
          </div>
          <div
            className={`tab_item ${activeTab === "forex" ? "active" : ""}`}
            onClick={() => setActiveTab("forex")}
          >
            Foreign Exchange
          </div>
          <div
            className={`tab_item ${activeTab === "metal" ? "active" : ""}`}
            onClick={() => setActiveTab("metal")}
          >
            Precious Metal
          </div>
          <div
            className={`tab_item ${activeTab === "top" ? "active" : ""}`}
            onClick={() => setActiveTab("top")}
          >
            Top
          </div>
        </div>

        <div id="crypto-market">
          {activeTab === "crypto" && <CryptoMarket />}
        </div>
        <div id="forex-market">{activeTab === "forex" && <ForexMarket />}</div>
        <div id="metal-market">{activeTab === "metal" && <MetalMarket />}</div>
        <div id="top-market">{activeTab === "top" && <TopMarket />}</div>
      </div>

      {/* ── Feature cards ── */}
      <div className="feature-cards-section">
        {/* Ai Smart Arbitrage */}
        <div className="feature-card">
          <div className="feature-card-text">
            <h3>Ai Smart Arbitrage</h3>
            <p>Smart trading on 200 exchanges</p>
          </div>
          <div className="feature-card-visual">
            <div className="ai-bg-circle-1" />
            <div className="ai-bg-circle-2" />
            <div className="ai-screen" />
            <div className="ai-coin ai-coin-eth">Ξ</div>
            <div className="ai-coin ai-coin-btc">₿</div>
          </div>
        </div>

        {/* Leveraged trading */}
        <div className="feature-card">
          <div className="feature-card-text">
            <h3>Leveraged trading</h3>
            <p>
              Intelligent leveraged trading to improve the efficiency of ROI
            </p>
          </div>
          <div className="feature-card-visual">
            <div className="lev-chart-card" />
            <div className="lev-chart-overlay" />
            <div className="lev-coin-btc">₿</div>
          </div>
        </div>
      </div>

      {/* ── Invite friends ── */}
      <div className="invite-section">
        <div className="section-header">
          <span className="section-accent" />
          <h3>Invite friends</h3>
        </div>
        <div className="invite-banner">
          <div className="invite-visual">
            <div className="inv-coin inv-coin-btc">₿</div>
            <div className="inv-coin inv-coin-eth">Ξ</div>
            <div className="inv-coin inv-coin-small">◎</div>
          </div>
          <div className="invite-content">
            <h3>Invite friends to join</h3>
            {/* <Link to="/invite" className="invite-btn">
              Start invitation
            </Link> */}
          </div>
        </div>
      </div>

      {/* ── News ── */}
      <div className="news_container">
        <div className="home_news">
          <div className="news_title">
            <div className="section-header">
              <span className="section-accent" />
              <h3 className="fs-20 ff_InterSemiBold">News</h3>
            </div>
            <div className="more fc-1652F0 fs-16">More</div>
          </div>
          <div className="news_content" />
          <div className="news_tips ff_NunitoSemiBold">
            News does not represent investment advice
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
