import cx from "classnames";
import { Department } from "../../../interfaces";
import {
  deleteDepartment,
  editDepartment,
  swalDeleteDepartmentMessage,
} from "./departmentManagementUtils";

type Props = {
  department: Department;
  setDepartmentInfo: Function;
  setIsDepartmentModalOpen: Function;
  setModalText: Function;
};

const DepartmentBlock = ({
  department,
  setDepartmentInfo,
  setIsDepartmentModalOpen,
  setModalText,
}: Props) => {
  return (
    <div className={"main-card mb-3 card"}>
      <div className="card-header">
        <i
          className={cx(
            "header-icon icon-gradient fa",
            department.icon,
            department.gradientColor
          )}
        ></i>
        {department.description}
        <div className="btn-actions-pane-right text-capitalize">
          <button
            onClick={() =>
              editDepartment(
                department,
                setIsDepartmentModalOpen,
                setDepartmentInfo,
                setModalText
              )
            }
            className="btn-wide btn-info mr-md-2 btn btn-sm"
          >
            <i className="fa fa-hammer text-white btn-icon-wrapper"></i> Edit
            Department
          </button>
          <button
            onClick={() =>
              swalDeleteDepartmentMessage(() => deleteDepartment(department))
            }
            className="btn-wide btn-danger mr-md-2 btn btn-sm"
          >
            <i className="fa fa-exclamation-triangle text-white btn-icon-wrapper"></i>{" "}
            Delete Department
          </button>
        </div>
      </div>
      <div className="pr-3 pl-3">
        <div className="row">
          <div className="col-2 department-border-right">
            <h4 className="p-2 department-title">Acronym</h4>
          </div>
          <div className="col-10 float-left text-dark">
            <div className="p-2">{department.acronym}</div>
          </div>
        </div>
        <div className="row">
          <div className="col-2 department-border-right">
            <h4 className="p-2 department-title">Description</h4>
          </div>
          <div className="col-10 float-left text-dark">
            <div className="p-2">{department.description}</div>
          </div>
        </div>
        <div className="row">
          <div className="col-2 department-border-right">
            <h4 className="p-2 department-title">Icon</h4>
          </div>
          <div className="col-10 float-left text-dark">
            <div className="p-2">
              <span className="pl-1 pr-2 department-icon">
                <i className={cx("fa", department.icon)}></i>{" "}
              </span>

              {department.icon}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-2 department-border-right">
            <h4 className="p-2 department-title">Color</h4>
          </div>
          <div className="col-10 float-left text-dark">
            <div className="p-2">
              {department.color}{" "}
              <span
                className={"p-1 department-color"}
                style={{ backgroundColor: department.color }}
              >
                {" "}
              </span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-2 department-border-right">
            <h4 className="p-2 department-title">Gradient Color</h4>
          </div>
          <div className="col-10 float-left text-dark">
            <div className="p-2">
              {department.gradientColor}
              <span
                className={cx("p-1 department-color", department.gradientColor)}
              >
                {" "}
              </span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-2 department-border-right">
            <h4 className="p-2 department-title">Positions</h4>
          </div>
          <div className="col-10 float-left text-dark">
            {department.positions &&
              department.positions.map((position, idx) => (
                <div key={idx} className="p-2">
                  {position}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentBlock;
