import { Fragment, useEffect } from "react";
import { auth } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { getUserAuthToken } from "../../contexts/contextUtils";
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

  const verifyUserToken = () => {
    var data = new FormData();

    getUserAuthToken(auth)?.then((token) => {
      console.log("Generated token: ", token);
      data.append("tokenId", token);
      fetch("http://localhost:4000/auth", {
        method: "POST",
        body: JSON.stringify({ tokenId: token }),
      });
    });
  };

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

          <button onClick={() => verifyUserToken()}>Verify</button>

          <DashForumThread />

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
