import React, { useState } from "react";
import ArbitragePackages from "./ArbitragePackages";
import ArbitrageSubscriptions from "./ArbitrageSubscription";
import ArbitragePayouts from "./ArbitragePayouts";

const TABS = [
  { key: "packages", label: "Packages" },
  { key: "subscriptions", label: "Subscriptions" },
  { key: "payouts", label: "Payout Runner" },
];

const ArbitrageDashboard = () => {
  const [activeTab, setActiveTab] = useState("packages");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">Arbitrage</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage packages, monitor subscriptions, and run payouts
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
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

      {/* Content */}
      <div>
        {activeTab === "packages" && <ArbitragePackages />}
        {activeTab === "subscriptions" && <ArbitrageSubscriptions />}
        {activeTab === "payouts" && <ArbitragePayouts />}
      </div>
    </div>
  );
};

export default ArbitrageDashboard;
