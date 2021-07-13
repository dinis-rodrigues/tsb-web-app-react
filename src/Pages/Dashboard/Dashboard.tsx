import { Fragment, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { checkEventPeriodicity } from "../Events/eventsUtils";
import DashBoardDegreeCount from "./DashBoardDegreeCount";

import DashEvent from "./DashEvent";
import DashForumThread from "./DashForumThread";
import DashToDo from "./DashToDo";

// import AppFooter from "../../components/AppFooter/";

const Dashboard = () => {
  const { USER } = useAuth();
  useEffect(() => {
    checkEventPeriodicity();
  }, []);
  return (
    <Fragment>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="row">
            {USER && (
              <Fragment>
                <DashEvent
                  meetingType={USER.department}
                  tooltipTarget="depMeeting"
                />
                <DashEvent meetingType="General" tooltipTarget="genMeeting" />
                <DashEvent
                  meetingType="Competition"
                  tooltipTarget="compMeeting"
                />
              </Fragment>
            )}
          </div>
          <div className="mt-4">
            <DashForumThread />
          </div>
          <div className="row">
            <DashToDo user={USER} />
            <DashBoardDegreeCount />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Dashboard;
