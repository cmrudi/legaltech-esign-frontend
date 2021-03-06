import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
// import { ReactComponent as HomeSvg } from "../../../assets/bnw/Home Icon.svg";
import { FRONTEND_URL } from "../../../../helpers/constant";
// import { ReactComponent as HelpSvg } from "../../../assets/bnw/Help Icon.svg";

import "./stepper.scss";
import ClearRoundedIcon from "@material-ui/icons/ClearRounded";
import { useAuth } from "contexts/AuthContext";

const Stepper = ({ items, activeItemId, isFixed }) => {
  const history = useHistory();
  const { auth, signOut } = useAuth();
  const { t } = useTranslation();
  const dropdownSelector = document.querySelector(
    ".dropdown-menu.nav-dropdown"
  );
  const toggleDropdown = (bool) => {
    const dropdownSelector = document.querySelector(
      ".dropdown-menu.nav-dropdown"
    );
    if (bool) dropdownSelector.style.display = "block";
    else dropdownSelector.style.display = "none";
  };

  const renderSteppers = () =>
    items?.map((datum, i) => (
      <span
        key={datum?.name}
        className={`item-center ${i <= activeItemId ? "" : "disabled"}`}
      >
        {i !== 0 && <strong className="px-2 lead">➔</strong>}
        <div className={`px-2`}>{datum?.icon}</div>
        <div>{datum.name}</div>
      </span>
    ));

  return (
    <div className={`stepper-container ${isFixed ? "position-fixed" : ""}`}>
      <div className="back cursor-pointer">
        <ClearRoundedIcon onClick={() => history.push(FRONTEND_URL.sign)} />
      </div>
      <div className="item-center">{renderSteppers()}</div>
      <div className="item-center">
        <div className="dropright">
          <div
            className="dropdown-toggle aaaaaaaa"
            type="button"
            onMouseLeave={() => toggleDropdown(!true)}
            onClick={() =>
              toggleDropdown(dropdownSelector.style.display === "none")
            }
            onMouseOver={() => toggleDropdown(true)}
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <img className="rounded-img" src={auth?.picture} alt="" />
          </div>
          <div className="dropdown-menu nav-dropdown">
            <Link className="dropdown-item" to={FRONTEND_URL.settings}>
              {t("header.myProfile")}
            </Link>
            <div className="dropdown-item" onClick={signOut}>
              {t("header.signOut")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
