import { off, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { attendanceArrayRechart, graphColor } from "../../interfaces";
import AttendanceChart from "../Attendance/AttendanceChart";
import {
  graphGreen,
  addOverallStatisticListener,
} from "../Attendance/attendanceUtils";

type Props = {
  userId: string;
};

const UserAttendance = ({ userId }: Props) => {
  // Attendance chart states
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

  useEffect(() => {
    // Get attendance charts
    addOverallStatisticListener(
      "departmentStats",
      userId,
      departmentOptions,
      setDepartmentSeries,
      setDepartmentOptions
    );
    addOverallStatisticListener(
      "generalStats",
      userId,
      generalOptions,
      setGeneralSeries,
      setGeneralOptions
    );
    return () => {
      off(ref(db, `private/usersStatistics/${userId}/departmentStats`));
      off(ref(db, `private/usersStatistics/${userId}/generalStats`));
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ul className="list-group list-group-flush">
      <li className="list-group-item">
        <div className="no-gutters row">
          <div className="col-md-6 col-xl-6">
            <div className="widget-content">
              <div className="widget-content-wrapper justify-center">
                <div className="widget-content-left">
                  <div className="widget-heading">Department Meeting</div>
                  <div className="widget-subheading">Attendance</div>
                </div>
                <div className={"widget-content-right ml-3 mr-3"}>
                  <div style={{ width: 160, height: 50 }}>
                    <AttendanceChart
                      chartOptions={departmentOptions}
                      chartSeries={departmentSeries}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6 col-xl-6">
            <div className="widget-content">
              <div className="widget-content-wrapper justify-center">
                <div className={"widget-content-right ml-3 mr-3"}>
                  <div style={{ width: 160, height: 50 }}>
                    <AttendanceChart
                      chartOptions={generalOptions}
                      chartSeries={generalSeries}
                    />
                  </div>
                </div>
                <div className="widget-content-left">
                  <div className="widget-heading">General Meeting</div>
                  <div className="widget-subheading">Attendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default UserAttendance;
