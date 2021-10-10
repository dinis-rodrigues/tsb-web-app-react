import cx from "classnames";
import NumberFormat from "react-number-format";
import Select from "react-select";
import { inputToDate } from "../../utils/generalFunctions";
import { DatePicker } from "react-rainbow-components";
import {
  mbWayOptions,
  coursesOptions,
  selectStyles,
  curricularYearOptions,
  countryOptions,
  formatCoursesLabel,
  handleSelectDepartment,
  handleInput,
  handleSelect,
  handleDate,
  handleInputMask,
  getDepartmentOptions,
} from "./profileUtils";
import { PersonalInformation, userContext } from "../../interfaces";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  info: PersonalInformation;
  prevInfo: PersonalInformation;
  user: userContext | null;
  croppie: Croppie | undefined;
  selectPositions: any;
  disabledInput: boolean;
  setInfo: Function;
  editInformation: Function;
  saveInformation: Function;
  discardInformation: Function;
  setSelectPositions: Function;
  setDisabledInput: Function;
  setPrevInfo: Function;
  setCroppie: Function;
  setShowSaveImg: Function;
};

const PersonalInformationOptions = ({
  info,
  prevInfo,
  user,
  croppie,
  selectPositions,
  disabledInput,
  editInformation,
  saveInformation,
  discardInformation,
  setInfo,
  setDisabledInput,
  setPrevInfo,
  setCroppie,
  setShowSaveImg,
  setSelectPositions,
}: Props) => {
  const { departments } = useAuth();
  const today = new Date();
  const departmentOptions = getDepartmentOptions(departments);

  return (
    <li className="list-group-item">
      <div className="widget-content text-center">
        <h5 className="widget-heading opacity-4">Personal Information</h5>
        <div className="form-group">
          <input
            value={info.fullName || ""}
            onChange={(e) => handleInput(e, "fullName", setInfo)}
            disabled={disabledInput}
            type="text"
            className="form-control text-center"
            placeholder="Name"
          />
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
                  user,
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
              isDisabled={disabledInput}
              theme={(theme) => selectStyles(theme, disabledInput)}
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
              isDisabled={disabledInput}
              options={selectPositions}
              placeholder="Select positition"
              value={{
                value: info && info.position,
                label: info && info.position,
              }}
              theme={(theme) => selectStyles(theme, disabledInput)}
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
              disabled={disabledInput}
              className={"datePicker"}
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
              disabled={disabledInput}
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
              disabled={disabledInput}
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
              isDisabled={disabledInput}
              theme={(theme) => selectStyles(theme, disabledInput)}
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
              disabled={disabledInput}
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
              isDisabled={disabledInput}
              isSearchable={true}
              formatGroupLabel={formatCoursesLabel}
              theme={(theme) => selectStyles(theme, disabledInput)}
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
              isDisabled={disabledInput}
              theme={(theme) => selectStyles(theme, disabledInput)}
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
              disabled={disabledInput}
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
              disabled={disabledInput}
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
              disabled={disabledInput}
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
              isDisabled={disabledInput}
              isSearchable={true}
              theme={(theme) => selectStyles(theme, disabledInput)}
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
              disabled={disabledInput}
              className={"datePicker"}
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
              disabled={disabledInput}
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
              disabled={disabledInput}
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
              disabled={disabledInput}
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
            disabled={disabledInput}
            className="form-control text-center"
            format="PT50 #### #### ########### ##"
            mask="_"
            allowEmptyFormatting
          />
        </div>
        <h6>Linkedin</h6>
        <div className="form-group">
          <input
            value={info.linkedin || ""}
            onChange={(e) => handleInput(e, "linkedin", setInfo)}
            type="text"
            className="form-control m-0"
            disabled={disabledInput}
            placeholder="https://www.linkedin/in/dinis-rodrigues"
          />
        </div>
        <h6>Description / Bio</h6>
        <div className="form-group">
          <input
            value={info.description || ""}
            onChange={(e) => handleInput(e, "description", setInfo)}
            type="text"
            className="form-control m-0"
            disabled={disabledInput}
            placeholder="I joined TSB because... Previously I was Team Member but now I'm Y. I like football..."
          />
        </div>
        <hr />

        <div className="layers">
          <div className="layer w-100">
            <button
              className={cx("btn btn-primary btn-user btn-block", {
                "invisible-none": !disabledInput,
              })}
              type="button"
              onClick={() => editInformation(setDisabledInput)}
            >
              <i className="fa fa-edit fa-fw"></i>
              Edit Information
            </button>
          </div>
          <div className="layer w-100">
            <button
              className={cx("btn btn-success btn-user btn-block", {
                "invisible-none": disabledInput,
              })}
              type="button"
              onClick={() =>
                saveInformation(
                  user,
                  info,
                  croppie,
                  setDisabledInput,
                  setPrevInfo,
                  setCroppie,
                  setShowSaveImg
                )
              }
            >
              <i className="fas fa-check fa-fw"></i>
              Save Changes
            </button>
            <button
              className={cx("btn btn-danger btn-user btn-block", {
                "invisible-none": disabledInput,
              })}
              type="button"
              onClick={() =>
                discardInformation(
                  prevInfo,
                  croppie,
                  setDisabledInput,
                  setInfo,
                  setCroppie,
                  setShowSaveImg
                )
              }
            >
              <i className="fas fa-times fa-fw"></i>
              Discard Changes
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default PersonalInformationOptions;
