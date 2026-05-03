import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";

const PermissionToggle = ({
  userId,
  permissionId,
  permissionName,
  initialHasPermission,
}) => {
  const [hasPermission, setHasPermission] = useState(initialHasPermission);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/permissions/toggle`, {
        userId,
        permissionId,
      });
      setHasPermission((prev) => !prev);
    } catch {
      console.error("Error toggling permission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
      <span className="text-[13.5px] font-medium text-gray-700">
        {permissionName}
      </span>

      <button
        onClick={handleToggle}
        disabled={loading}
        aria-label={`Toggle ${permissionName}`}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none
          ${hasPermission ? "bg-indigo-600" : "bg-gray-300"}
          ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300
            ${hasPermission ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
};

export default PermissionToggle;
