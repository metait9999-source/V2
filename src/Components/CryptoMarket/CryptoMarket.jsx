import React, { useState, useEffect } from "react";
import Chart from "../Chart/chart";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

function CryptoMarket() {
  const [marketData, setMarketData] = useState([]);
  const { setLoading } = useUser();
  const cryptoURL =
    "https://api.coinlore.net/api/ticker/?id=90,2679,2,257,80,1,89,2713,2321,58,48543,118,2710,54683,44883,33422,2751,45219,48563,47305,111341,33718,48569,121619,32607,93845,135601,46183,121593,2741,46018,12377,42441,33830,70497,121613,46561,36447,33644,32360,33536,34406,46981";

  useEffect(() => {
    setLoading(true);
    async function fetchMarketData() {
      try {
        const response = await fetch(cryptoURL);
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

  return (
    <div className="flex flex-col">
      {marketData.map((coin) => {
        const isPositive = Number(coin.percent_change_24h) >= 0;
        return (
          <Link
            key={coin.id}
            to={`/business?coin=${coin.id}&type=crypto`}
            className="flex items-center justify-between py-3 gap-2 no-underline"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* coin info */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              style={{ width: "28vw" }}
            >
              <img
                src={`/assets/images/coins/${coin.symbol.toLowerCase()}-logo.png`}
                alt={`${coin.symbol} Logo`}
                className="rounded-full object-contain flex-shrink-0 bg-white"
                style={{ width: "9vw", height: "9vw" }}
              />
              <div>
                <div
                  className="font-bold text-slate-100"
                  style={{ fontSize: "3.8vw" }}
                >
                  {coin.symbol}
                </div>
                <div
                  className="text-slate-500 mt-0.5"
                  style={{ fontSize: "3.2vw" }}
                >
                  USDT
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
                  color={isPositive ? "#10b981" : "#ef4444"}
                  one={coin?.percent_change_1h}
                  four={coin?.percent_change_24h}
                  seven={coin?.percent_change_7d}
                />
              </div>
            </div>

            {/* price + change */}
            <div className="flex-shrink-0 text-right" style={{ width: "25vw" }}>
              <div
                className="font-bold text-slate-100"
                style={{ fontSize: "3.8vw" }}
              >
                ${parseFloat(coin.price_usd).toFixed(3)}
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "3.2vw",
                    color: isPositive ? "rgb(19,178,111)" : "rgb(207,32,47)",
                  }}
                >
                  {coin.percent_change_24h}%
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
}

export default CryptoMarket;
