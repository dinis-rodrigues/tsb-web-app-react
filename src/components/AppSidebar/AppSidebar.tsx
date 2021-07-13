import { Fragment } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import Nav from "../AppNav/VerticalNavWrapper";

import PerfectScrollbar from "react-perfect-scrollbar";
import HeaderLogo from "../AppLogo/AppLogo";

import { setEnableMobileMenu } from "../../reducers/ThemeOptions";
type Props = {
  enableMobileMenu: boolean;
};
const AppSidebar = ({ enableMobileMenu }: Props) => {
  return (
    <Fragment>
      <div className="app-sidebar sidebar-shadow">
        <HeaderLogo />
        <div
          className={cx("app-header__content", {
            "header-mobile-open": enableMobileMenu,
          })}
        />
        <PerfectScrollbar>
          <div className="app-sidebar__inner">
            <Nav />
          </div>
        </PerfectScrollbar>
      </div>
    </Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setEnableMobileMenu: (enable: boolean) =>
    dispatch(setEnableMobileMenu(enable)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppSidebar);
