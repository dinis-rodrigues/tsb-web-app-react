import Select from "react-select";
import { Button, DatePicker, Modal } from "react-rainbow-components";
import { PersonalInformation } from "../../../interfaces";
import {
  handleSelectDepartment,
  handleInput,
  handleDate,
  selectStyles,
  handleSelect,
  mbWayOptions,
  formatCoursesLabel,
  coursesOptions,
  curricularYearOptions,
  countryOptions,
  handleInputMask,
  handleInTeamSelect,
  getDepartmentOptions,
} from "../../Profile/profileUtils";
import { inputToDate } from "../../../utils/generalFunctions";
import NumberFormat from "react-number-format";
import { saveUserInfo } from "./userManagementUtils";
import { useAuth } from "../../../contexts/AuthContext";

type Props = {
  modalIsOpen: boolean;
  info: PersonalInformation;
  selectPositions: any;
  modalTitle: string;
  setSelectPositions: Function;
  setModalIsOpen: Function;
  setInfo: Function;
};
const UserManagementModal = ({
  setModalIsOpen,
  modalIsOpen,
  modalTitle,
  selectPositions,
  info,
  setInfo,
  setSelectPositions,
}: Props) => {
  const { departments, USER } = useAuth();
  const today = new Date();
  const departmentOptions = getDepartmentOptions(departments);
  return (
    <Modal
      size="large"
      isOpen={modalIsOpen}
      title={modalTitle}
      onRequestClose={() => {
        setModalIsOpen(false);
      }}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button label="Cancel" onClick={() => setModalIsOpen(false)} />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Save"
              onClick={() => saveUserInfo(info, setModalIsOpen)}
            />
          </div>
        </div>
      }
    >
      <div className="widget-content text-center">
        <h5 className="widget-heading opacity-4">Personal Information</h5>
        <div className="form-group row">
          <div className="col-8">
            <span className="text-dark small text-uppercase">
              <strong>Full Name</strong>
            </span>
            <input
              value={info.fullName || ""}
              onChange={(e) => handleInput(e, "fullName", setInfo)}
              type="name"
              className="form-control text-center"
              placeholder="Name"
            />
          </div>
          <div className="col-4">
            <span className="text-dark small text-uppercase">
              <strong>In Team</strong>
            </span>
            <Select
              onChange={(e) => handleInTeamSelect(e, setInfo)}
              value={{
                value: info && info.inTeam ? "true" : "false",
                label: info && info.inTeam ? "Yes" : "No",
              }}
              placeholder={"Is user in Team?"}
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Department</strong>
            </span>
            <Select
              onChange={(e) =>
                handleSelectDepartment(
                  e,
                  "department",
                  USER,
                  setSelectPositions,
                  setInfo
                )
              }
              value={{
                value: info && info.department,
                label: info && info.department,
              }}
              placeholder={"Select Department"}
              options={departmentOptions}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Position</strong>
            </span>
            <Select
              onChange={(e) => handleSelect(e, "position", setInfo)}
              options={selectPositions}
              placeholder="Select positition"
              value={{
                value: info && info.position,
                label: info && info.position,
              }}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Joined in</strong>
            </span>
            <DatePicker
              value={info ? inputToDate(info.joinedIn!) : today}
              onChange={(value) => handleDate(value, "joinedIn", setInfo)}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Email</strong>
            </span>
            <input
              value={info.email || ""}
              onChange={(e) => handleInput(e, "email", setInfo)}
              type="email"
              className="form-control m-0"
              placeholder="Email"
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Phone Number</strong>
            </span>
            <NumberFormat
              value={info.phone || ""}
              onValueChange={(e) => handleInputMask(e, "phone", setInfo)}
              className="form-control text-center"
              format={"### ### ###"}
              mask="_"
              allowEmptyFormatting
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>MBWay</strong>
            </span>
            <Select
              onChange={(e) => handleSelect(e, "mbway", setInfo)}
              value={{
                value: info && info.mbway,
                label: info && info.mbway,
              }}
              placeholder={"Yes or No?"}
              options={mbWayOptions}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>University</strong>
            </span>
            <input
              value={info.university || ""}
              onChange={(e) => handleInput(e, "university", setInfo)}
              type="text"
              className="form-control m-0"
              placeholder="University"
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Degree</strong>
            </span>
            <Select
              onChange={(e) => handleSelect(e, "degree", setInfo)}
              value={{
                value: info && info.degree,
                label: info && info.degree,
              }}
              placeholder={"Select"}
              options={coursesOptions}
              isSearchable={true}
              formatGroupLabel={formatCoursesLabel}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Curricular year</strong>
            </span>
            <Select
              onChange={(e) => handleSelect(e, "curricularYear", setInfo)}
              value={{
                value: info ? info.curricularYear : "1",
                label: info ? info.curricularYear : "1",
              }}
              placeholder={"Select"}
              options={curricularYearOptions}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Student id</strong>
            </span>
            <input
              value={info.studentId || ""}
              onChange={(e) => handleInput(e, "studentId", setInfo)}
              type="text"
              className="form-control m-0"
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>ID Card number</strong>
            </span>
            <input
              value={info.idCard || ""}
              onChange={(e) => handleInput(e, "idCard", setInfo)}
              type="text"
              className="form-control m-0"
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>NIF (niss)</strong>
            </span>
            <input
              value={info.nif || ""}
              onChange={(e) => handleInput(e, "nif", setInfo)}
              type="text"
              className="form-control m-0"
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Country</strong>
            </span>
            <Select
              onChange={(e) => handleSelect(e, "country", setInfo)}
              value={{
                value: info && info.country,
                label: info && info.country,
              }}
              placeholder={"Select Country"}
              options={countryOptions}
              isSearchable={true}
              theme={(theme) => selectStyles(theme, false)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Birth Date</strong>
            </span>
            <DatePicker
              value={info ? inputToDate(info.birth!) : today}
              onChange={(value) => handleDate(value, "birth", setInfo)}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-7">
            <span className="text-dark small text-uppercase">
              <strong>Address</strong>
            </span>
            <input
              value={info.address || ""}
              onChange={(e) => handleInput(e, "address", setInfo)}
              type="text"
              className="form-control m-0"
              placeholder="Address"
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>City</strong>
            </span>
            <input
              value={info.city || ""}
              onChange={(e) => handleInput(e, "city", setInfo)}
              type="text"
              className="form-control m-0"
              placeholder="City"
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>ZIP Code</strong>
            </span>
            <input
              value={info.zip || ""}
              onChange={(e) => handleInput(e, "zip", setInfo)}
              type="text"
              className="form-control m-0"
              placeholder="ZIP"
            />
          </div>
        </div>
        <span className="text-dark small text-uppercase">
          <strong>IBAN</strong>
        </span>
        <div className="form-group">
          <NumberFormat
            value={info.iban || ""}
            onValueChange={(e) => handleInputMask(e, "iban", setInfo)}
            className="form-control text-center"
            format="PT50 #### #### #### #### ##"
            mask="_"
            allowEmptyFormatting
          />
        </div>
        <h6>Linkedin</h6>
        <div className="form-group">
          <input
            value={info.linkedin || ""}
            onChange={(e) => handleInput(e, "linkedin", setInfo)}
            type="name"
            className="form-control m-0"
            placeholder="https://www.linkedin/in/dinis-rodrigues"
          />
        </div>
      </div>
    </Modal>
  );
};

export default UserManagementModal;
