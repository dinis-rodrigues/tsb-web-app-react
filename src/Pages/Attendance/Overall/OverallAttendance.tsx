import cx from "classnames";
import { off, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { User, UserMetadata, UsersDB } from "../../../interfaces";
import {
  addLastStatisticUpdateListener,
  resetSeason,
  sortUsersDb,
  swalResetSeason,
} from "../attendanceUtils";
import OverallAttendanceRow from "./OverallAttendanceRow";

const getRows = (sortedUsers: [string, User][], usersDb: UsersDB) => {
  return sortedUsers.map(([userId, user], idx) => (
    <OverallAttendanceRow key={uuid()} userId={userId} user={user} usersMetadata={usersDb} />
  ));
};

const OverallAttendance = () => {
  const { usersMetadata, isDarkMode, isAdminUser } = useAuth();
  const [usersDb, setUsersDb] = useState<UserMetadata>({});
  const [sortedUsers, setSortedUsers] = useState<[string, User][]>([]);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    // Retrieve users metadata with statistics
    setUsersDb(usersMetadata);
    addLastStatisticUpdateListener(setLastUpdate);
    // build list of users whose department match the meeting type
    const usersToSort: [string, User][] = [];
    Object.entries(usersMetadata).forEach(([userId, user]) => {
      if (user.pinfo && user.pinfo.department && user.pinfo.inTeam) {
        usersToSort.push([userId, user]);
      }
    });
    const usersSorted = sortUsersDb(usersToSort);
    setSortedUsers(usersSorted);

    return () => {
      off(ref(db, `private/cache/cache/userStatistics`));
    };
  }, [usersMetadata]);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {/* Display only ongoing meetings and corresponding users */}
        {sortedUsers.length > 0 && Object.keys(usersDb).length !== 0 && (
          <div className={"main-card mb-3 card"}>
            <div className="card-header">
              <i className={cx("header-icon icon-gradient", "fa fa-globe", "bg-night-fade")}></i>
              Overall Attendance Statistics
              {isAdminUser && (
                <div className="btn-actions-pane-right text-capitalize">
                  <span className="badge badge-pill badge-secundary">
                    {lastUpdate && `Latest Season Reset: ${lastUpdate}`}
                  </span>
                  <button
                    type="button"
                    className="btn-wide btn-info mr-md-2 btn btn-sm"
                    onClick={() => swalResetSeason(() => resetSeason(usersMetadata))}
                  >
                    <i className="fa fa-exclamation-triangle text-white btn-icon-wrapper"></i> Reset
                    Season
                  </button>
                </div>
              )}
            </div>
            <div className="card-body p-0">
              {/* Add table with users of the corresponding department */}
              <table
                className={cx(
                  "table table-striped table-hover row-border align-middle text-truncate",
                  { "table-dark": isDarkMode },
                )}
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
