import { useEffect, useState } from "react";
import { db } from "../../../config/firebase";
import { User, UserMetadata, UsersDB } from "../../../interfaces";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { sortUsersDb } from "../attendanceUtils";
import OverallAttendanceRow from "./OverallAttendanceRow";
import { useAuth } from "../../../contexts/AuthContext";

const getRows = (sortedUsers: [string, User][], usersDb: UsersDB) => {
  return sortedUsers.map(([userId, user], idx) => (
    <OverallAttendanceRow
      key={uuid()}
      userId={userId}
      user={user}
      usersMetadata={usersDb}
    />
  ));
};

const OverallAttendance = () => {
  const { usersMetadata } = useAuth();
  const [usersDb, setUsersDb] = useState<UserMetadata>({});
  const [sortedUsers, setSortedUsers] = useState<[string, User][]>([]);

  useEffect(() => {
    // Retrieve users metadata with statistics
    setUsersDb(usersMetadata);
    // build list of users whose department match the meeting type
    const usersToSort: [string, User][] = [];
    Object.entries(usersMetadata).forEach(([userId, user]) => {
      if (user.pinfo && user.pinfo.department && user.pinfo.inTeam) {
        usersToSort.push([userId, user]);
      }
    });
    let usersSorted = sortUsersDb(usersToSort);
    setSortedUsers(usersSorted);

    return () => {
      db.ref(`private/users`).off("value");
    };
  }, []);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {/* Display only ongoing meetings and corresponding users */}
        {sortedUsers.length > 0 && Object.keys(usersDb).length !== 0 && (
          <div className={"main-card mb-3 card"}>
            <div className="card-header">
              <i
                className={cx(
                  "header-icon icon-gradient",
                  "fa fa-globe",
                  "bg-night-fade"
                )}
              ></i>
              Overall Attendance Statistics
            </div>
            <div className="card-body p-0">
              {/* Add table with users of the corresponding department */}
              <table
                className={
                  "table table-striped table-hover row-border align-middle text-truncate"
                }
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Department %</th>
                    <th>General %</th>
                  </tr>
                </thead>
                <tbody>{getRows(sortedUsers, usersDb)}</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverallAttendance;
