import { useEffect } from "react";
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
    <>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="row">
            {USER && (
              <>
                <DashEvent meetingType={USER.department} tooltipTarget="depMeeting" />
                <DashEvent meetingType="General" tooltipTarget="genMeeting" />
                <DashEvent meetingType="Competition" tooltipTarget="compMeeting" />
              </>
            )}
          </div>

          <DashForumThread />

          <div className="row">
            <DashToDo user={USER} />
            <DashBoardDegreeCount />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
