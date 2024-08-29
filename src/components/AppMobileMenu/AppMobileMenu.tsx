import { useState } from "react";
// @ts-ignore
import Hamburger from "react-hamburgers";

import cx from "classnames";

import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "reactstrap";
import { useAuth } from "../../contexts/AuthContext";

interface MobileState {
  active: boolean;
  activeMobile: boolean;
  activeSecondaryMenuMobile: boolean;
}
type Props = {
  displayMobileSearch: boolean;
  setDisplayMobileSearch: Function;
};

const AppMobileMenu = ({ displayMobileSearch, setDisplayMobileSearch }: Props) => {
  const { enableMobileMenu, setEnableMobileMenu } = useAuth();
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

export default AppMobileMenu;
