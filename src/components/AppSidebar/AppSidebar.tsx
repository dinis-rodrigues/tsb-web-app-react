import { Fragment } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import Nav from "../AppNav/VerticalNavWrapper";

import PerfectScrollbar from "react-perfect-scrollbar";
// import AppLogo from "../AppLogo/AppLogo";

import { setEnableMobileMenu } from "../../reducers/ThemeOptions";
type Props = {
  enableMobileMenu: boolean;
};
const AppSidebar = ({ enableMobileMenu }: Props) => {
  return (
    <Fragment>
      <div className="sidebar-mobile-overlay"></div>
      <div className="app-sidebar sidebar-shadow">
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
