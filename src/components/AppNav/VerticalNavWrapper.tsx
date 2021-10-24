import { Fragment, useState } from "react";
import { withRouter, NavLink } from "react-router-dom";
import cx from "classnames";
import { useAuth } from "../../contexts/AuthContext";
import { userHasPermission } from "../../utils/generalFunctions";

interface NavTasks {
  tasks: boolean;
  attendance: boolean;
}
const Nav = () => {
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
    // console.log("clicking");
  };
  const toggleAttendance = () => {
    setActiveCollapse({
      ...activeCollapse,
      attendance: !activeCollapse.attendance,
    });
    // console.log("clicking");
  };
  const { USER } = useAuth();
  const userAdmin = userHasPermission(USER);

  const collapseMenus = () => {};

  return (
    <Fragment>
      <h5 className="app-sidebar__heading">Menu</h5>
      <div className="metismenu vertical-nav-menu">
        <ul className="metismenu-container">
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/dashboard"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-world"></i>Dashboard
            </NavLink>
          </li>
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/events"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-date"></i>Events
            </NavLink>
          </li>
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/forum"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-chat"></i>Forum
            </NavLink>
          </li>
        </ul>
      </div>
      <h5 className="app-sidebar__heading">Team</h5>
      <div className="metismenu vertical-nav-menu">
        <ul className="metismenu-container">
          <li className="metismenu-item">
            <span
              className={cx("metismenu-link", "cursor-pointer", {
                "font-weight-bold": activeCollapse.tasks,
              })}
              onClick={toggleTasks}
            >
              <i className="metismenu-icon pe-7s-coffee"></i>Tasks
              <i className="metismenu-state-icon pe-7s-angle-down fa fa-caret-left"></i>
            </span>
            <ul
              className={cx("metismenu-container", {
                visible: activeCollapse.tasks,
              })}
            >
              {Object.entries(departments).map(([acronym, department], idx) => (
                <li key={idx} className="metismenu-item">
                  <NavLink
                    className="metismenu-link"
                    to={`/tasks${acronym.toUpperCase()}/b/General`}
                    activeClassName="active"
                  >
                    <i className="metismenu-icon fa fa-"></i>
                    {department.description}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>
          {/* Attendace Dropdown */}
          <li className="metismenu-item">
            <span
              className={cx("metismenu-link", "cursor-pointer", {
                "font-weight-bold": activeCollapse.attendance,
              })}
              onClick={toggleAttendance}
            >
              <i className="metismenu-icon pe-7s-way"></i>Attendance
              <i className="metismenu-state-icon pe-7s-angle-down fa fa-caret-left"></i>
            </span>
            <ul
              className={cx("metismenu-container", {
                visible: activeCollapse.attendance,
              })}
            >
              <li className="metismenu-item">
                <NavLink
                  className="metismenu-link"
                  to="/attendance/meetings"
                  activeClassName="active"
                >
                  <i className="metismenu-icon fa fa-"></i>Meetings
                </NavLink>
              </li>
              <li className="metismenu-item">
                <NavLink
                  className="metismenu-link"
                  to="/attendance/overall"
                  activeClassName="active"
                >
                  <i className="metismenu-icon fa fa-"></i>Overall
                </NavLink>
              </li>
            </ul>
          </li>
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/team"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-users"></i>Members
            </NavLink>
          </li>
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/recruitment"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-add-user"></i>Recruitment
            </NavLink>
          </li>
        </ul>
      </div>
      <h5 className="app-sidebar__heading">Finances</h5>
      <div className="metismenu vertical-nav-menu">
        <ul className="metismenu-container">
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/budget"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-piggy"></i>Budget
            </NavLink>
          </li>
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/cashflow"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-graph2"></i>Cash Flow
            </NavLink>
          </li>
          <li className="metismenu-item">
            <NavLink
              className="metismenu-link"
              to="/sponsors"
              activeClassName="active"
              onClick={collapseMenus}
            >
              <i className="metismenu-icon pe-7s-note2"></i>Sponsors
            </NavLink>
          </li>
        </ul>
      </div>
      {userAdmin && (
        <Fragment>
          <h5 className="app-sidebar__heading">Admin</h5>
          <div className="metismenu vertical-nav-menu">
            <ul className="metismenu-container">
              <li className="metismenu-item">
                <NavLink
                  className="metismenu-link"
                  to="/userManagement"
                  activeClassName="active"
                  onClick={collapseMenus}
                >
                  <i className="metismenu-icon pe-7s-users"></i>User Management
                </NavLink>
              </li>
              <li className="metismenu-item">
                <NavLink
                  className="metismenu-link"
                  to="/departmentManagement"
                  activeClassName="active"
                  onClick={collapseMenus}
                >
                  <i className="metismenu-icon pe-7s-culture"></i>Department
                  Management
                </NavLink>
              </li>
            </ul>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};

export default withRouter(Nav);
