import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import useSettings from "../../../hooks/useSettings";
import useWallets from "../../../hooks/useWallets";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import { BiDollar, BiWallet } from "react-icons/bi";
import { MdOutlineShowChart } from "react-icons/md";
import { GiMining } from "react-icons/gi";
import { TbChartBar } from "react-icons/tb";

const appName = "Trust Pro";

const navItems = [
  {
    label: "Wallet",
    to: "/account",
    iconBg: "linear-gradient(135deg,#f59e0b,#f97316)",
    reactIcon: <BiWallet />,
    reactIconStyle: { fontSize: 22, color: "#fff" },
  },
  {
    label: "Trade",
    to: "/",
    iconBg: "linear-gradient(135deg,#10b981,#059669)",
    icon: "/assets/images/menu/trade.png",
    iconStyle: { width: 40, height: 40 },
  },
  {
    label: "Arbitrage",
    to: "/arbitrage",
    iconBg: "linear-gradient(135deg,#3b82f6,#6366f1)",
    reactIcon: <MdOutlineShowChart />,
    reactIconStyle: { fontSize: 22, color: "#fff" },
  },
  {
    label: "Mining",
    to: "/mining",
    iconBg: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    reactIcon: <GiMining />,
    reactIconStyle: { fontSize: 20, color: "#fff" },
  },
  {
    label: "Help Loan",
    to: "/loan-landing",
    icon: "/assets/images/menu/loan.png",
    iconBg: "linear-gradient(135deg,#f97316,#ef4444)",
    iconStyle: { width: 30, height: 28 },
  },
  {
    label: "Profit Statistics",
    to: "/profit-stat",
    iconBg: "linear-gradient(135deg,#14b8a6,#0891b2)",
    reactIcon: <TbChartBar />,
    reactIconStyle: { fontSize: 22, color: "#fff" },
  },

  {
    label: "Transaction",
    to: "/transaction",
    icon: "/assets/images/menu/transaction.png",
    iconBg: "linear-gradient(135deg,#f97316,#ef4444)",
    iconStyle: { width: 22, height: 22 },
  },
];

const DEFAULT_ICON_BG = "linear-gradient(135deg,#6366f1,#a855f7)";

/* ══════════════════════════════════════════════
   NAV ICON — renders react icon OR <img>
══════════════════════════════════════════════ */
const NavIcon = ({
  reactIcon,
  reactIconStyle,
  icon,
  iconStyle,
  iconBg,
  alt,
}) => (
  <div
    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
    style={{ background: iconBg || DEFAULT_ICON_BG }}
  >
    {reactIcon ? (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(reactIconStyle || {}),
        }}
      >
        {reactIcon}
      </span>
    ) : (
      <img
        src={icon}
        alt={alt}
        className="object-contain brightness-0 invert"
        style={{ width: 20, height: 20, ...(iconStyle || {}) }}
      />
    )}
  </div>
);

/* ══════════════════════════════════════════════
   SETTINGS ITEM
══════════════════════════════════════════════ */
const SettingsItem = ({ gradient, icon, label, sublabel, onClick, to }) => {
  const content = (
    <div
      className="flex items-center justify-between px-5 py-4 transition-colors"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.06)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        <div>
          <p
            style={{ color: "#f1f5f9", fontWeight: 600, fontSize: "0.875rem" }}
          >
            {label}
          </p>
          {sublabel && (
            <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 2 }}>
              {sublabel}
            </p>
          )}
        </div>
      </div>
      <svg
        width="14"
        height="14"
        fill="none"
        stroke="#334155"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );

  return to ? (
    <Link
      to={to}
      onClick={onClick}
      className="block"
      style={{ textDecoration: "none" }}
    >
      {content}
    </Link>
  ) : (
    <button className="w-full text-left" onClick={onClick}>
      {content}
    </button>
  );
};

/* ══════════════════════════════════════════════
   MAIN SIDENAV
══════════════════════════════════════════════ */
const SideNav = ({ toggleMenu, setToggleMenu }) => {
  const { settings } = useSettings();
  const smartContractLink = settings?.smart_contract_link || "#";
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { wallets } = useWallets(user?.id);
  const menuRef = useRef(null);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(
    () => user?.balance_visible === 1 || user?.balance_visible === true,
  );

  const toggleSettingsPopup = () => setSettingsVisible((v) => !v);

  const closeAll = () => {
    setSettingsVisible(false);
    setToggleMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setToggleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setToggleMenu]);

  const toggleBalance = async () => {
    const newVal = !balanceVisible;
    setBalanceVisible(newVal);
    try {
      await axios.put(`${API_BASE_URL}/users/${user.id}/balance-visibility`, {
        balance_visible: newVal ? 1 : 0,
      });
      if (setUser)
        setUser((prev) => ({ ...prev, balance_visible: newVal ? 1 : 0 }));
    } catch {
      setBalanceVisible(!newVal);
    }
  };

  const totalBalance =
    wallets?.reduce(
      (sum, wallet) => sum + parseFloat(wallet.coin_amount || 0),
      0,
    ) ?? 0;

  const blurStyle = {
    filter: balanceVisible ? "blur(0px)" : "blur(7px)",
    transition: "filter 0.35s cubic-bezier(0.4,0,0.2,1)",
    userSelect: balanceVisible ? "text" : "none",
  };

  const DRAWER_BG = "#0a0a0f";
  const DRAWER_BORDER = "rgba(255,255,255,0.07)";
  const SECTION_LABEL = "#475569";
  const NAV_TEXT = "#cbd5e1";
  const NAV_HOVER_BG = "rgba(255,255,255,0.06)";
  const SHEET_BG = "#111118";

  return (
    <>
      {/* ── Main Drawer ── */}
      {toggleMenu && (
        <div className="fixed inset-0 z-[2016] flex">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setToggleMenu(false)}
          />

          <div
            ref={menuRef}
            className="relative w-[80%] max-w-sm h-full overflow-y-auto shadow-2xl flex flex-col"
            style={{
              zIndex: 2016,
              background: DRAWER_BG,
              borderRight: `1px solid ${DRAWER_BORDER}`,
            }}
          >
            {/* Header */}
            <div
              className="px-5 pt-6 pb-4"
              style={{ borderBottom: `1px solid ${DRAWER_BORDER}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h1
                  className="text-2xl font-black tracking-tight"
                  style={{
                    background: "linear-gradient(90deg,#a78bfa,#60a5fa)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {appName}
                </h1>
                <div
                  className="!text-white text-sm font-semibold px-3 py-1 rounded-full shadow"
                  style={{
                    background: "linear-gradient(90deg,#7c3aed,#6366f1)",
                  }}
                >
                  UID: {user?.uuid || "—"}
                </div>
              </div>

              {/* <p
                style={{
                  color: SECTION_LABEL,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                UID: {user?.uuid || "—"}
              </p> */}

              {/* Balance */}
              <div className="mt-4">
                <div className="flex items-center gap-1 mb-1">
                  <button
                    onClick={toggleBalance}
                    aria-label={
                      balanceVisible ? "Hide balance" : "Show balance"
                    }
                    className="flex items-center justify-center p-0 bg-transparent border-none cursor-pointer"
                    style={{ lineHeight: 1 }}
                  >
                    {balanceVisible ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>

                  <div
                    // to="/account"
                    // onClick={() => setToggleMenu(false)}
                    className="flex items-center gap-0.5"
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      style={{
                        color: "white",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                      }}
                    >
                      Main Wallet
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>

                <p
                  className="font-bold leading-none select-none flex items-center -ml-1"
                  style={{
                    fontSize: "1.1rem",
                    letterSpacing: "-0.03em",
                    color: "#f1f5f9",
                    ...blurStyle,
                  }}
                >
                  <BiDollar size={26} />
                  {totalBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Functions */}
            <div className="px-5 pt-5 pb-4 flex-1">
              <h2
                className="font-bold mb-3"
                style={{
                  color: SECTION_LABEL,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                }}
              >
                Functions
              </h2>

              <nav className="space-y-0.5">
                {navItems.map(
                  ({
                    label,
                    icon,
                    iconStyle,
                    iconBg,
                    to,
                    reactIcon,
                    reactIconStyle,
                  }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setToggleMenu(false)}
                      className="flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors"
                      style={{ textDecoration: "none" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = NAV_HOVER_BG)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <NavIcon
                        reactIcon={reactIcon}
                        reactIconStyle={reactIconStyle}
                        icon={icon}
                        iconStyle={iconStyle}
                        iconBg={iconBg}
                        alt={label}
                      />
                      <span
                        style={{
                          color: NAV_TEXT,
                          fontWeight: 500,
                          fontSize: "0.9rem",
                        }}
                      >
                        {label}
                      </span>
                    </Link>
                  ),
                )}

                {/* Settings */}
                <button
                  onClick={toggleSettingsPopup}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = NAV_HOVER_BG)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <NavIcon
                    icon="/assets/images/menu/settings.png"
                    iconBg="linear-gradient(135deg,#475569,#334155)"
                    alt="Settings"
                  />
                  <span
                    style={{
                      color: NAV_TEXT,
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    Settings
                  </span>
                </button>

                {/* Join Smart Contract */}
                <a
                  href={smartContractLink}
                  onClick={() => setToggleMenu(false)}
                  className="flex items-center gap-4 px-3 py-3 rounded-2xl transition-colors"
                  style={{ textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = NAV_HOVER_BG)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="white"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <span
                    style={{
                      color: NAV_TEXT,
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    }}
                  >
                    Join Smart Contract
                  </span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Bottom Sheet ── */}
      {settingsVisible && (
        <div className="fixed inset-0 z-[2018] flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
            }}
            onClick={toggleSettingsPopup}
          />
          <div
            className="relative rounded-t-3xl w-full max-w-md z-10 overflow-hidden pb-8"
            style={{
              background: SHEET_BG,
              border: `1px solid ${DRAWER_BORDER}`,
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "#1e293b" }}
              />
            </div>

            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: `1px solid ${DRAWER_BORDER}` }}
            >
              <h3
                style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem" }}
              >
                Settings
              </h3>
              <button
                onClick={toggleSettingsPopup}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div>
              <SettingsItem
                gradient="linear-gradient(135deg,#6366f1,#a855f7)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="7"
                      r="4"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                }
                label="Profile"
                sublabel="View & edit your profile"
                to="/profile"
                onClick={closeAll}
              />
              <SettingsItem
                gradient="linear-gradient(135deg,#7c3aed,#a855f7)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M7 11V7a5 5 0 0110 0v4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="16" r="1.5" fill="white" />
                  </svg>
                }
                label="Change Passcode"
                sublabel="Update your login passcode"
                onClick={() => {
                  closeAll();
                  navigate("/change-passcode");
                }}
              />
              <SettingsItem
                gradient="linear-gradient(135deg,#3b82f6,#6366f1)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M8 11V7a4 4 0 018 0v4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="16" r="1.5" fill="white" />
                  </svg>
                }
                label="2FA Security"
                sublabel="Google Authenticator setup"
                onClick={() => {
                  closeAll();
                  navigate("/two-factor-auth");
                }}
              />
              <SettingsItem
                gradient="linear-gradient(135deg,#10b981,#0d9488)"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 3H5a2 2 0 00-2 2v4M15 3h4a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4M15 21h4a2 2 0 002-2v-4"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="white"
                      strokeWidth="1.8"
                    />
                  </svg>
                }
                label="Face Verification"
                sublabel={
                  user?.face_image
                    ? "✓ Already submitted"
                    : "Verify your identity"
                }
                onClick={() => {
                  closeAll();
                  navigate("/face-verification");
                }}
              />
              {/* {user?.is_referral > 0 && (
                <>
                  <SettingsItem
                    gradient="linear-gradient(135deg,#f472b6,#ec4899)"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="9"
                          cy="7"
                          r="4"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <path
                          d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                    label="Referral List"
                    sublabel="People you referred"
                    to="/referral-list"
                    onClick={closeAll}
                  />
                  <SettingsItem
                    gradient="linear-gradient(135deg,#f59e0b,#f97316)"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 6v6l4 2"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    }
                    label="Referral History"
                    sublabel="Your bonus earnings"
                    to="/referral-history"
                    onClick={closeAll}
                  />
                </>
              )} */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideNav;
