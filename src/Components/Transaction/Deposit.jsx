import React, { useState, useEffect } from "react";
import imgNoData from "../../Assets/images/img_nodata.png";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import iconMenuArrow from "../../Assets/images/icon_menu_arrow.svg";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";

const Deposit = ({ openTransactionHistory }) => {
  const [deposits, setDeposits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { setLoading, user } = useUser();
  const { socket } = useSocketContext();
  const [refreshDeposit, setRefreshDeposit] = useState(false);

  const itemsPerPage = 10;

  const getFormattedDeliveryTime = (createdAt) => {
    const date = new Date(createdAt);

    // Convert date to local time string
    const localDateTime = date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return localDateTime.replace(",", "");
  };

  useEffect(() => {
    setLoading(true);
    if (user?.id) {
      async function fetchMarketData() {
        try {
          const response = await fetch(
            `${API_BASE_URL}/deposits/user/${user?.id}`,
          );
          const data = await response.json();
          if (response.status !== 404) {
            setDeposits(data);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching market data:", error);
          setLoading(false);
        }
      }
      fetchMarketData();
      if (refreshDeposit) {
        fetchMarketData();
      }
    }
  }, [setLoading, user, refreshDeposit]);

  // Filter deposits based on search term (coin symbol)
  const filteredDeposits = deposits.filter((order) =>
    order?.coin_symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const currentDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Handlers for pagination and search
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  useEffect(() => {
    const handleUpdateDeposit = (data) => {
      if (data?.deposit.status === "approved") {
        toast.success("Deposit accepted");
      } else {
        toast.error("Deposit rejected");
      }
      if (
        data?.deposit.status === "approved" ||
        data?.deposit.status === "rejected"
      ) {
        setRefreshDeposit(!refreshDeposit);
      }
    };

    socket?.on("updateDeposit", handleUpdateDeposit);

    return () => socket?.off("updateDeposit", handleUpdateDeposit);
  }, [socket, setRefreshDeposit, refreshDeposit]);

  return (
    <div id="profit-active_order">
      <div className="main_container">
        <div className="main_content">
          <div className="title title-transaction">
            <div className="left">
              <span className="left_icon"></span>
              <span>Deposit</span>
            </div>
          </div>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="border-2 px-4 py-2 rounded-md"
            />
          </div>
          <div>
            {currentDeposits.length <= 0 ? (
              <div
                className="no_data_content ff_NunitoSemiBold"
                style={{ minHeight: "calc(-260px + 100vh)" }}
              >
                <img src={imgNoData} alt="No Data" className="img_no_data" />
                <div>No Data</div>
              </div>
            ) : (
              <div className="profit-history">
                {currentDeposits.map((order) => {
                  return (
                    <div
                      className="profit-content profit-content-pop"
                      key={order.id}
                      onClick={() => openTransactionHistory(order)}
                    >
                      <div className="profit-details">
                        <div className="profit-coin-details">
                          <img
                            className="coin-symbol"
                            src={`/assets/images/coins/${order?.coin_symbol.toLowerCase()}-logo.png`}
                            alt={order.coin_name}
                          />
                          <span className="coin-name ff_NunitoSemiBold">
                            {order.coin_symbol} Wallet
                          </span>
                          <span className="profit-date ff_NunitoRegular">
                            {getFormattedDeliveryTime(order.created_at)}
                          </span>
                        </div>
                        <div className="profit-details-amount">
                          <div className="flex gap-5 items-center">
                            <span className="text-[15px]">
                              Amount: {parseFloat(order?.amount).toFixed(2)}
                            </span>
                            <span className="text-[15px]">{order?.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="profit-icon">
                        <img src={iconMenuArrow} alt="Details" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {currentDeposits.length > 0 && (
            <div className="flex justify-center items-center mt-10 gap-5">
              <span
                className="bg-white text-black "
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <SlArrowLeft size={15} />
              </span>
              <span className="mb-1">
                Page {currentPage} of {totalPages}
              </span>
              <span
                className="bg-white text-black"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <SlArrowRight size={15} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;
