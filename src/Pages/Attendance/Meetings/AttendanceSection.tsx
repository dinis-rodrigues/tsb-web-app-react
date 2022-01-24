import cx from "classnames";
import { v4 as uuid } from "uuid";
import { useAuth } from "../../../contexts/AuthContext";
import {
  EventColors,
  EventInformation,
  User,
  UsersDB,
} from "../../../interfaces";
import { extendDate } from "../../../utils/generalFunctions";
import { getEventTitlesAndColors } from "../../Events/eventsUtils";
import { departmentMatchesEvent, sortUsersDb } from "../attendanceUtils";
import AttendanceRow from "./AttendanceRow";

type Props = {
  eventId: string;
  event: EventInformation;
  usersDb: UsersDB;
};

const AttendanceSection = ({ eventId, event, usersDb }: Props) => {
  const { departmentsWDesc, isDarkMode } = useAuth();
  const currMeeting = event.type.replace(" Meeting", "");

  const attendanceTitleIconColor: EventColors =
    getEventTitlesAndColors(departmentsWDesc);
  let extendedDate = extendDate(event.date);

  let title = attendanceTitleIconColor[currMeeting].description;
  let icon = attendanceTitleIconColor[currMeeting].icon;
  let color = attendanceTitleIconColor[currMeeting].gradientColor;

  let boardTitle = {
    title: title,
    icon: icon,
    color: color,
    date: extendedDate,
  };
  // build list of users whose department match the meeting type
  const usersToSort: [string, User][] = [];

  Object.entries(usersDb).forEach(([userId, user]) => {
    if (user.pinfo && user.pinfo.department && user.pinfo.inTeam) {
      if (departmentMatchesEvent(user.pinfo.department, event.type)) {
        usersToSort.push([userId, user]);
      }
    }
  });

  let sortedUsers = sortUsersDb(usersToSort);

  return (
    <div className={"main-card mb-3 card"}>
      <div className="card-header">
        <i
          className={cx(
            "header-icon icon-gradient fa",
            boardTitle.icon,
            boardTitle.color
          )}
        ></i>
        {`${event.type} - ${boardTitle.date} at ${event.hours}:${event.minutes} - Duration: ${event.duration}`}
        <div className="btn-actions-pane-right">
          <span className="badge badge-pill badge-dark">
            Members: {sortedUsers.length}
          </span>
        </div>
      </div>
      <div className="card-body p-0">
        {/* Add table with users of the corresponding department */}
        <table
          className={cx(
            "table table-striped table-hover row-border align-middle text-truncate",
            { "table-dark": isDarkMode }
          )}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Department %</th>
              <th>General %</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers &&
              sortedUsers.map(([userId, user], idx) => (
                <AttendanceRow
                  key={uuid()}
                  event={event}
                  eventId={eventId}
                  userId={userId}
                  user={user}
                  usersMetadata={usersDb}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceSection;
