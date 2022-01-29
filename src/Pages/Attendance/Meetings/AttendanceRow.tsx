import { useEffect, useState } from "react";
import cx from "classnames";
import AvatarOverlap from "../../../components/AppImage/AvatarOverlap";

import { db } from "../../../config/firebase";
import {
  attendanceArrayRechart,
  EventInformation,
  graphColor,
  User,
  UsersDB,
  userStatus,
} from "../../../interfaces";
import {
  graphGreen,
  addStatisticListener,
  updateUserAttendance,
} from "../attendanceUtils";
import AttendanceChart from "../AttendanceChart";
import { useAuth } from "../../../contexts/AuthContext";
import { off, ref } from "firebase/database";

type Props = {
  userId: string;
  user: User;
  usersMetadata: UsersDB;
  event: EventInformation;
  eventId: string;
};

const AttendanceRow = ({
  userId,
  user,
  usersMetadata,
  event,
  eventId,
}: Props) => {
  const { USER } = useAuth();
  const defaultData = [
    { x: 0, y: 0.1 },
    { x: 1, y: 0.1 },
    { x: 2, y: 0.2 },
    { x: 3, y: 0.3 },
    { x: 4, y: 0.5 },
    { x: 5, y: 0.6 },
    { x: 6, y: 0.7 },
    { x: 7, y: 0.8 },
    { x: 8, y: 0.9 },
    { x: 9, y: 1 },
  ];
  // Department default graph
  const [departmentSeries, setDepartmentSeries] =
    useState<attendanceArrayRechart[]>(defaultData);
  const [departmentOptions, setDepartmentOptions] =
    useState<graphColor>(graphGreen);

  // Department default graph
  const [generalSeries, setGeneralSeries] =
    useState<attendanceArrayRechart[]>(defaultData);
  const [generalOptions, setGeneralOptions] = useState<graphColor>(graphGreen);

  // Status state
  const [currStatus, setCurrStatus] = useState<userStatus>({
    title: "waiting",
    badge: "badge-warning",
    attended: false,
    missed: false,
  });
  useEffect(() => {
    addStatisticListener(
      "departmentStats",
      userId,
      eventId,
      event,
      departmentOptions,
      setDepartmentSeries,
      setDepartmentOptions,
      setCurrStatus
    );
    addStatisticListener(
      "generalStats",
      userId,
      eventId,
      event,
      generalOptions,
      setGeneralSeries,
      setGeneralOptions,
      setCurrStatus
    );

    return () => {
      off(ref(db, `private/usersStatistics/${userId}/departmentStats`));
      off(ref(db, `private/usersStatistics/${userId}/generalStats`));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <tr>
      {/* Image, name and position */}
      <td>
        <div className="widget-content p-0">
          <div className="widget-content-wrapper">
            <div className="widget-content-left mr-3">
              <div className="widget-content-left">
                <AvatarOverlap
                  users={[userId]}
                  usersMetadata={usersMetadata}
                  size="md"
                  rounded={false}
                  withTooltip={true}
                />
              </div>
            </div>
            <div className="widget-content-left flex2">
              <div className="widget-heading">{user.pinfo.name}</div>
              <div className="widget-subheading opacity-7">
                {user.pinfo.position}
              </div>
            </div>
          </div>
        </div>
      </td>
      {/* Department */}
      <td>{user.pinfo.department}</td>
      {/* Department meeting graph statistics */}
      <td width={160} height={50}>
        <AttendanceChart
          chartOptions={departmentOptions}
          chartSeries={departmentSeries}
        />
      </td>
      {/* General Meeting graph statistics */}
      <td width={160} height={50}>
        <AttendanceChart
          chartOptions={generalOptions}
          chartSeries={generalSeries}
        />
      </td>
      {/* Status */}
      <td>
        <div className={cx("badge badge-pill", currStatus.badge)}>
          {currStatus.title}
        </div>
      </td>
      {/* Buttons */}
      <td>
        <div role="group" className="btn-group-sm btn-group">
          <button
            className={cx("btn-shadow btn", {
              "btn-primary": !currStatus.missed,
              "btn-danger": currStatus.missed,
            })}
            onClick={() => {
              updateUserAttendance(
                false,
                userId,
                eventId,
                event,
                currStatus,
                USER
              );
            }}
          >
            Miss
          </button>
          <button
            className={cx("btn-shadow btn", {
              "btn-primary": !currStatus.attended,
              "btn-success": currStatus.attended,
            })}
            onClick={() => {
              updateUserAttendance(
                true,
                userId,
                eventId,
                event,
                currStatus,
                USER
              );
            }}
          >
            Here
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AttendanceRow;
