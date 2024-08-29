import NavigationBar from "../AppNav/NavigationBar";

import PerfectScrollbar from "react-perfect-scrollbar";
// import AppLogo from "../AppLogo/AppLogo";

const AppSidebar = () => {
  return (
    <>
      <div className="sidebar-mobile-overlay"></div>
      <div className="app-sidebar sidebar-shadow">
        <PerfectScrollbar>
          <div className="app-sidebar__inner">
            <NavigationBar />
          </div>
        </PerfectScrollbar>
      </div>
    </>
  );
};

export default AppSidebar;
