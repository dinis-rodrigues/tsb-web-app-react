import cx from "classnames";
import { off, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { CheckboxGroup } from "react-rainbow-components";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { selectOption } from "../../interfaces";
import {
  createNewSqlAndDbTable,
  generateRecruitmentTable,
  getDepartmentOptions,
  getOpenedDepartments,
  openDepartmentsHandler,
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
  const { departments, USER } = useAuth();
  const tableToCreate = generateRecruitmentTable();
  let allowToCreate = false;
  tablesList && tableToCreate === tablesList[tablesList.length - 1]
    ? (allowToCreate = false)
    : (allowToCreate = true);

  const [openDepartments, setOpenDepartments] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<selectOption[]>(
    []
  );
  useEffect(() => {
    getDepartmentOptions(departments, setDepartmentOptions);
    getOpenedDepartments(setOpenDepartments);
    return () => {
      off(ref(db, "public/recruitment/openDepartments"));
    };
  }, [departments]);

  return (
    <div className="main-card mb-3 card">
      <div className="card-header">
        <i className="header-icon lnr-cog icon-gradient bg-plum-plate"></i>
        Recruitment Settings{" "}
        {/* <span className={"badge badge-danger ml-2"}>
          MOCK SETTINGS FOR FUTURE IMPLEMENTATION
        </span> */}
        {/* <button onClick={() => buildUserNames()}>Build usernames</button> */}
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
                      : `Users are NOT allowed to apply to "${
                          tablesList[tablesList.length - 1]
                        }"`}
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
          <div className="widget-content p-1">
            <div className="widget-content-wrapper">
              <div className="widget-content-left">
                <div className="widget-heading">
                  Opened Departments
                  <span className="widget-subheading">
                    {" "}
                    - Select which departments users are allowed to apply
                  </span>
                </div>
              </div>
              <div className="widget-content-right">
                <span
                  className="d-inline-block pt-1"
                  style={{ position: "absolute", top: "-30%", right: "0" }}
                >
                  <CheckboxGroup
                    id="checkbox-group-2"
                    options={departmentOptions}
                    value={openDepartments}
                    orientation={"horizontal"}
                    onChange={(values) =>
                      openDepartmentsHandler(values, departments)
                    }
                  />
                </span>
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
                  onClick={() => createNewSqlAndDbTable(tablesList, USER?.id)}
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
