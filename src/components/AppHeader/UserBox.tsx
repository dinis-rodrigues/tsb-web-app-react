import { Link, useNavigate } from "react-router-dom";

import { DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from "reactstrap";

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAuth } from "../../contexts/AuthContext";
import { isFeatureVisible } from "../../utils/generalFunctions";
import ImageContainer from "../AppImage/ImageContainer";
import DarkModeToggle from "./DarkModeToggle";
import UserNotifications from "./UserNotifications";

const UserBox = () => {
  const {
    USER,
    logoutUser,
    applicationSettings,
    setCurrentUser,
    isDarkMode,
    setIsDarkMode,
    applicationFeatures,
    isAdminUser,
    isGod,
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logoutUser(setCurrentUser)
      .then(() => {
        navigate("/login");
      })
      .catch((error: string) => {});
  };
  return (
    <>
      {applicationSettings.maintenanceIsOpen && (
        <div className="badge badge-danger ml-2">Under Maintenance</div>
      )}
      {/* Left Content */}
      <div className="dropdown">
        <div className="header-dots">
          <UserNotifications />
          {isFeatureVisible("darkTheme", applicationFeatures, isAdminUser, isGod) && (
            <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          )}
        </div>
      </div>
      {/* Notifications */}

      {/* Right Content */}
      <div className="header-btn-lg pr-0">
        <div className="widget-content p-0">
          <div className="widget-content-wrapper">
            <div className="widget-content-left">
              {/* User Info */}
              <UncontrolledButtonDropdown>
                <DropdownToggle color="btn" className="p-0">
                  <ImageContainer
                    width={42}
                    classNames={"rounded-circle"}
                    imageSrc={USER!.usrImgComp}
                  />
                  <FontAwesomeIcon className="ml-2 opacity-8" icon={faAngleDown} />
                </DropdownToggle>
                <DropdownMenu
                  end
                  className="rm-pointers dropdown-menu-lg"
                  style={{
                    paddingBottom: "10px",
                  }}
                >
                  <div className="grid-menu grid-menu-2col">
                    <div className="no-gutters row">
                      <div className="col-md-6">
                        <Link to="/profile" style={{ textDecoration: "none" }}>
                          <button
                            type="button"
                            className="btn-icon-vertical btn-transition btn-transition-alt pt-2 pb-2 btn btn-outline-info"
                          >
                            <i className="fas fa-user-alt icon-gradient bg-malibu-beach btn-icon-wrapper mb-2 "></i>
                            <b>Profile</b>
                          </button>
                        </Link>
                      </div>
                      <div className="col-md-6">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="btn-icon-vertical btn-transition btn-transition-alt pt-2 pb-2 btn btn-outline-danger"
                        >
                          <i className="fas fa-door-open icon-gradient bg-love-kiss btn-icon-wrapper mb-2"></i>
                          <b>Logout</b>
                        </button>
                      </div>
                    </div>
                  </div>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            </div>
            <div className="widget-content-left  ml-3 header-user-info">
              <div className="widget-heading">{USER && USER.name}</div>
              <div className="widget-subheading">{USER && USER.department}</div>
            </div>

            {/* <div className="widget-content-right header-user-info ml-3">
              <Button
                className="btn-shadow p-1"
                size="sm"
                onClick={notify2}
                color="info"
                id="Tooltip-1"
              >
                <FontAwesomeIcon className="mr-2 ml-2" icon={faCalendarAlt} />
              </Button>
              <UncontrolledTooltip placement="left" target={"Tooltip-1"}>
                Click for Toastify Notifications!
              </UncontrolledTooltip>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
