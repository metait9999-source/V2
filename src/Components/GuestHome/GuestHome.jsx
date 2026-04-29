import React from "react";
import "./GuestHome.css";
import backGroundImg from "../../Assets/images/background.png";
import introImg from "../../Assets/images/phone.png";
import google_play from "../../Assets/images/google_play.png";
import appleLogo from "../../Assets/images/apple_store.png";
import trust from "../../Assets/images/trust.png";
import { IoMdCheckmark } from "react-icons/io";

const GuestHome = () => {
  return (
    <div>
      <div
        className="main"
        style={{
          backgroundImage: `url(${backGroundImg})`,
          backgroundPosition: "top",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="img-top">
          <a
            href="/"
            className="custom-logo-link"
            rel="home"
            aria-current="page"
          >
            <img
              width="56"
              height="56"
              src={trust}
              className="custom-logo"
              alt="MetaTrade"
              decoding="async"
            />
          </a>
          <div className="theme-title ">
            <span className="text-white">Trust Wallet</span>
          </div>
        </div>
        <div className="content-title ">
          <span>Get Trust Wallet</span>
        </div>
        <div className="content-subtitle">
          The easiest and most secure crypto wallet
        </div>
        <div className="intro_list">
          <div className="intro_item">
            <i className="icon_select dashicons dashicons-yes !text-white">
              <IoMdCheckmark size={20} />
            </i>
            <span className="">
              Store all your crypto and NFTs in one place
            </span>
          </div>
          <div className="intro_item">
            <i className="icon_select dashicons dashicons-yes !text-white">
              <IoMdCheckmark size={20} />
            </i>
            <span className="">
              Trade 500+ assets on DEXes and earn interest
            </span>
          </div>
          <div className="intro_item">
            <i className="icon_select dashicons dashicons-yes !text-white">
              <IoMdCheckmark size={20} />
            </i>
            <span className="">No Coinbase account required</span>
          </div>
        </div>

        <div className="intro_img">
          <img className="img_phone" src={introImg} alt="" />
        </div>

        <div className="download_actions">
          <a
            href="https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp&amp;hl=en"
            target="_blank"
            rel="noreferrer"
          >
            <img src={google_play} alt="" />
          </a>
          <a
            href="https://apps.apple.com/us/app/trust-crypto-bitcoin-wallet/"
            target="_blank"
            rel="noreferrer"
          >
            <img src={appleLogo} alt="" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default GuestHome;
