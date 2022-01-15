import React, { useMemo } from "react";
import { Switch, Route, useLocation } from "react-router-dom";

import SignIn from "./components/@Auth";
import PrivacyPolicy from "./components/@Auth/PrivacyPolicy";
import Landing from "./components/@Landing";
import LayoutWrapper from "./components/layout/Wrapper";
import Request from "./components/@Sign/@Request";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Navbar/Footer";
import Me from "./components/@Sign/@Me";
import All from "./components/@Sign/@All";
import Settings from "./components/@Settings";
import Docs from "./components/@Docs";
import { FRONTEND_URL } from "./helpers/constant";
import Document from "./components/@Sign/@Document";
import DocumentAuditTrail from "components/@Sign/@AuditTrail";

const Router = () => {
  const location = useLocation();
  const isYes = useMemo(() => {
    return !(
      location?.pathname === FRONTEND_URL.me ||
      location?.pathname === FRONTEND_URL.all ||
      location?.pathname === FRONTEND_URL.request ||
      String(location?.pathname).includes(FRONTEND_URL.document)
    );
  }, [location]);

  return (
    <>
      <div className="background-general">
        <Navbar />
        <Switch>
          <Route
            component={PrivacyPolicy}
            path={FRONTEND_URL.privacyPolicy}
            exact
          />
          <Route component={SignIn} path={FRONTEND_URL.login} exact />
          <Route render={() => <Me />} path={FRONTEND_URL.me} exact />
          <Route render={() => <All />} path={FRONTEND_URL.all} exact />
          <Route render={() => <Request />} path={FRONTEND_URL.request} exact />
          <Route
            render={() => <DocumentAuditTrail />}
            path={`${FRONTEND_URL.documentAuditTrail}/:fileUId`}
            exact
          />
          <Route
            render={() => <Document />}
            path={`${FRONTEND_URL.document}/:fileUId`}
            exact
          />
          <Route
            render={() => (
              <>
                <LayoutWrapper>
                  <Landing />
                </LayoutWrapper>
              </>
            )}
            path={FRONTEND_URL.sign}
            exact
          />
          <Route
            render={() => (
              <>
                <LayoutWrapper>
                  <Settings />
                </LayoutWrapper>
              </>
            )}
            path={FRONTEND_URL.settings}
            exact
          />
          <Route
            render={() => (
              <>
                <LayoutWrapper>
                  <Docs />
                </LayoutWrapper>
              </>
            )}
            path={FRONTEND_URL.docs}
            exact
          />
        </Switch>
      </div>
      {isYes && <Footer />}
    </>
  );
};

export default Router;
