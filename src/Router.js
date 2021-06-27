import React from "react";
import { Switch, Route } from "react-router-dom";

import SignIn from "./components/@Auth";
import PrivacyPolicy from "./components/@Auth/PrivacyPolicy";
import Landing from "./components/@Landing";
import LayoutWrapper from "./components/layout/Wrapper";
import Me from "./components/@Sign/@Me";
import All from "./components/@Sign/@All";
import Settings from "./components/@Settings";
import Docs from "./components/@Docs";
import { FRONTEND_URL } from "./helpers/constant";
import Request from "./components/@Sign/@Request";
import Sign from "./components/@Sign/@Sign";

const Router = () => {
  return (
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
      <Route render={() => <Sign />} path={FRONTEND_URL.signing} exact />
      <Route
        render={() => (
          <LayoutWrapper>
            <Landing />
          </LayoutWrapper>
        )}
        path={FRONTEND_URL.sign}
        exact
      />
      <Route
        render={() => (
          <LayoutWrapper>
            <Settings />
          </LayoutWrapper>
        )}
        path={FRONTEND_URL.settings}
        exact
      />
      <Route
        render={() => (
          <LayoutWrapper>
            <Docs />
          </LayoutWrapper>
        )}
        path={FRONTEND_URL.docs}
        exact
      />
    </Switch>
  );
};

export default Router;
