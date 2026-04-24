import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideNav from "./SideNav/SideNav";

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
      <div className="page-header">
        <img
          onClick={goBack}
          src="/assets/images/icon_back.svg"
          alt="Back"
          className="back"
          style={{ cursor: "pointer" }}
        />
        <span className="title over-line-1">{pageTitle || ""}</span>
        <img
          onClick={() => setToggleMenu((prev) => !prev)}
          id="menu-icon"
          src="/assets/images/icon_menu_b.svg"
          alt="Menu"
          className="menu_img"
          style={{ cursor: "pointer" }}
        />
      </div>

      <SideNav toggleMenu={toggleMenu} setToggleMenu={setToggleMenu} />
    </>
  );
};

export default Header;
