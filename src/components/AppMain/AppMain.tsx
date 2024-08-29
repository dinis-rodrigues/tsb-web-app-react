import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
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
      {/* elements <*/}
      <Suspense
        fallback={
          <div className="loader-container">
            <div className="loader-container-inner">
              <AppLoading />
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/resetPassword" element={<ResetPassword/>} /> */}
          <Route path="/resetPasswordEmail" element={<ResetPasswordEmail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/maintenance" element={<Maintenance />} />

          {/* Private routes */}
          <Route
            path="/"
            element={
              <PrivateRoute featureName="dashboard">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute featureName="dashboard">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute featureName="members">
                <Team />
              </PrivateRoute>
            }
          />
          <Route
            path="/recruitment"
            element={
              <PrivateRoute featureName="recruitment">
                <Recruitment />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/u/:userId"
            element={
              <PrivateRoute>
                <VisitorProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute featureName="events">
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance/meetings"
            element={
              <PrivateRoute featureName="attendance">
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance/overall"
            element={
              <PrivateRoute featureName="attendance">
                <OverallAttendance />
              </PrivateRoute>
            }
          />
          <Route
            path="/:departmentBoard/b/:encodedCurrBoard"
            element={
              <PrivateRoute featureName="tasks">
                <Tasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/cashflow"
            element={
              <PrivateRoute featureName="cashflow">
                <CashFlow />
              </PrivateRoute>
            }
          />

          <Route
            path="/budget"
            element={
              <PrivateRoute featureName="budget">
                <Budget />
              </PrivateRoute>
            }
          />
          <Route
            path="/forum/s/:encodedSectionName/topic/:encodedTopicName/thread/:encodedThreadName"
            element={
              <PrivateRoute featureName="forum">
                <ForumThread />
              </PrivateRoute>
            }
          />
          <Route
            path="/forum/s/:encodedSectionName/topic/:encodedTopicName"
            element={
              <PrivateRoute featureName="forum">
                <ForumTopic />
              </PrivateRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <PrivateRoute featureName="forum">
                <Forum />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sponsors"
            element={
              <PrivateRoute featureName="sponsors">
                <Sponsors />
              </PrivateRoute>
            }
          />
          <Route
            path="/gallery"
            element={
              <PrivateRoute featureName="gallery">
                <Gallery />
              </PrivateRoute>
            }
          />
          <Route
            path="/userManagement"
            element={
              <PrivateRoute featureName="userManagement">
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/departmentManagement"
            element={
              <PrivateRoute featureName="departmentManagement">
                <DepartmentManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/featureManagement"
            element={
              <PrivateRoute featureName="featureManagement">
                <FeatureManagement />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
