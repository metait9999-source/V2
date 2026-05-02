import React, { useState, useEffect } from "react";
import Chart from "../Chart/chart";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/getApiURL";
import getMetalCoinName from "../utils/getMetalCoinName";
import numberFormat from "../utils/numberFormat";
import { useUser } from "../../context/UserContext";

const MetalMarket = () => {
  const [marketData, setMarketData] = useState([]);
  const { setLoading } = useUser();

  useEffect(() => {
    setLoading(true);
    async function fetchMarketData() {
      try {
        const response = await fetch(`${API_BASE_URL}/market/metal`);
        const data = await response.json();
        setMarketData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setLoading(false);
      }
    }
    fetchMarketData();
  }, [setLoading]);

  const activeWallet = { coin_symbol: "ETH" };

  return (
    <div className="flex flex-col">
      {marketData.map((coin) => {
        const meta = coin?.response[0].meta;
        const price = meta.regularMarketPrice;
        const priceChange = price - meta.previousClose;
        const isPositive = priceChange >= 0;
        const symbolClean = coin?.symbol.split("=")[0].trim();

        return (
          <Link
            key={coin.symbol}
            to={`/business?coin=${symbolClean}&type=metal`}
            className="flex items-center justify-between py-3 gap-2 no-underline"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* coin info */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              style={{ width: "32vw" }}
            >
              <img
                src={`/assets/images/coins/${symbolClean.toLowerCase()}-logo.png`}
                alt={`${coin.symbol} Logo`}
                className="rounded-full object-contain flex-shrink-0"
                style={{ width: "9vw", height: "9vw" }}
              />
              <div>
                <div
                  className="font-bold text-slate-100"
                  style={{ fontSize: "3.8vw" }}
                >
                  {getMetalCoinName(symbolClean)}
                </div>
                <div
                  className="text-slate-500 mt-0.5"
                  style={{ fontSize: "3.2vw" }}
                >
                  {activeWallet.coin_symbol} Wallet
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
                <Chart one={1.3} seven={1.4} four={1.5} />
              </div>
            </div>

            {/* price + change */}
            <div className="flex-shrink-0 text-right" style={{ width: "28vw" }}>
              <div
                className="font-bold text-slate-100"
                style={{ fontSize: "3.8vw" }}
              >
                ${numberFormat(price, 3)}
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

export default MetalMarket;
