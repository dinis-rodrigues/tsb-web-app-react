import { useState } from "react";
// @ts-ignore
import Hamburger from "react-hamburgers";
import { connect } from "react-redux";

import cx from "classnames";

import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "reactstrap";

import { setEnableMobileMenu, setEnableMobileMenuSmall } from "../../reducers/ThemeOptions";

interface MobileState {
  active: boolean;
  activeMobile: boolean;
  activeSecondaryMenuMobile: boolean;
}
type Props = {
  enableMobileMenu: boolean;
  enableMobileMenuSmall: boolean;
  setEnableMobileMenu: Function;
  displayMobileSearch: boolean;
  setDisplayMobileSearch: Function;
};

const AppMobileMenu = ({
  enableMobileMenu,
  enableMobileMenuSmall,
  setEnableMobileMenu,
  displayMobileSearch,
  setDisplayMobileSearch,
}: Props) => {
  const [mobileState, setMobileState] = useState<MobileState>({
    active: false,
    activeMobile: false,
    activeSecondaryMenuMobile: false,
  });
  const toggleMobileSidebar = () => {
    setEnableMobileMenu(!enableMobileMenu);
    if (displayMobileSearch) {
      toggleMobileSmall();
    }
  };

  const toggleMobileSmall = () => {
    setDisplayMobileSearch(!displayMobileSearch);
    setMobileState({
      ...mobileState,
      activeSecondaryMenuMobile: !mobileState.activeSecondaryMenuMobile,
    });
    if (enableMobileMenu) {
      toggleMobileSidebar();
    }
  };
  return (
    <>
      <div className="app-header__mobile-menu">
        <div onClick={toggleMobileSidebar}>
          <Hamburger
            active={enableMobileMenu}
            type="elastic"
            onClick={() =>
              setMobileState({
                ...mobileState,
                activeMobile: !mobileState.activeMobile,
              })
            }
          />
        </div>
      </div>
      <div className="app-header__menu">
        <span>
          <Button
            size="sm"
            className={cx("btn-icon btn-icon-only", {
              active: mobileState.activeSecondaryMenuMobile,
            })}
            color="info"
            onClick={() => toggleMobileSmall()}
          >
            <div className="btn-icon-wrapper">
              <FontAwesomeIcon icon={faEllipsisV} />
            </div>
          </Button>
        </span>
      </div>
    </>
  );
};

const mapStateToProps = (state: any) => ({
  closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setEnableMobileMenu: (enable: boolean) => dispatch(setEnableMobileMenu(enable)),
  setEnableMobileMenuSmall: (enable: boolean) => dispatch(setEnableMobileMenuSmall(enable)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppMobileMenu);
