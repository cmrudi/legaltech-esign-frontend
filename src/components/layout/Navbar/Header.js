import React from "react";
import { Link } from "react-router-dom";
import { FRONTEND_URL } from "../../../helpers/constant";

import logoUrl from "../../../assets/bnw/Company Logo@2x.png";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const Header = ({ auth, t, signOut }) => {
  // const [open, setOpen] = useState(false);
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

  return (
    <div className="navbar-wrapper">
      <div className="nav-area">
        <div className="">
          <Link to={FRONTEND_URL.base} className="profileLink">
            <img className="logo" src={logoUrl} alt="" />
          </Link>
        </div>

        <div className="item-center super-pt-2">
          <div className="item-center super-pt-1">
            <div>
              <strong>
                {auth?.docCreated} {t("header.signReq")}
              </strong>
              <br />
              <span>{t("header.thisMonth")}</span>
            </div>
            <div>
              <button className="logout-button">{t("header.upgrade")}</button>
            </div>
          </div>
          <div
            className="item-center super-pt-1 last-nav-child"
            onMouseLeave={() => toggleDropdown(!true)}
            onClick={() =>
              toggleDropdown(dropdownSelector.style.display === "none")
            }
            onMouseOver={() => toggleDropdown(true)}
          >
            <img className="rounded-img" src={auth?.picture} alt="" />
            <div>{auth?.fullname}</div>

            <div className="dropright">
              <div
                className="dropdown-toggle"
                type="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <ChevronRightIcon />
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
            {/* <div>
              <HelpSvg />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
