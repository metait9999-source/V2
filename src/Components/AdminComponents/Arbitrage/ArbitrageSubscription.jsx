import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { getSubscriptionsAdmin } from "../../../api/arbitrage.api";

const ArbitrageSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionsAdmin();
      setSubscriptions(res.data);
    } catch (err) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === filter);

  const statusStyle = {
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-500",
    cancelled: "bg-red-100 text-red-500",
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Subscriptions</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            All user arbitrage subscriptions
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 text-gray-600"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {["active", "completed", "cancelled"].map((s) => (
          <div key={s} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 capitalize mb-1">{s}</p>
            <p className="text-2xl font-bold text-gray-800">
              {subscriptions.filter((x) => x.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {["all", "active", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs rounded-lg capitalize font-medium transition ${
              filter === f
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No subscriptions found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Package
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Coin
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Rate
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Earned
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  End Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">
                      {sub.user_name || "—"}
                    </p>
                    <p className="text-xs text-gray-400">{sub.user_uuid}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {sub.package_name}
                    <span className="ml-1 text-xs text-gray-400">
                      ({sub.duration_days}d)
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-700">
                    {sub.coin_id}
                  </td>
                  <td className="px-5 py-3 text-gray-800 font-medium">
                    {Number(sub.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-indigo-600 font-medium">
                    {sub.daily_rate}%
                  </td>
                  <td className="px-5 py-3 text-green-600 font-medium">
                    +{Number(sub.total_earned).toFixed(4)}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {format(new Date(sub.end_date), "dd MMM yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusStyle[sub.status]
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArbitrageSubscriptions;
