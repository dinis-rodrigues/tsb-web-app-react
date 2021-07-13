import { useEffect, useState } from "react";
import {
  DropdownToggle,
  DropdownMenu,
  UncontrolledButtonDropdown,
} from "reactstrap";
import cx from "classnames";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Notifications } from "../../interfaces";
import { objectExists } from "../../utils/generalFunctions";
import {
  newNotificationsListener,
  removeNewNotifications,
} from "../../Pages/Notifications/notificationsUtils";
import NotificationRow from "../../Pages/Notifications/NotificationRow";
import { Link } from "react-router-dom";

const UserNotifications = () => {
  const { USER } = useAuth();
  const [notificationsMask, setNotificationsMask] = useState<Notifications>({});

  // const unreadNotifications = objectExists(newNotifications);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  useEffect(() => {
    newNotificationsListener(
      USER,
      notificationsMask,
      setNotificationsMask,
      setUnreadNotifications
    );
    return () => {
      db.ref(`private/usersNotifications/${USER?.id}/new`).off("value");
      removeNewNotifications(USER, unreadNotifications);
    };
  }, [USER]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <UncontrolledButtonDropdown>
      <DropdownToggle
        color="btn"
        className="p-0"
        onClick={() => {
          removeNewNotifications(USER, false);
          setUnreadNotifications(false);
        }}
      >
        <span
          className={cx("icon-wrapper icon-wrapper-alt rounded-circle", {
            "text-danger": unreadNotifications,
          })}
        >
          <span
            id="notificationColorWrapper"
            className={cx("icon-wrapper-bg ", {
              "bg-danger": unreadNotifications,
            })}
          ></span>
          <i
            id="notificationColor"
            className={cx("icon fas fa-bell", {
              "icon-anim-pulse": unreadNotifications,
            })}
          ></i>
        </span>
      </DropdownToggle>
      <DropdownMenu right className="rm-pointers dropdown-menu-xl">
        <div className="tab-content">
          <div
            id="newNotificationPanel"
            className={cx("tab-pane", {
              active: unreadNotifications || objectExists(notificationsMask),
            })}
          >
            <div className="scroll-area-sm">
              <div className="scrollbar-container">
                <div className="p-1">
                  <div
                    id="HNotificationsContent"
                    className="vertical-time-icons vertical-timeline vertical-timeline--animate vertical-timeline--one-column"
                  >
                    {Object.entries(notificationsMask).length > 0 &&
                      Object.entries(notificationsMask)
                        .reverse()
                        .map(([notifId, notification]) => (
                          <NotificationRow
                            key={notifId}
                            notification={notification}
                          />
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="clearNotificationPanel"
            className={cx("tab-pane", {
              active: !unreadNotifications && !objectExists(notificationsMask),
            })}
          >
            <div className="scroll-area-sm">
              <div className="scrollbar-container">
                <div className="no-results pt-3 pb-0">
                  <div className="swal2-icon swal2-success swal2-animate-success-icon">
                    <div
                      className="swal2-success-circular-line-left"
                      style={{ backgroundColor: "white" }}
                    ></div>
                    <span className="swal2-success-line-tip"></span>
                    <span className="swal2-success-line-long"></span>
                    <div className="swal2-success-ring"></div>
                    <div
                      className="swal2-success-fix"
                      style={{ backgroundColor: "white" }}
                    ></div>
                    <div
                      className="swal2-success-circular-line-right"
                      style={{ backgroundColor: "white" }}
                    ></div>
                  </div>
                  <div className="results-subtitle">All caught up!</div>
                  <div className="results-title">
                    You have no new notifications!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item-divider nav-item"></li>
          <li className="nav-item-btn text-center nav-item">
            <Link to="/notifications">
              <button className="btn-shadow btn-wide btn-pill btn btn-focus btn-sm">
                View Notification History
              </button>
            </Link>
          </li>
        </ul>
      </DropdownMenu>
    </UncontrolledButtonDropdown>
  );
};

export default UserNotifications;
