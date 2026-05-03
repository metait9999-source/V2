import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api/getApiURL";
import PermissionToggle from "./PermissionToggle";
import { useUser } from "../../../context/UserContext";
import { IoClose } from "react-icons/io5";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

const PermissionModal = ({ isOpen, onClose, onUpdateSuccess, details }) => {
  const { setLoading: setLoader } = useUser();
  const [permissions, setPermissions] = useState([]);
  const [userPermissionIds, setUserPermissionIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !details?.id) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Both requests fire in parallel — only 2 API calls total
        const [allPermsRes, userPermsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/permissions`),
          axios.get(`${API_BASE_URL}/permissions/user/${details.id}`),
        ]);

        setPermissions(allPermsRes.data);
        setUserPermissionIds(
          new Set(userPermsRes.data.permissions.map((p) => p.permissionId)),
        );
      } catch {
        console.error("Error fetching permissions");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [isOpen, details?.id]);

  useEffect(() => {
    setLoader(loading);
  }, [loading, setLoader]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdOutlineAdminPanelSettings size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Admin Permissions
              </h2>
              <p className="text-[11px] text-gray-400">{details?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* Permissions list */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-[13px]">
              Loading permissions…
            </div>
          ) : permissions.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-[13px]">
              No permissions found.
            </div>
          ) : (
            permissions.map((permission) => (
              <PermissionToggle
                key={permission.id}
                userId={details?.id}
                permissionName={permission.label}
                permissionId={permission.id}
                initialHasPermission={userPermissionIds.has(permission.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionModal;
