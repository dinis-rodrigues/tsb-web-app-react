import { Fragment } from "react";
import { Link } from "react-router-dom";

import {
  DropdownToggle,
  DropdownMenu,
  UncontrolledButtonDropdown,
} from "reactstrap";

import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import dinisAvatar from "../../assets/images/altcomp.png";

import { useAuth } from "../../contexts/AuthContext";
import { connect } from "react-redux";
import { setUserProfilePicture } from "../../reducers/ThemeOptions";
import { useHistory } from "react-router-dom";
import UserNotifications from "./UserNotifications";

type Props = {
  userProfilePicture: string;
};
const UserBox = ({ userProfilePicture }: Props) => {
  const { USER, logoutUser, applicationSettings, setCurrentUser } = useAuth();
  const history = useHistory();
  const handleLogout = () => {
    logoutUser(setCurrentUser)
      .then(() => {
        history.push("/login");
      })
      .catch((error: string) => {
        // console.log("error", error);
      });
  };

  return (
    <Fragment>
      {applicationSettings.maintenanceIsOpen && (
        <div className="badge badge-danger ml-2">Under Maintenance</div>
      )}
      {/* Left Content */}
      <div className="dropdown">
        <div className="header-dots">
          <UserNotifications />
          {/* <span className="icon-wrapper icon-wrapper-alt rounded-circle text-dark">
            <span
              id="notificationColorWrapper"
              className="icon-wrapper-bg"
            ></span>
            <i id="notificationColor" className="icon fas fa-moon"></i>
          </span> */}
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
                  <img
                    width={42}
                    className="rounded-circle"
                    src={userProfilePicture} //{dinisAvatar}
                    onError={(el: any) => (el.src = dinisAvatar)}
                    alt=""
                  />
                  <FontAwesomeIcon
                    className="ml-2 opacity-8"
                    icon={faAngleDown}
                  />
                </DropdownToggle>
                <DropdownMenu right className="rm-pointers dropdown-menu-lg">
                  <div className="grid-menu grid-menu-2col">
                    <div className="no-gutters row">
                      <div className="col-md-6">
                        <Link to="/profile">
                          <button className="btn-icon-vertical btn-transition btn-transition-alt pt-2 pb-2 btn btn-outline-info">
                            <i className="fas fa-user-alt icon-gradient bg-malibu-beach btn-icon-wrapper mb-2 "></i>
                            <b>Profile</b>
                          </button>
                        </Link>
                      </div>
                      <div className="col-md-6">
                        <button
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
    </Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  userProfilePicture: state.ThemeOptions.userProfilePicture,
});

const mapDispatchToProps = (dispatch: any) => ({
  setUserProfilePicture: (image: string) =>
    dispatch(setUserProfilePicture(image)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserBox);
