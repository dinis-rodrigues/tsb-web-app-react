import cx from "classnames";
import { useState } from "react";

import { useResizeDetector } from "react-resize-detector";
import { useAuth } from "../../contexts/AuthContext";

import { Application } from "react-rainbow-components";
import { ToastContainer } from "react-toastify";
import AppHeader from "../../components/AppHeader/AppHeader";
import AppMain from "../../components/AppMain/AppMain";
import AppSidebar from "../../components/AppSidebar/AppSidebar";
import { rainbowDarkTheme, rainbowWhiteTheme } from "../../utils/colors";

const Main = () => {
  const { displayContent, isDarkMode, enableFixedSidebar, enableMobileMenu, enableClosedSidebar } =
    useAuth();

  const [displayMobileSearch, setDisplayMobileSearch] = useState(false);
  const { width, ref } = useResizeDetector();

  return (
    <Application theme={isDarkMode ? rainbowDarkTheme : rainbowWhiteTheme}>
      <div
        ref={ref}
        className={cx(
          "app-container fixed-footer fixed-header",
          { "app-theme-white": !isDarkMode },
          { "app-theme-dark": isDarkMode },
          { "fixed-sidebar": enableFixedSidebar || width! < 1250 },
          { "closed-sidebar": enableClosedSidebar || width! < 1250 },
          {
            "closed-sidebar-mobile": width! < 1250,
          },
          { "sidebar-mobile-open": enableMobileMenu },
        )}
      >
        {/* Header of the application */}
        {displayContent ? (
          <AppHeader
            isMobileView={width! < 1250}
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
  );
};

export default Main;
