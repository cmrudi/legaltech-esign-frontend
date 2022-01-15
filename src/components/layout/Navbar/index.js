import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import "./navbar.scss";

import { useAuth } from "../../../contexts/AuthContext";
import { FRONTEND_URL } from "../../../helpers/constant";
import Header from "./Header";
import { isHeaderHighlighted, isPublicLink } from "../../../helpers/validator";

const Navbar = () => {
  const { auth, signOut } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (
      location?.pathname === FRONTEND_URL.realBase ||
      location?.pathname === ""
    )
      history.push(FRONTEND_URL.base);
  }, [location, history]);

  if (
    location?.pathname === FRONTEND_URL.login ||
    location?.pathname === `${FRONTEND_URL.login}/` ||
    isHeaderHighlighted(location?.pathname) ||
    isPublicLink(location?.pathname)
  )
    return <></>;

  return <Header auth={auth} t={t} signOut={signOut} />;
};
export default Navbar;
