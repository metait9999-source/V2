import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import useCryptoTradeConverter from "../../hooks/userCryptoTradeConverter";
import useWallets from "../../hooks/useWallets";
import { useUser } from "../../context/UserContext";
import { useUpdateUserBalance } from "../../hooks/useUpdateUserBalance";
import toast from "react-hot-toast";

const Converter = () => {
  const { user } = useUser();
  const { wallets, setWallets } = useWallets(user?.id);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { convertUSDTToCoin } = useCryptoTradeConverter();
  const [coinPopupVisible, setCoinPopupVisible] = useState(false);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const { updateUserBalance } = useUpdateUserBalance();
  const [coinValues, setCoinValues] = useState({});
  const [convertAmount, setConvertAmount] = useState("");
  const [filterWallets, setFilterWallets] = useState([]);
  const [filterWalletSelect, setFilterWalletsSelect] = useState(null);

  useEffect(() => {
    const filteredWallets = wallets.filter(
      (wallet) => wallet.coin_id !== selectedWallet?.coin_id,
    );
    setFilterWallets(filteredWallets);
    setFilterWalletsSelect(filteredWallets[0]);
  }, [wallets, selectedWallet]);

  const defaultCoin = {
    coin_name: "Bitcoin",
    coin_symbol: "BTC",
    coin_amount: "loading..",
    coin_logo: "/assets/images/coins/btc-logo.png",
  };

  const handlePopupCoin = () => {
    setCoinPopupVisible(!coinPopupVisible);
  };
  const handleFilterCoin = () => {
    setFilterPopupVisible(!filterPopupVisible);
  };

  const handleSelectCoin = (item) => {
    setSelectedWallet(item);

    handlePopupCoin();
  };
  const handleSelectFilter = (item) => {
    setFilterWalletsSelect(item);

    handleFilterCoin();
  };

  const handleMaxChange = (e) => {
    if (e.target.name === "amount") {
      setConvertAmount(e.target.value);
    }
  };

  const handleSubmit = async () => {
    const walletAmount = parseFloat(selectedWallet.coin_amount);
    if (parseFloat(convertAmount) > parseFloat(walletAmount)) {
      toast.error("Convert amount can not grater than balance.");
      return;
    }

    const new_balance = parseFloat(walletAmount) - parseFloat(convertAmount);
    const newUSDT =
      parseFloat(filterWalletSelect?.coin_amount) + parseFloat(convertAmount);

    if (convertAmount) {
      await updateUserBalance(user.id, selectedWallet.coin_id, new_balance);
      await updateUserBalance(user.id, filterWalletSelect.coin_id, newUSDT);
      // Update the specific wallet directly in the state
      const updatedWallets = wallets.map((wallet) => {
        if (wallet.coin_id === selectedWallet.coin_id) {
          return { ...wallet, coin_amount: new_balance };
        } else if (wallet.coin_id === filterWalletSelect) {
          return { ...wallet, coin_amount: newUSDT };
        }
        return wallet;
      });

      setWallets(updatedWallets);

      // Keep the selected wallet the same, just update its balance
      setSelectedWallet({
        ...selectedWallet,
        coin_amount: new_balance,
      });
      setConvertAmount("");
      toast.success("Balance updated successfully");
    } else {
      toast.error("You don't have enough balance.");
    }
  };

  useEffect(() => {
    if (user && wallets) {
      setSelectedWallet(wallets[0]);
    }

    const fetchConvertedValues = async () => {
      if (wallets?.length > 0) {
        const newCoinValues = {};

        for (const wallet of wallets) {
          try {
            const convertedCoin = await convertUSDTToCoin(
              wallet?.coin_amount,
              wallet.coin_id,
            );
            newCoinValues[wallet.coin_id] = convertedCoin;
          } catch (error) {
            console.error("Error converting coin:", error);
            newCoinValues[wallet.coin_id] = null; // Handle conversion error
          }
        }

        setCoinValues(newCoinValues);
      }
    };

    fetchConvertedValues();
  }, [wallets, user]);

  return (
    <div>
      <Header pageTitle="Converter" />
      <div className="">
        <div className=""></div>
        <div
          className="ssb-popup--round ssb-popup--bottom"
          style={{ width: "100%" }}
        >
          <div id="dealBox" className="deal-wrapper">
            <div className="deal">
              <div className="deal_pro_info">
                <div className="base_info">
                  <img
                    src={
                      `/assets/images/coins/${selectedWallet?.coin_symbol.toLowerCase()}-logo.png` ||
                      defaultCoin.coin_logo
                    }
                    className="pro_icon"
                    alt={selectedWallet?.coin_symbol || ""}
                  />
                  <div className="pro_name">
                    <div className="coin_name">
                      {selectedWallet?.coin_name || defaultCoin?.coin_name}
                    </div>
                    <div>
                      <span>
                        {selectedWallet?.coin_symbol ||
                          defaultCoin?.coin_symbol}{" "}
                        Coin:{" "}
                      </span>
                      <span className="fc-13B26F ff_NunitoSemiBold order_position">
                        {coinValues[selectedWallet?.coin_id] ||
                          defaultCoin.coin_amount}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="font-bold mt-1">
                  <h1>Coin balance in USDT</h1>
                  <h1>{selectedWallet?.coin_amount} USDT</h1>
                </div>
              </div>

              <div className="coin_select">
                <div className="flex">
                  <div className="select_title fs-16 fc-353F52 ff_NunitoSemiBold flex1">
                    From coin
                  </div>
                </div>
                <div className="coin_select_container">
                  <div
                    className="coin_select_content cursor-pointer"
                    onClick={handlePopupCoin}
                  >
                    <div className="value">
                      <img
                        src={
                          `/assets/images/coins/${selectedWallet?.coin_symbol.toLowerCase()}-logo.png` ||
                          defaultCoin.coin_logo
                        }
                        className="icon_time"
                        alt={
                          selectedWallet?.coin_symbol || defaultCoin.coin_logo
                        }
                      />
                      <span id="delivery_time">
                        {selectedWallet?.coin_symbol || defaultCoin.coin_symbol}
                      </span>
                    </div>
                    <img
                      src="/assets/images/icon_arrow_down.svg"
                      className="icon_arrow"
                      alt="Arrow"
                    />
                  </div>

                  <div className="amount_input">
                    <input
                      onChange={handleMaxChange}
                      type="number"
                      inputMode="numeric"
                      name="amount"
                      id="amount"
                      value={convertAmount}
                      placeholder="type usdt amount"
                    />
                    <span
                      className="all"
                      onClick={() =>
                        setConvertAmount(selectedWallet?.coin_amount)
                      }
                    >
                      Max
                    </span>
                  </div>
                </div>
              </div>

              <div className="time_select">
                <div className="select_title fs-16 fc-353F52 ff_NunitoSemiBold">
                  To coin
                </div>
                <div
                  className="time_select_container"
                  style={{ display: "block" }}
                >
                  <div
                    className="time_select_content"
                    onClick={handleFilterCoin}
                  >
                    <div className="value">
                      <img
                        src={
                          `/assets/images/coins/${filterWalletSelect?.coin_symbol.toLowerCase()}-logo.png` ||
                          defaultCoin.coin_logo
                        }
                        className="icon_time"
                        alt={
                          filterWalletSelect?.coin_symbol ||
                          defaultCoin.coin_logo
                        }
                      />
                      <span id="delivery_time">
                        {filterWalletSelect?.coin_symbol ||
                          defaultCoin.coin_symbol}
                      </span>
                    </div>
                    <img
                      src="/assets/images/icon_arrow_down.svg"
                      className="icon_arrow"
                      alt="Arrow"
                    />
                  </div>
                </div>
              </div>

              <div className="submit_container">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="submit fs-18 ff_NunitoBold"
                  style={{
                    backgroundColor: "rgb(19, 178, 111)",
                    lineHeight: 0,
                  }}
                >
                  Convert
                </button>
              </div>

              {/* Coin Popup */}
              {coinPopupVisible && (
                <div id="select_coin_popup">
                  <div className="ssb-overlay" style={{ zIndex: 2023 }}></div>
                  <div
                    className="select_popup ssb-popup ssb-popup--round ssb-popup--bottom"
                    style={{ zIndex: 2024, height: "auto" }}
                  >
                    <div className="range_title">
                      <img
                        src="/assets/images/icon_close.svg"
                        className="icon_close cursor-pointer"
                        alt="Close"
                        onClick={handlePopupCoin}
                      />
                    </div>
                    <div className="coin_list">
                      {wallets.map((wallet, index) => {
                        return (
                          <div className="coin_item" key={index}>
                            <div
                              className="name cursor-pointer"
                              data-coin_logo={wallet.coin_logo}
                              data-coin_symbol={wallet.coin_symbol}
                              onClick={() => handleSelectCoin(wallet)}
                            >
                              <img
                                src={`/assets/images/coins/${wallet.coin_symbol.toLowerCase()}-logo.png`}
                                alt={wallet.coin_symbol}
                              />
                              <div
                                style={{ marginLeft: "5px" }}
                              >{` ${wallet.coin_symbol}`}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {filterPopupVisible && (
                <div id="select_coin_popup">
                  <div className="ssb-overlay" style={{ zIndex: 2023 }}></div>
                  <div
                    className="select_popup ssb-popup ssb-popup--round ssb-popup--bottom"
                    style={{ zIndex: 2024, height: "auto" }}
                  >
                    <div className="range_title">
                      <img
                        src="/assets/images/icon_close.svg"
                        className="icon_close cursor-pointer"
                        alt="Close"
                        onClick={handleFilterCoin}
                      />
                    </div>
                    <div className="coin_list">
                      {filterWallets.map((wallet, index) => {
                        return (
                          <div className="coin_item" key={index}>
                            <div
                              className="name cursor-pointer"
                              data-coin_logo={wallet.coin_logo}
                              data-coin_symbol={wallet.coin_symbol}
                              onClick={() => handleSelectFilter(wallet)}
                            >
                              <img
                                src={`/assets/images/coins/${wallet.coin_symbol.toLowerCase()}-logo.png`}
                                alt={wallet.coin_symbol}
                              />
                              <div
                                style={{ marginLeft: "5px" }}
                              >{` ${wallet.coin_symbol}`}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;
