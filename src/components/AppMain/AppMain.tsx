import "../../base.css";
import { Route, Redirect, Switch } from "react-router-dom";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import { Suspense, lazy, Fragment } from "react";
import { ToastContainer } from "react-toastify";
import AppLoading from "../AppLoading/AppLoading";

const Attendance = lazy(
  () => import("../../Pages/Attendance/Meetings/Attendance")
);
const OverallAttendance = lazy(
  () => import("../../Pages/Attendance/Overall/OverallAttendance")
);
const Budget = lazy(() => import("../../Pages/Budget/Budget"));
const CashFlow = lazy(() => import("../../Pages/CashFlow/CashFlow"));
const Dashboard = lazy(() => import("../../Pages/Dashboard/Dashboard"));
const Forum = lazy(() => import("../../Pages/Forum/Forum"));
const ForumTopic = lazy(() => import("../../Pages/ForumTopic/ForumTopic"));
const ForumThread = lazy(() => import("../../Pages/ForumThread/ForumThread"));
const Login = lazy(() => import("../../Pages/Login/Login"));
// const ResetPassword = lazy(
//   () => import("../../Pages/ResetPassword/ResetPassword")
// );
const ResetPasswordEmail = lazy(
  () => import("../../Pages/ResetPassword/ResetPasswordEmail")
);
const Team = lazy(() => import("../../Pages/Team/Team"));
const Profile = lazy(() => import("../../Pages/Profile/Profile"));
const VisitorProfile = lazy(() => import("../../Pages/Profile/VisitorProfile"));
const Events = lazy(() => import("../../Pages/Events/Events"));
const Tasks = lazy(() => import("../../Pages/Tasks/Tasks"));
const Maintenance = lazy(() => import("../../Pages/Maintenance/Maintenance"));
const UserManagement = lazy(
  () => import("../../Pages/Admin/UserManagement/UserManagement")
);
const DepartmentManagement = lazy(
  () => import("../../Pages/Admin/DepartmentManagement/DepartmentManagement")
);
const NotificationsPage = lazy(
  () => import("../../Pages/Notifications/NotificationsPage")
);

const Register = lazy(() => import("../../Pages/Register/Register"));

function App() {
  return (
    <Fragment>
      {/* Components */}
      <Suspense
        fallback={
          <div className="loader-container">
            <div className="loader-container-inner">
              <AppLoading />
            </div>
          </div>
        }
      >
        <Switch>
          <Route exact path="/login" component={Login} />
          {/* <Route path="/resetPassword" component={ResetPassword} /> */}
          <Route
            exact
            path="/resetPasswordEmail"
            component={ResetPasswordEmail}
          />
          <Route exact path="/register" component={Register} />
          <Route path="/maintenance" component={Maintenance} />
          <PrivateRoute path="/dashboard" component={Dashboard} />
          <PrivateRoute path="/team" component={Team} />
          <PrivateRoute path="/profile/u/:userId" component={VisitorProfile} />
          <PrivateRoute path="/profile" exact component={Profile} />
          <PrivateRoute path="/events" component={Events} />
          <PrivateRoute path="/attendance/meetings" component={Attendance} />
          <PrivateRoute
            path="/attendance/overall"
            component={OverallAttendance}
          />
          <PrivateRoute
            path="/:departmentBoard/b/:encodedCurrBoard"
            component={Tasks}
          />
          <PrivateRoute path="/cashflow" component={CashFlow} />
          <PrivateRoute path="/budget" component={Budget} />
          <PrivateRoute
            path="/forum/s/:encodedSectionName/topic/:encodedTopicName/thread/:encodedThreadName"
            component={ForumThread}
          />
          <PrivateRoute
            path="/forum/s/:encodedSectionName/topic/:encodedTopicName"
            component={ForumTopic}
          />
          <PrivateRoute exact path="/forum" component={Forum} />
          <PrivateRoute path="/notifications" component={NotificationsPage} />
          <PrivateRoute
            exact
            path="/userManagement"
            component={UserManagement}
          />
          <PrivateRoute
            exact
            path="/departmentManagement"
            component={DepartmentManagement}
          />
          <Redirect to="/" />
        </Switch>
      </Suspense>
      <Route exact path="/" render={() => <Redirect to="/dashboard" />} />

      <ToastContainer />
    </Fragment>
  );
}

export default App;
