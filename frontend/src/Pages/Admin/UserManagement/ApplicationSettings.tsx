import cx from "classnames";
import { toggleMaintenance, toggleRegistration } from "./userManagementUtils";
import { useAuth } from "../../../contexts/AuthContext";

const ApplicationSettings = () => {
  const { applicationSettings } = useAuth();
  const { registrationIsOpen, maintenanceIsOpen } = applicationSettings;

  return (
    <div className="main-card mb-3 card">
      <div className="card-header">
        <i className="header-icon lnr-cog icon-gradient bg-plum-plate"></i>
        Application Settings
        {/* <button onClick={() => replaceUidFromAllTasks()}>
          move everything
        </button> */}
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <div className="widget-content p-0">
            <div className="widget-content-wrapper">
              <div className="widget-content-left">
                <div className="widget-heading">
                  User Registration Status
                  <span className="widget-subheading">
                    {" "}
                    -{" "}
                    {registrationIsOpen
                      ? "Users are allowed to register in the application."
                      : "Users are NOT allowed to register in the application."}
                  </span>
                </div>
              </div>
              <div className="widget-content-right">
                <button
                  type="button"
                  className={cx("float-right mr-1 btn btn-shadow", {
                    "btn-danger": !registrationIsOpen,
                    "btn-success": registrationIsOpen,
                  })}
                  onClick={() => toggleRegistration(registrationIsOpen)}
                >
                  {registrationIsOpen ? "Opened" : "Closed"}
                </button>
              </div>
            </div>
          </div>
        </li>
        <li className="list-group-item">
          <div className="widget-content p-0">
            <div className="widget-content-wrapper">
              <div className="widget-content-left">
                <div className="widget-heading">
                  Maintenance Status
                  <span className="widget-subheading">
                    {" "}
                    -{" "}
                    {maintenanceIsOpen
                      ? "Only Admin users are allowed to enter in the application."
                      : "All users can enter the application."}
                  </span>
                </div>
              </div>
              <div className="widget-content-right">
                <button
                  type="button"
                  className={cx("float-right mr-1 btn btn-shadow", {
                    "btn-danger": maintenanceIsOpen,
                    "btn-success": !maintenanceIsOpen,
                  })}
                  onClick={() => toggleMaintenance(maintenanceIsOpen)}
                >
                  {maintenanceIsOpen ? "Down for maintenance" : "All good"}
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ApplicationSettings;
