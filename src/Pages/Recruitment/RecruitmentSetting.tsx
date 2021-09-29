import cx from "classnames";
import {
  generateRecruitmentTable,
  toggleRegistration,
} from "./recruitmentUtils";

type Props = {
  tableName: string | boolean;
  tablesList: string[];
  activeRecruitment: string | boolean;
  setActiveRecruitment: Function;
};
const RecruitmentSettings = ({
  tableName,
  tablesList,
  activeRecruitment,
  setActiveRecruitment,
}: Props) => {
  const tableToCreate = generateRecruitmentTable();

  let allowToCreate = false;
  tablesList && tableToCreate === tablesList[0]
    ? (allowToCreate = false)
    : (allowToCreate = true);

  return (
    <div className="main-card mb-3 card">
      <div className="card-header">
        <i className="header-icon lnr-cog icon-gradient bg-plum-plate"></i>
        Recruitment Settings
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
                  Recruitment Status {}
                  <span className="widget-subheading">
                    {" "}
                    -{" "}
                    {activeRecruitment
                      ? `Users are allowed to apply to "${activeRecruitment}"`
                      : "Users are NOT allowed to apply"}
                  </span>
                </div>
              </div>
              <div className="widget-content-right">
                <button
                  type="button"
                  className={cx("float-right mr-1 btn btn-shadow", {
                    "btn-danger": !activeRecruitment,
                    "btn-success": activeRecruitment,
                  })}
                  onClick={() =>
                    toggleRegistration(tablesList, activeRecruitment)
                  }
                >
                  {activeRecruitment ? "Opened" : "Closed"}
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
                  Create New Recruitment Table
                  <span className="widget-subheading">
                    {" "}
                    -{" "}
                    {allowToCreate
                      ? `A new table called "${generateRecruitmentTable()}" will be created`
                      : `A new table "${tableToCreate}" was already created`}
                  </span>
                </div>
              </div>
              <div className="widget-content-right">
                <button
                  type="button"
                  className={cx("float-right mr-1 btn btn-shadow", {
                    "btn-danger": !allowToCreate,
                    "btn-success": allowToCreate,
                  })}
                  //   onClick={() => toggleMaintenance(true)}
                >
                  {allowToCreate ? "Create" : "Not allowed"}
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default RecruitmentSettings;
