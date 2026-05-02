import React, { useState } from "react";
import Header from "../Header/Header";
import { MdNotificationsNone, MdMailOutline } from "react-icons/md";
import { RiNotification3Line } from "react-icons/ri";

const DARK_BG = "#0a0a0f";
const DARK_CARD = "rgba(255,255,255,0.04)";
const DARK_CARD2 = "#111118";
const DARK_BORDER = "rgba(255,255,255,0.07)";
const DARK_BORDER2 = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#64748b";
const ACCENT = "#7c3aed";

const mockUserWallet = true;

const tabs = [
  { key: "Notice", label: "Notice", icon: MdNotificationsNone },
  { key: "Message", label: "Message", icon: MdMailOutline },
];

const EmptyState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 gap-5">
    {/* Decorative ring */}
    <div className="relative">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(124,58,237,0.12)",
          border: `1px solid rgba(124,58,237,0.2)`,
        }}
      >
        <RiNotification3Line size={38} style={{ color: "#a78bfa" }} />
      </div>
      <span
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full"
        style={{
          background: "rgba(124,58,237,0.2)",
          border: `2px solid ${DARK_BG}`,
        }}
      />
      <span
        className="absolute bottom-1 -left-2 w-3 h-3 rounded-full"
        style={{
          background: "rgba(168,85,247,0.25)",
          border: `2px solid ${DARK_BG}`,
        }}
      />
    </div>

    <div className="text-center">
      <p
        className="font-bold mb-1"
        style={{ fontSize: "4vw", color: TEXT_PRIMARY }}
      >
        {type === "Notice" ? "No Notifications Yet" : "No Messages Yet"}
      </p>
      <p
        className="leading-relaxed"
        style={{ fontSize: "3.2vw", color: TEXT_MUTED, maxWidth: 200 }}
      >
        {type === "Notice"
          ? "You're all caught up! New notices will appear here."
          : "Your inbox is empty. Messages will show up here."}
      </p>
    </div>
  </div>
);

const Notification = () => {
  const [activeTab, setActiveTab] = useState("Notice");

  return (
    <>
      {mockUserWallet && (
        <div className="min-h-screen" style={{ background: DARK_BG }}>
          <Header pageTitle="Notification" />

          {/* Tab switcher */}
          <div
            className="sticky top-0 z-10 px-4 pt-4 pb-0"
            style={{
              background: DARK_CARD2,
              borderBottom: `1px solid ${DARK_BORDER}`,
            }}
          >
            <div className="flex gap-1 max-w-md mx-auto">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-xl transition-all duration-200 focus:outline-none font-semibold"
                  style={{
                    fontSize: "3.5vw",
                    border: "none",
                    background:
                      activeTab === key
                        ? "rgba(124,58,237,0.12)"
                        : "transparent",
                    color: activeTab === key ? "#a78bfa" : TEXT_MUTED,
                  }}
                >
                  <Icon size={17} />
                  {label}
                  {/* Active underline */}
                  <span
                    className="absolute bottom-0 left-3 right-3 rounded-full transition-all duration-300"
                    style={{
                      height: 2.5,
                      background: activeTab === key ? ACCENT : "transparent",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="max-w-md mx-auto px-4 pt-2">
            {tabs.map(({ key }) => (
              <div
                key={key}
                className={`transition-all duration-200 ${activeTab === key ? "opacity-100 translate-y-0" : "hidden opacity-0 translate-y-2"}`}
              >
                <div
                  className="rounded-2xl overflow-hidden mt-4"
                  style={{
                    background: DARK_CARD,
                    border: `1px solid ${DARK_BORDER}`,
                  }}
                >
                  {/* Card header strip */}
                  <div
                    className="flex items-center gap-2 px-4 py-3"
                    style={{ borderBottom: `1px solid ${DARK_BORDER2}` }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#a78bfa" }}
                    />
                    <span
                      className="font-semibold uppercase tracking-wider"
                      style={{ fontSize: "3vw", color: TEXT_MUTED }}
                    >
                      {key === "Notice" ? "Recent Notices" : "Inbox"}
                    </span>
                  </div>

                  <EmptyState type={key} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Notification;
