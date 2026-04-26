import React, { useState } from "react";
import Header from "../Header/Header";
import { MdNotificationsNone, MdMailOutline } from "react-icons/md";
import { RiNotification3Line } from "react-icons/ri";

const mockUserWallet = true;

const tabs = [
  { key: "Notice", label: "Notice", icon: MdNotificationsNone },
  { key: "Message", label: "Message", icon: MdMailOutline },
];

const EmptyState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 gap-5">
    {/* Decorative ring */}
    <div className="relative">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center shadow-inner">
        <RiNotification3Line size={38} className="text-indigo-300" />
      </div>
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-100 border-2 border-white" />
      <span className="absolute bottom-1 -left-2 w-3 h-3 rounded-full bg-violet-200 border-2 border-white" />
    </div>
    <div className="text-center">
      <p className="text-[15px] font-bold text-gray-700 mb-1">
        {type === "Notice" ? "No Notifications Yet" : "No Messages Yet"}
      </p>
      <p className="text-[12.5px] text-gray-400 leading-relaxed max-w-[200px]">
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
        <div className="min-h-screen bg-gray-50">
          <Header pageTitle="Notification" />

          {/* Tab switcher */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-4 pt-4 pb-0">
            <div className="flex gap-1 max-w-md mx-auto">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-[13.5px] font-semibold rounded-t-xl transition-all duration-200 focus:outline-none
                    ${
                      activeTab === key
                        ? "text-indigo-600 bg-indigo-50/60"
                        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Icon size={17} />
                  {label}
                  {/* Active underline */}
                  <span
                    className={`absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full transition-all duration-300 ${
                      activeTab === key
                        ? "bg-indigo-500 opacity-100"
                        : "opacity-0"
                    }`}
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
                className={`transition-all duration-200 ${
                  activeTab === key
                    ? "opacity-100 translate-y-0"
                    : "hidden opacity-0 translate-y-2"
                }`}
              >
                {/* Content card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 overflow-hidden">
                  {/* Card header strip */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider">
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
