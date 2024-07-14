import React from "react";
import img1 from "../header1.png";
import img2 from "../header2.png";
import img3 from "../header3.png";
import "./Header.css";

const Header = () => {
  return (
    <header>
      <div className="image-row">
        <img src={img1} alt="1" />
        <img src={img2} alt="2" />
        <img src={img3} alt="3" />
      </div>
    </header>
  );
};

export default Header;
