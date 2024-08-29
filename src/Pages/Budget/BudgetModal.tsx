import { useState } from "react";
import { NumericFormat } from "react-number-format";
import { Button, CounterInput, DatePicker, Drawer } from "react-rainbow-components";
import Select, { components } from "react-select";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import AppModalComment from "../../components/AppModalComment/AppModalComment";
import { useAuth } from "../../contexts/AuthContext";
import { BomMaterial, UserMetadata, selectOption, userContext } from "../../interfaces";
import { inputToDate } from "../../utils/generalFunctions";
import {
  assignToHandler,
  commentTextHandler,
  counterHandler,
  dateHandler,
  deleteMaterial,
  forDepartmentHandler,
  getBudgetDepartmentOptions,
  inputBudgetModalHandler,
  saveMaterial,
  statusHandler,
  statusSelectOptions,
  submitComment,
  swalBomDeleteMessage,
  valueHandler,
} from "./budgetUtils";

type Props = {
  materialInfo: BomMaterial;
  materialInfoMask: BomMaterial;
  isModalOpen: boolean;
  setMaterialInfo: Function;
  setMaterialInfoMask: Function;
  showDeleteButton: boolean;
  closeModal: Function;
  assignToOptions: selectOption[];
  usersMetadata: UserMetadata;
  user: userContext | null;
  season: string;
};

// Displayed option in user Assignment
const Option = (props: any, usersMetadata: UserMetadata) => {
  const { value, label } = props.data;
  return (
    <components.Option {...props}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <AvatarOverlap
          users={[value]}
          usersMetadata={usersMetadata}
          size={"sm"}
          rounded={false}
          withTooltip={false}
        />
        <span className={"ml-1"}>{label}</span>
      </div>
    </components.Option>
  );
};

const BudgetModal = ({
  materialInfo,
  materialInfoMask,
  isModalOpen,
  setMaterialInfo,
  setMaterialInfoMask,
  showDeleteButton,
  closeModal,
  assignToOptions,
  usersMetadata,
  user,
  season,
}: Props) => {
  const today = new Date();
  const [commentText, setCommentText] = useState("");
  const { departments, isDarkMode } = useAuth();
  const departmentSelectOptions = getBudgetDepartmentOptions(departments);

  return (
    <Drawer
      className={isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"}
      header={"Material Information"}
      onRequestClose={() => closeModal()}
      size={"medium"}
      isOpen={isModalOpen}
      slideFrom={"right"}
      footer={
        <div className="row justify-content-sm-center">
          {showDeleteButton && (
            <div className="mr-1">
              <Button
                variant="destructive"
                label="Delete"
                onClick={() =>
                  swalBomDeleteMessage(() =>
                    deleteMaterial(materialInfo, materialInfoMask, closeModal, season),
                  )
                }
              />
            </div>
          )}
          <div className="mr-1">
            <Button label="Cancel" onClick={() => closeModal()} />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Save"
              onClick={() => saveMaterial(materialInfo, materialInfoMask, user, closeModal, season)}
            />
          </div>
        </div>
      }
    >
      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Description</strong>
            </span>
          </label>

          <input
            value={materialInfo ? materialInfo.description : ""}
            onChange={(e) =>
              inputBudgetModalHandler(e, "description", materialInfo, setMaterialInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            placeholder="Material.."
          />
        </div>
        <div className="col-md-5">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-city"></i>
              <strong> From</strong>
            </span>
          </label>

          <input
            value={materialInfo ? materialInfo.from : ""}
            onChange={(e) => inputBudgetModalHandler(e, "from", materialInfo, setMaterialInfo)}
            type="text"
            className="form-control m-0 text-center"
            placeholder="Company..."
          />
        </div>
      </div>

      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="pr-2 text-dark small text-uppercase">
              <i className="fas fa-cubes"></i>
              <strong> Quantity</strong>
            </span>
          </label>
          <CounterInput
            value={materialInfo.quantity || 0}
            onChange={(e) => counterHandler(e, setMaterialInfo, materialInfo)}
            placeholder=""
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-money-bill-alt"></i>
              <strong> Unitary Value</strong>
            </span>
          </label>

          <NumericFormat
            value={materialInfo ? materialInfo.unitaryValue : ""}
            onValueChange={(value) =>
              valueHandler(value, materialInfo, setMaterialInfo, "unitaryValue")
            }
            decimalScale={2}
            fixedDecimalScale={true}
            suffix={" €"}
            thousandSeparator={true}
            className="form-control text-center"
            placeholder="  €"
          />
        </div>
        <div className="col">
          <label>
            <span className="pr-2 text-dark small text-uppercase">
              <i className="fas fa-wallet"></i>
              <strong> Total</strong>
            </span>
          </label>
          <NumericFormat
            value={materialInfo ? materialInfo.totalValue : ""}
            onValueChange={(value) =>
              valueHandler(value, materialInfo, setMaterialInfo, "totalValue")
            }
            decimalScale={2}
            fixedDecimalScale={true}
            suffix={" €"}
            thousandSeparator={true}
            className="form-control text-center"
            placeholder="  €"
          />
        </div>
      </div>
      <div className="form-group row text-center">
        <div className="col-md-8">
          {/* User assignment */}

          <label>
            <span className="pr-2 text-dark small text-uppercase">
              <i className="fas fa-user"></i>
              <strong> Assign To</strong>
            </span>
          </label>
          <Select
            classNamePrefix="react-select-container"
            options={assignToOptions}
            value={materialInfo.assignedTo || []}
            onChange={(selected) => {
              assignToHandler(selected, materialInfo, setMaterialInfo);
            }}
            styles={{
              // Fixes the overlapping problem of the component with the datepicker
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            components={{ Option }} // usersMetadata is automatically passed into here
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-calendar-day"></i>
              <strong> Date</strong>
            </span>
          </label>

          <DatePicker
            value={materialInfo ? inputToDate(materialInfo.date) : today}
            isCentered={true}
            onChange={(value) => dateHandler(value, materialInfo, setMaterialInfo)}
            className={"datePicker"}
          />
        </div>
      </div>
      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-exclamation-circle"></i>
              <strong> Status</strong>
            </span>
          </label>

          <Select
            classNamePrefix="react-select-container"
            options={statusSelectOptions}
            value={
              {
                value: materialInfo.status,
                label: materialInfo.status,
              } || []
            }
            onChange={(selected) => {
              statusHandler(selected, materialInfo, setMaterialInfo);
            }}
            styles={{
              // Fixes the overlapping problem of the component with the datepicker
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
          />
        </div>
        <div className="col">
          <label>
            <span className="pr-2 text-dark small text-uppercase">
              <i className="fas fa-users"></i>
              <strong> For</strong>
            </span>
          </label>
          <Select
            classNamePrefix="react-select-container"
            options={departmentSelectOptions}
            value={
              {
                value: materialInfo.toDepartment,
                label: materialInfo.toDepartment,
              } || []
            }
            onChange={(selected) => {
              forDepartmentHandler(selected, materialInfo, setMaterialInfo);
            }}
            styles={{
              // Fixes the overlapping problem of the component with the datepicker
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
          />
        </div>
      </div>
      <h4 className="modal-heading">
        <span className="pr-2 opacity-6">
          <i className="fas fa-comment-alt"></i>
        </span>
        Comments
      </h4>
      <div className="p-1">
        {materialInfo && materialInfo.comments && user ? (
          Object.keys(materialInfo.comments).map((key, idx) => {
            if (!materialInfo.comments) return "";
            const currComment = materialInfo.comments[key];
            return (
              <AppModalComment
                key={key}
                comment={currComment}
                USER={user}
                usersMetadata={usersMetadata}
              />
            );
          })
        ) : (
          <div className="text-center opacity-6">Be the first to comment!</div>
        )}
      </div>
      {/* Add comment input */}
      <div className="search-wrapper active w-100">
        <div className="input-holder w-100">
          <input
            type="text"
            className="search-input"
            placeholder="Type to comment"
            value={commentText}
            onChange={(e) => commentTextHandler(e, setCommentText)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                submitComment(commentText, user, season, materialInfo, setCommentText);
              }
            }}
          />
          <button
            type="button"
            className="send-icon"
            onClick={() => submitComment(commentText, user, season, materialInfo, setCommentText)}
          >
            <span></span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default BudgetModal;
