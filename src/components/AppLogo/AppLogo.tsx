import { useState } from "react";
// @ts-ignore
import Hamburger from "react-hamburgers";

import AppMobileMenu from "../AppMobileMenu/AppMobileMenu";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  isMobileView?: boolean;
  displayMobileSearch: boolean;
  setDisplayMobileSearch: Function;
};
const AppLogo = ({ isMobileView = false, displayMobileSearch, setDisplayMobileSearch }: Props) => {
  const { enableClosedSidebar, setEnableClosedSidebar } = useAuth();
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

export default AppLogo;
