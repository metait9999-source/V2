import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../api/getApiURL";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteModal from "../DeleteModal/DeleteModal";
import { useUser } from "../../../context/UserContext";
import { FaWallet } from "react-icons/fa";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

const Wallets = () => {
  const [wallets, setWallets] = useState([]);
  const { setLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(null);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/wallets`);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setWallets(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletInfo();
  }, [setLoading]);

  const handleDelete = async (walletID) => {
    try {
      await axios.delete(`${API_BASE_URL}/wallets/${walletID}`);
      setWallets((prev) => prev.filter((w) => w.id !== walletID));
      toast.success("Wallet deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  const openModal = (walletID) => {
    setSelectedWalletId(walletID);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWalletId(null);
  };
  const confirmDelete = () => {
    if (selectedWalletId) handleDelete(selectedWalletId);
    closeModal();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
            <FaWallet size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
              Wallets
            </h1>
            <p className="text-gray-400 text-[12px]">
              {wallets.length} wallet{wallets.length !== 1 ? "s" : ""}{" "}
              configured
            </p>
          </div>
        </div>
        <Link to="/panel/new-wallet">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200">
            <FiPlus size={15} />
            Add New Wallet
          </button>
        </Link>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-[13px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "#",
                  "Symbol",
                  "Coin Name",
                  "Network",
                  "Address",
                  "QR Code",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {wallets.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No wallets found. Add one to get started.
                  </td>
                </tr>
              ) : (
                wallets.map((wallet, index) => (
                  <tr
                    key={wallet.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* # */}
                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Symbol */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {wallet?.coin_symbol}
                      </span>
                    </td>

                    {/* Coin Name */}
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {wallet?.coin_name}
                    </td>

                    {/* Network */}
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {wallet?.wallet_network}
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-[12px] text-gray-500">
                        {wallet.wallet_address.slice(0, 12)}…
                      </span>
                    </td>

                    {/* QR Code */}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img
                          src={`${API_BASE_URL}/${wallet?.wallet_qr}`}
                          className="w-full h-full object-cover"
                          alt="QR"
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border
                        ${
                          wallet.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${wallet.status === "active" ? "bg-emerald-500" : "bg-gray-400"}`}
                        />
                        {wallet.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link to="/panel/edit-wallet" state={{ wallet }}>
                          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors">
                            <FiEdit2 size={11} />
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => openModal(wallet.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Wallet"
        description="This action cannot be undone."
      />
    </div>
  );
};

export default Wallets;
