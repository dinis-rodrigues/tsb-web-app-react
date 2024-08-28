import cx from "classnames";

import { connect } from "react-redux";

import AppLogo from "../AppLogo/AppLogo";

import SearchBox from "./SearchBox";
import UserBox from "./UserBox";

type Props = {
  isMobileView?: boolean;
  enableMobileMenuSmall: boolean;
  displayMobileSearch: boolean;
  setDisplayMobileSearch: Function;
};

const Header = ({
  isMobileView = false,
  enableMobileMenuSmall,
  displayMobileSearch,
  setDisplayMobileSearch,
}: Props) => {
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

const mapStateToProps = (state: any) => ({
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

export default connect(mapStateToProps)(Header);
