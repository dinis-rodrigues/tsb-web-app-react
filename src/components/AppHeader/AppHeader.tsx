import React, { Fragment } from "react";
import cx from "classnames";

import { connect } from "react-redux";

// import { TransitionGroup, CSSTransition } from "react-transition-group";

import AppLogo from "../AppLogo/AppLogo";

import SearchBox from "./SearchBox";
import UserBox from "./UserBox";

type Props = {
  enableMobileMenuSmall: boolean;
  displayMobileSearch: boolean;
  setDisplayMobileSearch: Function;
};

const Header = ({
  enableMobileMenuSmall,
  displayMobileSearch,
  setDisplayMobileSearch,
}: Props) => {
  return (
    <div className="app-header header-shadow">
      <Fragment>
        <AppLogo
          displayMobileSearch={displayMobileSearch}
          setDisplayMobileSearch={setDisplayMobileSearch}
        />

        <div
          className={cx("app-header__content", {
            "header-mobile-open": displayMobileSearch,
          })}
        >
          <div className="app-header-left">
            <SearchBox />
          </div>
          <div className="app-header-right">
            <UserBox />
          </div>
        </div>
      </Fragment>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

export default connect(mapStateToProps)(Header);
