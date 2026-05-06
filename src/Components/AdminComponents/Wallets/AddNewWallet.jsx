import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../api/getApiURL";
import { FaWallet } from "react-icons/fa";
import { FiSave, FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import { MdOutlineQrCode2 } from "react-icons/md";

const inputCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all";

const selectCls =
  "w-full px-3.5 py-2.5 text-[13.5px] bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 focus:bg-white transition-all appearance-none cursor-pointer";

const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const ImageUploadField = ({
  label,
  icon: Icon,
  previewSrc,
  inputName,
  accept = "image/*",
  required = false,
  onChange,
  onClear,
}) => (
  <FormField label={label}>
    {previewSrc ? (
      <div className="relative w-full rounded-xl border border-indigo-200 bg-indigo-50/30 overflow-hidden">
        <img
          src={previewSrc}
          alt={label}
          className="w-full h-36 object-contain p-2"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          aria-label="Remove image"
        >
          <FiX size={12} />
        </button>
        <p className="text-center text-[11px] text-indigo-500 font-medium pb-2">
          Click × to replace
        </p>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-2 w-full h-36 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 hover:text-indigo-400 transition-all">
        <Icon size={24} className="opacity-60" />
        <span className="text-[12px] font-medium">Click to upload</span>
        <span className="text-[11px] text-gray-300">PNG, JPG, WEBP</span>
        <input
          type="file"
          name={inputName}
          onChange={onChange}
          accept={accept}
          required={required}
          className="hidden"
        />
      </label>
    )}
  </FormField>
);

const AddNewWallet = () => {
  const coinAPI = "https://api.coinlore.net/api/tickers/?limit=50";
  const navigate = useNavigate();
  const [coinsData, setCoinsData] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [formData, setFormData] = useState({
    coin_id: "",
    coin_name: "",
    coin_logo: "",
    wallet_network: "",
    coin_symbol: "",
    wallet_address: "",
    wallet_qr: null,
  });

  useEffect(() => {
    const fetchCoinsData = async () => {
      try {
        const response = await fetch(coinAPI);
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCoinsData(data.data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchCoinsData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoinChange = (e) => {
    const { value } = e.target;
    const coin = coinsData.find((c) => c.id === value);
    if (!coin) return;
    setSelectedCoin(coin);

    // Auto-set logo preview from CoinLore CDN
    const cdnLogoUrl = `https://www.coinlore.com/img/${coin.nameid}.png`;
    setLogoPreview(cdnLogoUrl);

    setFormData((prev) => ({
      ...prev,
      coin_id: coin.id,
      coin_name: coin.name || "",
      coin_logo: cdnLogoUrl, // store CDN URL as default; overridden if user uploads a file
      wallet_network: coin.nameid,
      coin_symbol: coin.symbol,
      wallet_address: "",
      wallet_qr: null,
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, coin_logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleQrChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, wallet_qr: file }));
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append("coin_id", formData.coin_id);
      payload.append("coin_name", formData.coin_name);
      payload.append("wallet_network", formData.wallet_network);
      payload.append("coin_symbol", formData.coin_symbol);
      payload.append("wallet_address", formData.wallet_address);

      // coin_logo: file upload OR CDN URL string
      if (formData.coin_logo instanceof File) {
        payload.append("coin_logo", formData.coin_logo);
      } else if (formData.coin_logo) {
        payload.append("coin_logo", formData.coin_logo); // plain URL string
      }

      // wallet_qr: file upload only
      if (formData.wallet_qr instanceof File) {
        payload.append("wallet_qr", formData.wallet_qr);
      }

      await axios.post(`${API_BASE_URL}/wallets`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Wallet added successfully");
      navigate("/panel/wallets");
    } catch {
      toast.error("Failed to add wallet");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Page header ── */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate("/panel/wallets")}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <FiArrowLeft size={15} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 flex-shrink-0">
          <FaWallet size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-gray-900 font-bold text-[17px] leading-tight">
            Add New Wallet
          </h1>
          <p className="text-gray-400 text-[12px]">
            Configure a new crypto wallet
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden max-w-3xl">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <FaWallet size={15} className="text-indigo-500" />
          <h2 className="text-[14px] font-bold text-gray-900">
            Wallet Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Select Coin">
              <select
                value={selectedCoin?.id || ""}
                onChange={handleCoinChange}
                required
                className={selectCls}
              >
                <option value="" disabled>
                  Select a coin
                </option>
                {coinsData.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Coin Name">
              <input
                type="text"
                name="coin_name"
                value={formData.coin_name}
                onChange={handleChange}
                placeholder="e.g. Bitcoin"
                required
                className={inputCls}
              />
            </FormField>

            <FormField label="Coin Symbol">
              <input
                type="text"
                name="coin_symbol"
                value={formData.coin_symbol}
                onChange={handleChange}
                placeholder="e.g. BTC"
                required
                className={inputCls}
              />
            </FormField>

            <FormField label="Wallet Network">
              <input
                type="text"
                name="wallet_network"
                value={formData.wallet_network}
                onChange={handleChange}
                placeholder="e.g. ERC-20"
                required
                className={inputCls}
              />
            </FormField>

            <FormField label="Wallet Address">
              <input
                type="text"
                name="wallet_address"
                value={formData.wallet_address}
                onChange={handleChange}
                placeholder="Enter wallet address"
                required
                className={inputCls}
              />
            </FormField>

            {/* empty spacer */}
            <div className="hidden sm:block" />

            {/* Coin Logo — auto-filled from CDN, replaceable by upload */}
            <ImageUploadField
              label="Coin Logo"
              icon={FiUpload}
              previewSrc={logoPreview}
              inputName="coin_logo"
              onChange={handleLogoChange}
              onClear={() => {
                setLogoPreview(null);
                setFormData((p) => ({ ...p, coin_logo: "" }));
              }}
            />

            {/* Wallet QR Code */}
            <ImageUploadField
              label="Wallet QR Code"
              icon={MdOutlineQrCode2}
              previewSrc={qrPreview}
              inputName="wallet_qr" // ← renamed from "documents"
              accept="image/*"
              required
              onChange={handleQrChange}
              onClear={() => {
                setQrPreview(null);
                setFormData((p) => ({ ...p, wallet_qr: null }));
              }}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200"
            >
              <FiSave size={14} />
              Save Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewWallet;
