import React from "react";

const ArbitragePayouts = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          Payout Info
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          Daily payouts are handled automatically by the cron job
        </p>
      </div>

      {/* Cron info card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="#6366f1"
                strokeWidth="1.5"
              />
              <path
                d="M10 6v4l2.5 2.5"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">
              Runs daily at 00:00
            </p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              The cron job automatically processes all active subscriptions due
              for payout every day at midnight. No manual action is required.
            </p>
          </div>
        </div>
      </div>

      {/* Flow cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Step 1</p>
          <p className="font-semibold text-gray-700 text-sm">
            Find due subscriptions
          </p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Fetches all active subscriptions not yet paid today
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Step 2</p>
          <p className="font-semibold text-gray-700 text-sm">
            Credit daily interest
          </p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            Adds interest (amount × daily rate) to user balance
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Step 3</p>
          <p className="font-semibold text-gray-700 text-sm">
            Return principal
          </p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            On the final day, original amount is returned to user balance
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArbitragePayouts;
