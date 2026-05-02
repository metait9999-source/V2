import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../api/getApiURL";
import numberFormat from "../utils/numberFormat";
import { Link } from "react-router-dom";
import Chart from "../Chart/chart";
import { useUser } from "../../context/UserContext";

const forexImages = require.context(
  "../../Assets/images/coins",
  false,
  /\.(png|jpe?g|svg)$/,
);

const getImagePath = (symbol) => {
  try {
    return forexImages(`./${symbol.toLowerCase()}-logo.png`);
  } catch {
    return "/assets/images/default-forex-logo.png";
  }
};

const TopMarket = () => {
  const [forexMarkets, setForexMarkets] = useState([]);
  const [wallet, setWallet] = useState(null);
  const { setLoading } = useUser();

  useEffect(() => {
    setLoading(true);
    const fetchForexMarkets = async () => {
      const response = await fetch(`${API_BASE_URL}/market/forex`);
      const data = await response.json();
      if (data) {
        setForexMarkets(data);
        setLoading(false);
      }
    };
    const fetchWallet = async () => {
      setWallet({ id: 1, coin_symbol: "ETH", status: "active" });
    };
    fetchForexMarkets();
    fetchWallet();
  }, [setLoading]);

  return (
    <div className="flex flex-col">
      {forexMarkets.map((fx, index) => {
        const meta = fx.response[0].meta;
        const symbol = meta.symbol.replace("=X", "");
        const imagePath = getImagePath(symbol);
        const marketPrice = meta.regularMarketPrice;
        const priceChange = marketPrice - meta.previousClose;
        const isPositive = priceChange >= 0;

        return (
          <Link
            key={index}
            to={`/business?coin=${symbol}&type=forex`}
            className="flex items-center justify-between py-3 gap-2 no-underline"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* coin info */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              style={{ width: "32vw" }}
            >
              <img
                src={imagePath}
                alt={`${symbol} Logo`}
                className="rounded-full object-contain flex-shrink-0"
                style={{ width: "9vw", height: "9vw" }}
              />
              <div>
                <div
                  className="font-bold text-slate-100"
                  style={{ fontSize: "3.8vw" }}
                >
                  {symbol.replace(meta.currency, ` / ${meta.currency}`)}
                </div>
                <div
                  className="text-slate-500 mt-0.5"
                  style={{ fontSize: "3.2vw" }}
                >
                  {wallet ? `${wallet.coin_symbol} Wallet` : ""}
                </div>
              </div>
            </div>

            {/* chart */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                className="w-full"
                style={{
                  height: 56,
                  userSelect: "none",
                  WebkitTapHighlightColor: "rgba(0,0,0,0)",
                }}
              >
                <Chart
                  one={meta.regularMarketDayHigh}
                  four={meta.regularMarketDayLow}
                  seven={meta.regularMarketPrice}
                />
              </div>
            </div>

            {/* price + change */}
            <div className="flex-shrink-0 text-right" style={{ width: "28vw" }}>
              <div
                className="font-bold text-slate-100"
                style={{ fontSize: "3.8vw" }}
              >
                ${marketPrice}
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "3.2vw",
                    color: isPositive ? "rgb(19,178,111)" : "rgb(207,32,47)",
                  }}
                >
                  {numberFormat(priceChange, 5)}
                </span>
                <span className="text-slate-500" style={{ fontSize: "2.8vw" }}>
                  24 Hrs
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default TopMarket;
