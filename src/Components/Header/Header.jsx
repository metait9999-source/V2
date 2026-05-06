import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "./SideNav/SideNav";

const Header = ({ pageTitle, fallbackPath = "/" }) => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const [backPressed, setBackPressed] = useState(false);
  const navigate = useNavigate();

  const goBack = () => {
    setBackPressed(true);
    setTimeout(() => setBackPressed(false), 400);
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <>
      <style>{`
        @keyframes ripple-back {
          0%   { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes arrow-slide {
          0%   { transform: translateX(0); opacity: 1; }
          40%  { transform: translateX(-6px); opacity: 0; }
          41%  { transform: translateX(6px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .back-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(99,102,241,0.12));
          border: 1px solid rgba(124,58,237,0.30);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        }
        .back-btn:hover {
          border-color: rgba(167,139,250,0.55);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12), 0 4px 16px rgba(124,58,237,0.25);
          transform: translateY(-1px);
        }
        .back-btn:active {
          transform: scale(0.93);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.2);
        }
        .back-btn .ripple {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(167,139,250,0.35);
          top: 0; left: 0;
          transform: scale(0);
          pointer-events: none;
        }
        .back-btn.pressed .ripple {
          animation: ripple-back 0.4s ease-out forwards;
        }
        .back-btn.pressed .back-arrow-icon {
          animation: arrow-slide 0.4s ease forwards;
        }
        .back-arrow-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        /* Subtle left-facing arrow with a tail */
        .back-arrow-svg {
          filter: drop-shadow(0 0 4px rgba(167,139,250,0.6));
        }
      `}</style>

      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          background: "#0a0a0f",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button
          onClick={goBack}
          className={`back-btn${backPressed ? " pressed" : ""}`}
          aria-label="Go back"
        >
          <span className="ripple" />

          <span className="back-arrow-icon">
            <svg
              className="back-arrow-svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5"
                stroke="#c4b5fd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M11 6l-6 6 6 6"
                stroke="#a78bfa"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        <span
          className="font-semibold truncate mx-3 flex-1 text-center"
          style={{ color: "#f1f5f9", fontSize: "4.2vw" }}
        >
          {pageTitle || ""}
        </span>

        <button
          onClick={() => setToggleMenu((prev) => !prev)}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <img
            src="/assets/images/icon_menu_b.svg"
            alt="Menu"
            className="brightness-0 invert"
            style={{ width: "22px", height: "22px" }}
          />
        </button>
      </div>

      <SideNav toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />
    </>
  );
};

export default Header;
