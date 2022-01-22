import { Fragment, useState } from "react";
import { withRouter } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { userHasPermission } from "../../utils/generalFunctions";
import NavItem from "./NavItem";
import NavigationSection from "./NavigationSection";
import NavigationSubSection from "./NavigationSubSection";
import NavigationDropdown from "./NavigationDropdown";
import { ApplicationFeatures } from "../../interfaces";

interface NavTasks {
  tasks: boolean;
  attendance: boolean;
}
const NavigationBar = () => {
  const { departments } = useAuth();
  const location = window.location.pathname;

  let isTasksActive = false;
  let isAttendanceActive = false;

  // Check if menu dropdowns are active or not
  if (location.indexOf("tasks") !== -1) {
    isAttendanceActive = false;
    isTasksActive = true;
  } else if (location.indexOf("attendance") !== -1) {
    isAttendanceActive = true;
    isTasksActive = false;
  }
  const [activeCollapse, setActiveCollapse] = useState<NavTasks>({
    tasks: isTasksActive,
    attendance: isAttendanceActive,
  });

  const toggleTasks = () => {
    setActiveCollapse({ ...activeCollapse, tasks: !activeCollapse.tasks });
  };
  const toggleAttendance = () => {
    setActiveCollapse({
      ...activeCollapse,
      attendance: !activeCollapse.attendance,
    });
  };
  const { USER, applicationFeatures, isAdminUser, isGod } = useAuth();
  const userAdmin = userHasPermission(USER);

  const isVisible = (
    featureName: string,
    applicationFeatures: ApplicationFeatures,
    isAdminUser: boolean,
    isGod: boolean
  ) => {
    console.log(featureName);
    if (applicationFeatures[featureName].public) return true;
    else if ((applicationFeatures.admin && isAdminUser) || isGod) return true;
    else if (isGod) return true;
    return false;
  };

  return (
    <Fragment>
      <h5 className="app-sidebar__heading">Menu</h5>
      <NavigationSection>
        <NavigationSubSection>
          <NavItem
            pageName={"Dashboard"}
            to={"/dashboard"}
            icon={"pe-7s-world"}
            isVisible={isVisible(
              "dashboard",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
          <NavItem
            pageName={"Events"}
            to={"/events"}
            icon={"pe-7s-date"}
            isVisible={isVisible(
              "events",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
          <NavItem
            pageName={"Gallery"}
            to={"/gallery"}
            icon={"pe-7s-photo"}
            isVisible={isVisible(
              "gallery",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
          <NavItem
            pageName={"Forum"}
            to={"/forum"}
            icon={"pe-7s-chat"}
            isVisible={isVisible(
              "forum",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
        </NavigationSubSection>
      </NavigationSection>
      <h5 className="app-sidebar__heading">Team</h5>
      <NavigationSection>
        <NavigationSubSection>
          <NavigationDropdown
            title="Tasks"
            isActive={activeCollapse.tasks}
            toggle={toggleTasks}
            icon={"pe-7s-coffee"}
          >
            <NavigationSubSection isVisible={activeCollapse.tasks}>
              {Object.entries(departments).map(([acronym, department], idx) => (
                <NavItem
                  key={idx}
                  pageName={department.description}
                  to={`/tasks${acronym.toUpperCase()}/b/General`}
                  isVisible={isVisible(
                    "tasks",
                    applicationFeatures,
                    isAdminUser,
                    isGod
                  )}
                />
              ))}
            </NavigationSubSection>
          </NavigationDropdown>
          {/* Attendace Dropdown */}
          <NavigationDropdown
            title="Attendance"
            isActive={activeCollapse.attendance}
            toggle={toggleAttendance}
            icon={"pe-7s-way"}
          >
            <NavigationSubSection isVisible={activeCollapse.attendance}>
              <NavItem
                pageName={"Meetings"}
                to={"/attendance/meetings"}
                isVisible={isVisible(
                  "attendance",
                  applicationFeatures,
                  isAdminUser,
                  isGod
                )}
              />
              <NavItem
                pageName={"Overall"}
                to={"/attendance/overall"}
                isVisible={isVisible(
                  "attendance",
                  applicationFeatures,
                  isAdminUser,
                  isGod
                )}
              />
            </NavigationSubSection>
          </NavigationDropdown>
          <NavItem
            pageName={"Members"}
            to={"/team"}
            icon={"pe-7s-users"}
            isVisible={isVisible(
              "members",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
          <NavItem
            pageName={"Recruitment"}
            to={"/recruitment"}
            icon={"pe-7s-add-user"}
            isVisible={isVisible(
              "recruitment",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
        </NavigationSubSection>
      </NavigationSection>
      <h5 className="app-sidebar__heading">Finances</h5>
      <NavigationSection>
        <NavigationSubSection>
          <NavItem
            pageName={"Budget"}
            to={"/budget"}
            icon={"pe-7s-piggy"}
            isVisible={isVisible(
              "budget",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
          <NavItem
            pageName={"Cash Flow"}
            to={"/cashflow"}
            icon={"pe-7s-graph2"}
            isVisible={isVisible(
              "cashflow",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />

          <NavItem
            pageName={"Sponsors"}
            to={"/sponsors"}
            icon={"pe-7s-note2"}
            isVisible={isVisible(
              "sponsors",
              applicationFeatures,
              isAdminUser,
              isGod
            )}
          />
        </NavigationSubSection>
      </NavigationSection>
      {userAdmin && (
        <Fragment>
          <h5 className="app-sidebar__heading">Admin</h5>
          <NavigationSection>
            <NavigationSubSection>
              <NavItem
                pageName={"User Management"}
                to={"/userManagement"}
                icon={"pe-7s-users"}
                isVisible={isVisible(
                  "userManagement",
                  applicationFeatures,
                  isAdminUser,
                  isGod
                )}
              />
              <NavItem
                pageName={"Department Management"}
                to={"/departmentManagement"}
                icon={"pe-7s-culture"}
                isVisible={isVisible(
                  "departmentManagement",
                  applicationFeatures,
                  isAdminUser,
                  isGod
                )}
              />
              <NavItem
                pageName={"Feature Management"}
                to={"/featureManagement"}
                icon={"pe-7s-flag"}
                isVisible={isVisible(
                  "featureManagement",
                  applicationFeatures,
                  isAdminUser,
                  isGod
                )}
              />
            </NavigationSubSection>
          </NavigationSection>
        </Fragment>
      )}
    </Fragment>
  );
};

export default withRouter(NavigationBar);
