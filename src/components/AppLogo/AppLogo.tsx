import { useState } from "react";
// @ts-ignore
import Hamburger from "react-hamburgers";
import { connect } from "react-redux";

import AppMobileMenu from "../AppMobileMenu/AppMobileMenu";

import { NavLink } from "react-router-dom";
import {
  setEnableClosedSidebar,
  setEnableMobileMenu,
  setEnableMobileMenuSmall,
} from "../../reducers/ThemeOptions";

type Props = {
  isMobileView?: boolean;
  enableClosedSidebar: boolean;
  displayMobileSearch: boolean;
  setEnableClosedSidebar: Function;
  setDisplayMobileSearch: Function;
};
const AppLogo = ({
  isMobileView = false,
  enableClosedSidebar,
  setEnableClosedSidebar,
  displayMobileSearch,
  setDisplayMobileSearch,
}: Props) => {
  const [active, setActive] = useState(false);

  const hamburgerClick = () => {
    toggleEnableClosedSidebar();
    setActive(!active);
  };

  const toggleEnableClosedSidebar = () => {
    setEnableClosedSidebar(!enableClosedSidebar);
  };
  return (
    <>
      <NavLink className="app-header__logo" to={"/dashboard"}>
        {!isMobileView && (
          <Hamburger active={!enableClosedSidebar} type="slider" onClick={hamburgerClick} />
        )}
        <div className="logo-src ml-auto" />
      </NavLink>
      <AppMobileMenu
        displayMobileSearch={displayMobileSearch}
        setDisplayMobileSearch={setDisplayMobileSearch}
      />
    </>
  );
};

const mapStateToProps = (state: any) => ({
  enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setEnableClosedSidebar: (enable: boolean) => dispatch(setEnableClosedSidebar(enable)),
  setEnableMobileMenu: (enable: boolean) => dispatch(setEnableMobileMenu(enable)),
  setEnableMobileMenuSmall: (enable: boolean) => dispatch(setEnableMobileMenuSmall(enable)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLogo);
