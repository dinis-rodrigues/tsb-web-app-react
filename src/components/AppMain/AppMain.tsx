import { Suspense, lazy } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import AppLoading from "../AppLoading/AppLoading";
import PrivateRoute from "../PrivateRoute/PrivateRoute";

const Attendance = lazy(() => import("../../Pages/Attendance/Meetings/Attendance"));
const OverallAttendance = lazy(() => import("../../Pages/Attendance/Overall/OverallAttendance"));
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
const ResetPasswordEmail = lazy(() => import("../../Pages/ResetPassword/ResetPasswordEmail"));
const Team = lazy(() => import("../../Pages/Team/Team"));
const Recruitment = lazy(() => import("../../Pages/Recruitment/Recruitment"));
const Profile = lazy(() => import("../../Pages/Profile/Profile"));
const VisitorProfile = lazy(() => import("../../Pages/Profile/VisitorProfile"));
const Events = lazy(() => import("../../Pages/Events/Events"));
const Tasks = lazy(() => import("../../Pages/Tasks/Tasks"));
const Maintenance = lazy(() => import("../../Pages/Maintenance/Maintenance"));
const UserManagement = lazy(() => import("../../Pages/Admin/UserManagement/UserManagement"));
const DepartmentManagement = lazy(
  () => import("../../Pages/Admin/DepartmentManagement/DepartmentManagement"),
);
const FeatureManagement = lazy(
  () => import("../../Pages/Admin/FeatureManagement/FeatureManagement"),
);
const NotificationsPage = lazy(() => import("../../Pages/Notifications/NotificationsPage"));

const Register = lazy(() => import("../../Pages/Register/Register"));

const Sponsors = lazy(() => import("../../Pages/Sponsors/Sponsors"));
const Gallery = lazy(() => import("../../Pages/Gallery/Gallery"));

function App() {
  return (
    <>
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
          <Route exact path="/resetPasswordEmail" component={ResetPasswordEmail} />
          <Route exact path="/register" component={Register} />
          <Route path="/maintenance" component={Maintenance} />
          <PrivateRoute path="/dashboard" featureName="dashboard" component={Dashboard} />
          <PrivateRoute path="/team" featureName="members" component={Team} />
          <PrivateRoute
            exact
            path="/recruitment"
            featureName="recruitment"
            component={Recruitment}
          />
          <PrivateRoute path="/profile/u/:userId" component={VisitorProfile} />
          <PrivateRoute path="/profile" exact component={Profile} />
          <PrivateRoute path="/events" featureName="events" component={Events} />
          <PrivateRoute
            path="/attendance/meetings"
            featureName="attendance"
            component={Attendance}
          />
          <PrivateRoute
            path="/attendance/overall"
            featureName="attendance"
            component={OverallAttendance}
          />
          <PrivateRoute
            path="/:departmentBoard/b/:encodedCurrBoard"
            featureName="tasks"
            component={Tasks}
          />
          <PrivateRoute path="/cashflow" featureName="cashflow" component={CashFlow} />

          <PrivateRoute path="/budget" featureName="budget" component={Budget} />
          <PrivateRoute
            path="/forum/s/:encodedSectionName/topic/:encodedTopicName/thread/:encodedThreadName"
            featureName="forum"
            component={ForumThread}
          />
          <PrivateRoute
            path="/forum/s/:encodedSectionName/topic/:encodedTopicName"
            featureName="forum"
            component={ForumTopic}
          />
          <PrivateRoute exact path="/forum" featureName="forum" component={Forum} />
          <PrivateRoute path="/notifications" component={NotificationsPage} />
          <PrivateRoute path="/sponsors" featureName="sponsors" component={Sponsors} />
          <PrivateRoute path="/gallery" featureName="gallery" component={Gallery} />
          <PrivateRoute
            exact
            path="/userManagement"
            featureName="userManagement"
            component={UserManagement}
          />
          <PrivateRoute
            exact
            path="/departmentManagement"
            featureName="departmentManagement"
            component={DepartmentManagement}
          />
          <PrivateRoute
            exact
            path="/featureManagement"
            featureName="featureManagement"
            component={FeatureManagement}
          />
          <Redirect to="/" />
        </Switch>
      </Suspense>
      <Route exact path="/" render={() => <Redirect to="/dashboard" />} />
    </>
  );
}

export default App;
