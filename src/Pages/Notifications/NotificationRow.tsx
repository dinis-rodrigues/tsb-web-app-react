import cx from "classnames";
import { Link } from "react-router-dom";
import { Notification } from "../../interfaces";
import { dateToString, isDateInPastWeek } from "../../utils/generalFunctions";
import {
  getNotificationBorderColor,
  getNotificationIcon,
  getNotificationIconColor,
} from "./notificationsUtils";

type Props = {
  notification: Notification;
};

const NotificationRow = ({ notification }: Props) => {
  const borderColor = getNotificationBorderColor(notification);
  const icon = getNotificationIcon(notification);
  const iconColor = getNotificationIconColor(notification);
  const notifDate = new Date(notification.timestamp);
  const dayOfTheNotif = isDateInPastWeek(notifDate);
  // Get the time
  const hours = `0${notifDate.getHours()}`.slice(-2);
  const minutes = `0${notifDate.getMinutes()}`.slice(-2);

  let notifUrl = notification.urlPath;
  if (notifUrl[0] !== "/") notifUrl = `/${notifUrl}`;
  return notification ? (
    <div className="vertical-timeline-item vertical-timeline-element notification-list">
      <div className="vertical-timeline-element-icon bounce-in">
        <div className={cx("timeline-icon", borderColor)}>
          <i className={cx("icon-gradient", icon, iconColor)}></i>
        </div>
      </div>
      <Link to={notifUrl} className="notification-link">
        <div className="vertical-timeline-element-content bounce-in">
          <h4 className="timeline-title">{notification.title}</h4>
          <p>{notification.description}</p>
          <p>
            <i className="fa fa-calendar-alt mr-1"></i>
            {hours}:{minutes} | {dayOfTheNotif} | {dateToString(notifDate)}
          </p>
        </div>
      </Link>
    </div>
  ) : null;
};

export default NotificationRow;
