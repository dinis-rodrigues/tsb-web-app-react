import { Button, Modal } from "react-rainbow-components";
import {
  Department,
  DepartmentModalText,
  Departments,
} from "../../../interfaces";
import DepartmentColorPicker from "./DepartmentColorPicker";
import Select from "react-select";
import {
  gradientColorOptions,
  closeDepartmentModal,
  saveDepartment,
  departmentInputHandler,
  handleDepartmentSelect,
  removePosition,
  editPosition,
  addPosition,
} from "./departmentManagementUtils";
import cx from "classnames";
import { useState } from "react";
import { UncontrolledTooltip } from "reactstrap";
import { useAuth } from "../../../contexts/AuthContext";

type Props = {
  issDepartmentModalOpen: boolean;
  departments: Departments;
  setIsDepartmentModalOpen: Function;
  departmentInfo: Department | undefined;
  setDepartmentInfo: Function;
  modalText: DepartmentModalText;
};

const DepartmentModal = ({
  departments,
  issDepartmentModalOpen,
  setIsDepartmentModalOpen,
  departmentInfo,
  setDepartmentInfo,
  modalText,
}: Props) => {
  const [newPosition, setNewPosition] = useState("");
  const { isDarkMode } = useAuth();
  return departmentInfo ? (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      isOpen={issDepartmentModalOpen}
      size="medium"
      title={modalText.title}
      onRequestClose={() => {
        closeDepartmentModal(setIsDepartmentModalOpen, setNewPosition);
      }}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button
              label="Cancel"
              onClick={() =>
                closeDepartmentModal(setIsDepartmentModalOpen, setNewPosition)
              }
            />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label={modalText.saveButton}
              onClick={() =>
                saveDepartment(
                  departmentInfo,
                  departments,
                  modalText,
                  setIsDepartmentModalOpen,
                  setNewPosition
                )
              }
            />
          </div>
        </div>
      }
    >
      <div className="form-group row text-center">
        <div
          className={cx({
            "col-md-9": modalText.creatingNewDepartment,
            "col-md-12": !modalText.creatingNewDepartment,
          })}
        >
          <span className="text-dark small text-uppercase">
            <strong>Description</strong>
          </span>
          <input
            value={departmentInfo.description ? departmentInfo.description : ""}
            onChange={(e) =>
              departmentInputHandler(e, "description", setDepartmentInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            maxLength={30}
          />
        </div>
        {modalText.creatingNewDepartment && (
          <div className="col-md-3">
            <span className="text-dark small text-uppercase">
              <strong>
                Acronym{" "}
                <i
                  id="depAcro"
                  className={cx("fa fa-question-circle text-muted")}
                ></i>
                <UncontrolledTooltip placement="top" target={"depAcro"}>
                  You will not be able to change this later
                </UncontrolledTooltip>
              </strong>
            </span>

            <input
              value={departmentInfo.acronym ? departmentInfo.acronym : ""}
              onChange={(e) =>
                departmentInputHandler(e, "acronym", setDepartmentInfo)
              }
              maxLength={2}
              type="text"
              className="form-control m-0 text-center"
            />
          </div>
        )}
      </div>
      <div className="form-group row text-center">
        <div className="col-md-3">
          <span className="text-dark small text-uppercase">
            <strong>
              Icon{" "}
              <a
                href="https://fontawesome.com/icons"
                target="_blank"
                rel="noreferrer"
                className="td-n text-muted"
              >
                <i id="faIcon" className={cx("fa fa-question-circle")}></i>
              </a>
              <UncontrolledTooltip placement="top" target={"faIcon"}>
                Click to view possible icons
              </UncontrolledTooltip>
            </strong>
          </span>
          <input
            value={departmentInfo.icon ? departmentInfo.icon : ""}
            onChange={(e) =>
              departmentInputHandler(e, "icon", setDepartmentInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
        <div className="col-md-3">
          <span className="text-dark small text-uppercase">
            <strong>Selected Icon</strong>
          </span>
          <span className={cx("form-control text-center")}>
            <i
              className={cx(
                "header-icon icon-gradient fa",
                departmentInfo.icon,
                departmentInfo.gradientColor
              )}
            ></i>
          </span>
        </div>
        <div className="col-md-3">
          <span className="text-dark small text-uppercase">
            <strong>
              Color{" "}
              <i
                id="depColor"
                className={cx("fa fa-question-circle text-muted")}
              ></i>
              <UncontrolledTooltip placement="top" target={"depColor"}>
                Primarily for the calendar events
              </UncontrolledTooltip>
            </strong>
          </span>
          <span className="form-control text-center">
            {departmentInfo.color}
          </span>
        </div>
        <div className="col-md-3">
          <span className="text-dark small text-uppercase ">
            <strong>Choose Color</strong>
          </span>
          <DepartmentColorPicker
            setDepartmentInfo={setDepartmentInfo}
            departmentColor={departmentInfo.color}
          />
        </div>
      </div>
      <div className="form-group row text-center">
        <div className="col-md-6">
          <span className="text-dark small text-uppercase">
            <strong>Gradient Samples</strong>
          </span>
          <Select
            classNamePrefix="react-select-container"
            onChange={(e) => handleDepartmentSelect(e, setDepartmentInfo)}
            options={gradientColorOptions}
            placeholder="Select gradient"
            value={{
              value: departmentInfo && departmentInfo.gradientColor,
              label: departmentInfo && departmentInfo.gradientColor,
            }}
            menuPortalTarget={document.body}
            maxMenuHeight={150}
            styles={{
              // Fixes the overlapping problem of the component with the datepicker
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
              menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
          />
        </div>
        <div className="col-md-6">
          <span className="text-dark small text-uppercase">
            <strong>Selected gradient</strong>
          </span>
          <span
            className={cx(
              "form-control text-center",
              departmentInfo.gradientColor
            )}
          ></span>
        </div>
      </div>
      <div className="form-group row text-center">
        <div className="col-md-6">
          <span className="text-dark small text-uppercase">
            <strong>Current Positions</strong>
          </span>
          {departmentInfo.positions &&
            departmentInfo.positions.map((position, idx) => (
              <div key={idx} className=" form-inline form-control mb-2">
                <div
                  contentEditable="true"
                  onInput={(e) => {
                    if (e.currentTarget.textContent) {
                      position = e.currentTarget.textContent;
                    }
                  }}
                  onBlur={() => {
                    editPosition(
                      position,
                      idx,
                      departmentInfo,
                      setDepartmentInfo
                    );
                  }}
                  // on finish change editPosition(
                  //       position,
                  //       idx,
                  //       departmentInfo,
                  //       setDepartmentInfo
                  //     );
                  className="col-md-10 align-self-center"
                >
                  {position}
                </div>
                <span
                  className={"float-right cursor-pointer offset-0 text-danger"}
                  onClick={() =>
                    removePosition(departmentInfo, position, setDepartmentInfo)
                  }
                >
                  <i className="fa fa-times"></i>
                </span>
              </div>
            ))}
        </div>
        <div className="col-md-6">
          <span className="text-dark small text-uppercase">
            <strong>Add Position</strong>
          </span>
          <input
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            type="text"
            className="form-control m-0 mb-2 text-center"
            placeholder=""
          />
          <div className="col" style={{ padding: 0 }}>
            <button
              className="btn-icon btn-icon-only btn btn-outline-success w-100"
              onClick={() =>
                addPosition(
                  newPosition,
                  departmentInfo,
                  setNewPosition,
                  setDepartmentInfo
                )
              }
            >
              <i className="fas fa-plus btn-icon-wrapper"> </i>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  ) : null;
};

export default DepartmentModal;
