import cx from "classnames";

import AppLogo from "../AppLogo/AppLogo";

import SearchBox from "./SearchBox";
import UserBox from "./UserBox";

type Props = {
  isMobileView?: boolean;
  displayMobileSearch: boolean;
  setDisplayMobileSearch: Function;
};

const Header = ({ isMobileView = false, displayMobileSearch, setDisplayMobileSearch }: Props) => {
  return (
    <div className="app-header header-shadow">
      <>
        <AppLogo
          isMobileView={isMobileView}
          displayMobileSearch={displayMobileSearch}
          setDisplayMobileSearch={setDisplayMobileSearch}
        />

        <div
          className={cx("app-header__content", {
            "header-mobile-open": displayMobileSearch,
          })}
          style={{
            overflow: "visible",
          }}
        >
          <div className="app-header-left">
            <SearchBox />
          </div>
          <div className="app-header-right">
            <UserBox />
          </div>
        </div>
      </>
    </div>
  );
};

export default Header;
