import { useState } from "react";
// import { useState, useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { withRouter } from "react-router-dom";

import ResizeDetector from "react-resize-detector";
import { useAuth } from "../../contexts/AuthContext";

import AppMain from "../../components/AppMain/AppMain";
import AppHeader from "../../components/AppHeader/AppHeader";
import AppSidebar from "../../components/AppSidebar/AppSidebar";
import { ToastContainer } from "react-toastify";
import { Application } from "react-rainbow-components";
import { rainbowDarkTheme, rainbowWhiteTheme } from "../../utils/colors";

type Props = {
  colorScheme: string;
  enableFixedHeader: boolean;
  enableFixedSidebar: boolean;
  enableFixedFooter: boolean;
  enableClosedSidebar: boolean;
  closedSmallerSidebar: boolean;
  enableMobileMenu: boolean;
  enableLoginPage: boolean;
};
const Main = ({
  colorScheme,
  enableFixedHeader,
  enableFixedSidebar,
  enableFixedFooter,
  enableClosedSidebar,
  closedSmallerSidebar,
  enableMobileMenu,
}: Props) => {
  const { displayContent, isDarkMode } = useAuth();
  const [displayMobileSearch, setDisplayMobileSearch] = useState(false);
  return (
    <ResizeDetector
      handleWidth
      render={({ width }: any) => (
        <Application theme={isDarkMode ? rainbowDarkTheme : rainbowWhiteTheme}>
          <div
            className={cx(
              "app-container",
              { "app-theme-white": !isDarkMode },
              { "app-theme-dark": isDarkMode },
              { "fixed-header": enableFixedHeader },
              { "fixed-sidebar": enableFixedSidebar || width < 1250 },
              { "fixed-footer": enableFixedFooter },
              { "closed-sidebar": enableClosedSidebar || width < 1250 },
              {
                "closed-sidebar-mobile": closedSmallerSidebar || width < 1250,
              },
              { "sidebar-mobile-open": enableMobileMenu }
            )}
          >
            {/* Header of the application */}
            {displayContent ? (
              <AppHeader
                isMobileView={closedSmallerSidebar || width < 1250}
                setDisplayMobileSearch={setDisplayMobileSearch}
                displayMobileSearch={displayMobileSearch}
              />
            ) : null}
            {/* Main container of the application */}
            <div className={cx({ "app-main": displayContent })}>
              {displayContent ? <AppSidebar /> : null}
              {/* Content of the page */}
              <AppMain />
            </div>
            <ToastContainer
              theme={isDarkMode ? "dark" : "light"}
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Application>
      )}
    />
  );
};

const mapStateToProp = (state: any) => ({
  colorScheme: state.ThemeOptions.colorScheme,
  enableLoginPage: state.ThemeOptions.enableLoginPage,
  enableFixedHeader: state.ThemeOptions.enableFixedHeader,
  closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableFixedFooter: state.ThemeOptions.enableFixedFooter,
  enableFixedSidebar: state.ThemeOptions.enableFixedSidebar,
  enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
  enablePageTabsAlt: state.ThemeOptions.enablePageTabsAlt,
});

export default withRouter(connect(mapStateToProp)(Main));
