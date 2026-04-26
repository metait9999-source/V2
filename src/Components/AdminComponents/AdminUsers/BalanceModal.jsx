import React, { useEffect, useState } from "react";
import useWallets from "../../../hooks/useWallets";
import useCryptoTradeConverter from "../../../hooks/userCryptoTradeConverter";
import { useUpdateUserBalance } from "../../../hooks/useUpdateUserBalance";
import { IoClose } from "react-icons/io5";
import { MdOutlineAccountBalanceWallet } from "react-icons/md";
import { FiEdit2, FiCheck } from "react-icons/fi";

const BalanceModal = ({ isOpen, onClose, details }) => {
  const { wallets } = useWallets(details?.id);
  const [coinValues, setCoinValues] = useState({});
  const { convertCoinToUSDT, convertUSDTToCoin, loading } =
    useCryptoTradeConverter();
  const { updateUserBalance } = useUpdateUserBalance();
  const [editingCoinId, setEditingCoinId] = useState(null);
  const [newCoinAmount, setNewCoinAmount] = useState("");

  useEffect(() => {
    const fetchConvertedValues = async () => {
      if (wallets?.length > 0) {
        const newCoinValues = {};
        for (const wallet of wallets) {
          try {
            const converted = await convertUSDTToCoin(
              wallet?.coin_amount,
              wallet.coin_id,
            );
            newCoinValues[wallet.coin_id] = converted;
          } catch {
            newCoinValues[wallet.coin_id] = null;
          }
        }
        setCoinValues(newCoinValues);
      }
    };
    fetchConvertedValues();
  }, [wallets]);

  const handleSave = async (coinId) => {
    try {
      const convertedUSDT = await convertCoinToUSDT(newCoinAmount, coinId);
      await updateUserBalance(details?.id, coinId, convertedUSDT);
      setCoinValues((prev) => ({ ...prev, [coinId]: newCoinAmount }));
      setEditingCoinId(null);
    } catch {
      console.error("Error updating balance");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdOutlineAccountBalanceWallet size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Balance Details
              </h2>
              <p className="text-[11px] text-gray-400">UID: {details?.uuid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-200 transition-all"
          >
            <IoClose size={17} />
          </button>
        </div>

        {/* Wallet address */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            Wallet Address
          </p>
          <p className="text-[12.5px] font-mono text-gray-700 break-all">
            {details?.user_wallet}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-[400px] p-5">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    "Logo",
                    "Name",
                    "Symbol",
                    "Balance",
                    "Total Deposit",
                    "Total Withdraw",
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
                {wallets?.map((wallet) => (
                  <tr
                    key={wallet.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={`/assets/images/coins/${wallet.coin_symbol?.toLowerCase()}-logo.png`}
                          alt={wallet.coin_symbol}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {wallet?.coin_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {wallet?.coin_symbol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {loading ? (
                        <span className="text-gray-400 text-[12px]">
                          Loading…
                        </span>
                      ) : editingCoinId === wallet.coin_id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={newCoinAmount}
                            onChange={(e) => setNewCoinAmount(e.target.value)}
                            onBlur={() => handleSave(wallet.coin_id)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSave(wallet.coin_id)
                            }
                            className="w-24 px-2 py-1 text-[12px] border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSave(wallet.coin_id)}
                            className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors flex-shrink-0"
                          >
                            <FiCheck size={11} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCoinId(wallet.coin_id);
                            setNewCoinAmount(coinValues[wallet.coin_id] ?? "");
                          }}
                          className="flex items-center gap-1.5 text-[12px] text-gray-700 hover:text-indigo-600 group"
                        >
                          <span>
                            {coinValues[wallet.coin_id] ?? "N/A"}{" "}
                            {wallet.coin_symbol}
                          </span>
                          <FiEdit2
                            size={11}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500"
                          />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {wallet?.total_deposits}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {wallet?.total_withdrawals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;
