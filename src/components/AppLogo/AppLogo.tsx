import React, { Fragment, useState } from "react";
import { connect } from "react-redux";
// @ts-ignore
import Hamburger from "react-hamburgers";

import AppMobileMenu from "../AppMobileMenu/AppMobileMenu";

import {
  setEnableClosedSidebar,
  setEnableMobileMenu,
  setEnableMobileMenuSmall,
} from "../../reducers/ThemeOptions";

type Props = {
  enableClosedSidebar: boolean;
  setEnableClosedSidebar: Function;
};
const HeaderLogo = ({ enableClosedSidebar, setEnableClosedSidebar }: Props) => {
  const [active, setActive] = useState(false);

  const hamburgerClick = () => {
    setActive(!active);
    // console.log("ham click", active);
  };

  // const state = {
  //   openLeft: false,
  //   openRight: false,
  //   relativeWidth: false,
  //   width: 280,
  //   noTouchOpen: false,
  //   noTouchClose: false,
  // };

  const toggleEnableClosedSidebar = () => {
    setEnableClosedSidebar(!enableClosedSidebar);
    // console.log(enableClosedSidebar);
  };
  return (
    <Fragment>
      <div className="app-header__logo">
        <div className="logo-src" />
        <div className="header__pane ml-auto">
          <div onClick={toggleEnableClosedSidebar}>
            <Hamburger
              active={enableClosedSidebar}
              type="elastic"
              onClick={hamburgerClick}
            />
          </div>
        </div>
      </div>
      <AppMobileMenu />
    </Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setEnableClosedSidebar: (enable: boolean) =>
    dispatch(setEnableClosedSidebar(enable)),
  setEnableMobileMenu: (enable: boolean) =>
    dispatch(setEnableMobileMenu(enable)),
  setEnableMobileMenuSmall: (enable: boolean) =>
    dispatch(setEnableMobileMenuSmall(enable)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HeaderLogo);
