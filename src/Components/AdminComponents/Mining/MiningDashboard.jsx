import React, { useState } from "react";
import MiningPackages from "./MiningPackages";
import MiningSubscriptions from "./MiningSubscription";

const TABS = [
  { key: "packages", label: "Packages" },
  { key: "subscriptions", label: "Subscriptions" },
];

const MiningDashboard = () => {
  const [activeTab, setActiveTab] = useState("packages");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Mining</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          Manage mining machine packages and subscriptions
        </p>
      </div>
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max md:min-w-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        {activeTab === "packages" && <MiningPackages />}
        {activeTab === "subscriptions" && <MiningSubscriptions />}
      </div>
    </div>
  );
};

export default MiningDashboard;
