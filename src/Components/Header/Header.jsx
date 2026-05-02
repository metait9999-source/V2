import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "./SideNav/SideNav";
import { IoMdArrowRoundBack } from "react-icons/io";

const Header = ({ pageTitle, fallbackPath = "/" }) => {
  const [toggleMenu, setToggleMenu] = useState(false);
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath, { replace: true });
    }
  };

  return (
    <>
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          background: "#0a0a0f",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Back button */}
        <button
          onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <IoMdArrowRoundBack color="white" size={25} />
        </button>

        {/* Title */}
        <span
          className="font-semibold truncate mx-3 flex-1 text-center"
          style={{ color: "#f1f5f9", fontSize: "4.2vw" }}
        >
          {pageTitle || ""}
        </span>

        {/* Menu button */}
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
