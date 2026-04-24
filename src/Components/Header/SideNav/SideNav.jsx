import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
// import { SiConvertio } from "react-icons/si";
import useSettings from "../../../hooks/useSettings";
import { FaWallet } from "react-icons/fa";

const appName = "Metaverse";

// Nav menu items config
const navItems = [
  { label: "Trade", icon: "/assets/images/menu/transaction.png", to: "/" },
  {
    label: "Arbitrage",
    icon: "/assets/images/menu/accounts.png",
    to: "/arbitrage",
  },
  { label: "Mining", icon: "/assets/images/menu/profits.png", to: "/mining" },
  {
    label: "Leverage",
    icon: "/assets/images/menu/transaction.png",
    to: "/leverage",
  },
  {
    label: "Help Loan",
    icon: "/assets/images/menu/users.svg",
    to: "/loan-landing",
  },
  {
    label: "Platform Activities",
    icon: "/assets/images/menu/money-bag.svg",
    to: "/activities",
  },
  {
    label: "Profit Statistics",
    icon: "/assets/images/menu/profits.png",
    to: "/profit-stat",
  },
];

const SideNav = (props) => {
  const { settings } = useSettings();
  const smartContractLink = settings?.smart_contract_link || "#";
  const { toggleMenu, setToggleMenu } = props;
  // const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { user } = useUser();
  const menuRef = useRef(null);
  // const navigate = useNavigate();

  // const toggleKnowledgeCollapse = () =>
  //   setKnowledgeExpanded(!knowledgeExpanded);
  const toggleSettingsPopup = () => setSettingsVisible(!settingsVisible);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setToggleMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setToggleMenu]);

  return (
    <>
      {toggleMenu && (
        <div className="fixed inset-0 z-[2016] flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setToggleMenu(false)}
          />

          {/* Drawer */}
          <div
            ref={menuRef}
            className="relative w-[80%] max-w-sm h-full bg-white overflow-y-auto shadow-2xl flex flex-col"
            style={{ zIndex: 2016 }}
          >
            {/* Header */}
            <div className="px-5 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {appName}
                </h1>
                {/* Credit badge */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
                  Credit: {user?.credit || 600}
                </div>
              </div>
              <p className="text-gray-400 text-sm font-medium">
                UID: {user?.uuid || "89396"}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                {/* Wallet button */}
                <Link
                  to={"/account"}
                  className="flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all duration-150"
                  // onClick={() => navigate("/account")}
                >
                  <FaWallet />
                  Wallet
                </Link>

                {/* Join Smart Contract button */}
                <a
                  href={smartContractLink}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-500 text-purple-600 font-semibold py-2.5 px-4 rounded-xl hover:bg-purple-50 active:scale-95 transition-all duration-150"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-sm">Join smart contract</span>
                </a>
              </div>
            </div>

            {/* Functions */}
            <div className="px-5 pt-5 pb-4 flex-1">
              <h2 className="text-base font-bold text-gray-900 mb-3">
                Functions
              </h2>

              <nav className="space-y-1">
                {navItems.map(({ label, icon, to }) => (
                  <Link
                    key={label}
                    to={to}
                    onClick={() => setToggleMenu(false)}
                    className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <img
                        src={icon}
                        alt={label}
                        className="w-5 h-5 object-contain brightness-0 invert"
                      />
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                      {label}
                    </span>
                  </Link>
                ))}

                {/* Knowledge Base (collapsible) */}
                {/* <div>
                  <button
                    onClick={toggleKnowledgeCollapse}
                    className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <img
                        src="/assets/images/menu/knowledge.png"
                        alt="Knowledge"
                        className="w-5 h-5 object-contain brightness-0 invert"
                      />
                    </div>
                    <span className="flex-1 text-left text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                      Knowledge Base Module
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${knowledgeExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {knowledgeExpanded && (
                    <div className="ml-14 mt-1 space-y-1 border-l-2 border-purple-100 pl-3">
                      <Link
                        to="/"
                        className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        Trading
                      </Link>
                      <Link
                        to="/contact-us"
                        className="block py-2 px-3 text-sm text-gray-600 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        Contact us
                      </Link>
                    </div>
                  )}
                </div> */}

                {/* Chat */}
                <Link
                  to="/contact-us"
                  onClick={() => setToggleMenu(false)}
                  className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <img
                      src="/assets/images/menu/chat.png"
                      alt="Chat"
                      className="w-5 h-5 object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                    Chat
                  </span>
                </Link>

                {/* Settings */}
                <button
                  onClick={toggleSettingsPopup}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-purple-50 active:bg-purple-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                    <img
                      src="/assets/images/menu/settings.png"
                      alt="Settings"
                      className="w-5 h-5 object-contain brightness-0 invert"
                    />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-purple-700 transition-colors">
                    Settings
                  </span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Settings Popup */}
      {settingsVisible && (
        <div className="fixed inset-0 z-[2018] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleSettingsPopup}
            style={{ zIndex: 2017 }}
          />
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm overflow-hidden"
            style={{ zIndex: 2018 }}
          >
            {/* Settings Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Set up</h3>
              <button
                onClick={toggleSettingsPopup}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
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

            {/* Settings Items */}
            {/* <div className="divide-y divide-gray-50">
              <SettingsItem
                icon="/assets/images/menu/profile.svg"
                label="Profile"
                to="/profile"
                onClick={toggleSettingsPopup}
              />

              {user?.isReferral > 0 && (
                <>
                  <SettingsItem
                    icon="/assets/images/menu/users.svg"
                    label="Referral List"
                    to="/referral-list"
                    onClick={toggleSettingsPopup}
                  />
                  <SettingsItem
                    icon="/assets/images/menu/money-bag.svg"
                    label="Referral History"
                    to="/referral-history"
                    onClick={toggleSettingsPopup}
                  />
                </>
              )}

              <SettingsItem
                icon="/assets/images/icon_set_menu_2.svg"
                label="Notification"
              />
              <SettingsItem
                icon="/assets/images/icon_set_menu_4.svg"
                label="English"
                showArrow={false}
              />
              <SettingsItem
                icon="/assets/images/icon_delete.svg"
                label="Clear cache"
              />
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

// Settings item helper component
// const SettingsItem = ({ icon, label, to, onClick, showArrow = true }) => {
//   const content = (
//     <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
//       <div className="flex items-center gap-3">
//         <img src={icon} alt={label} className="w-6 h-6 object-contain" />
//         <span className="text-gray-700 font-medium text-sm">{label}</span>
//       </div>
//       {showArrow && (
//         <svg
//           className="w-4 h-4 text-gray-400"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//         </svg>
//       )}
//     </div>
//   );

//   return to ? (
//     <Link to={to} onClick={onClick}>
//       {content}
//     </Link>
//   ) : (
//     <div>{content}</div>
//   );
// };

export default SideNav;
