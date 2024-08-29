import { push, ref, remove, set } from "firebase/database";
import { NumberFormatValues, NumericFormat } from "react-number-format";
import { Button, DatePicker, Modal } from "react-rainbow-components";
import Select from "react-select";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Flow } from "../../interfaces";
import { dateToString, inputToDate } from "../../utils/generalFunctions";

type Props = {
  isModalOpen: boolean;
  closeModal: Function;
  flowInfo: Flow | null;
  setFlowInfo: Function;
  showDeleteButton: boolean;
};

const saveFlow = (flowInfo: Flow, closeModal: Function) => {
  const flowData = { ...flowInfo, id: "" };
  if (flowInfo.id) {
    set(ref(db, `private/finances/flow/${flowInfo.id}`), flowInfo);
  } else {
    push(ref(db, "private/finances/flow"), flowData);
  }
  closeModal();
};

const deleteFlow = (flowInfo: Flow, closeModal: Function) => {
  if (!flowInfo.id) return;
  remove(ref(db, `private/finances/flow/${flowInfo.id}`));
  closeModal();
};
const inputHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  key: string,
  flowInfoMask: Flow | null,
  setFlowInfoMask: Function,
) => {
  const value = e.target.value;
  setFlowInfoMask({ ...flowInfoMask, [key]: value });
};

const valueHandler = (
  value: NumberFormatValues,
  flowInfoMask: Flow | null,
  setFlowInfoMask: Function,
) => {
  setFlowInfoMask({ ...flowInfoMask, value: value.formattedValue });
};

const selectHandler = (
  value: string,
  key: string,
  flowInfoMask: Flow,
  setFlowInfoMask: Function,
) => {
  setFlowInfoMask({ ...flowInfoMask, [key]: value });
};

const dateHandler = (date: Date, flowInfoMask: Flow | null, setFlowInfoMask: Function) => {
  // saves the date as a portuguese format string
  const dateString = dateToString(date);
  setFlowInfoMask({ ...flowInfoMask, date: dateString });
};

const CashFlowModal = ({
  isModalOpen,
  closeModal,
  flowInfo,
  setFlowInfo,
  showDeleteButton,
}: Props) => {
  const { isDarkMode } = useAuth();
  const today = new Date();
  const flowTypeOptions = [
    { value: "Income", label: "Income" },
    { value: "Expense", label: "Expense" },
  ];
  const flowAccountOptions = [
    { value: "Santander", label: "Santander" },
    { value: "IDMEC", label: "IDMEC" },
  ];

  return (
    <>
      <Modal
        className={isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"}
        isOpen={isModalOpen}
        title="Flow"
        onRequestClose={() => {
          closeModal();
        }}
      >
        <div className="form-group row text-center">
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>Title</strong>
            </span>
            <input
              value={flowInfo ? flowInfo.description : ""}
              onChange={(e) => inputHandler(e, "description", flowInfo, setFlowInfo)}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>From/to</strong>
            </span>
            <input
              value={flowInfo ? flowInfo.entity : ""}
              onChange={(e) => inputHandler(e, "entity", flowInfo, setFlowInfo)}
              type="text"
              className="form-control m-0 text-center"
              placeholder=""
            />
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>Value</strong>
            </span>
            <NumericFormat
              value={flowInfo ? flowInfo.value : ""}
              onValueChange={(value) => valueHandler(value, flowInfo, setFlowInfo)}
              decimalScale={2}
              fixedDecimalScale={true}
              suffix={" €"}
              thousandSeparator={true}
              className="form-control text-center"
            />
          </div>
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>Date</strong>
            </span>
            <DatePicker
              value={flowInfo ? inputToDate(flowInfo.date) : today}
              isCentered={true}
              onChange={(value) => dateHandler(value, flowInfo, setFlowInfo)}
              className={"datePicker"}
            />
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>Flow type</strong>
            </span>
            <Select
              classNamePrefix="react-select-container"
              className={"text-center"}
              onChange={(option) => selectHandler(option!.value!, "type", flowInfo!, setFlowInfo)}
              value={{
                value: flowInfo && flowInfo.type ? flowInfo.type : "",
                label: flowInfo && flowInfo.type ? flowInfo.type : "",
              }}
              placeholder={"Type..."}
              options={flowTypeOptions}
            />
          </div>
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>Account</strong>
            </span>
            <Select
              classNamePrefix="react-select-container"
              onChange={(option) =>
                selectHandler(option!.value!, "account", flowInfo!, setFlowInfo)
              }
              value={{
                value: flowInfo && flowInfo.account,
                label: flowInfo && flowInfo.account,
              }}
              placeholder={"Account..."}
              options={flowAccountOptions}
            />
          </div>
        </div>
        <div className="divider"></div>
        <div className="row">
          <div className="col">
            {/* Edit and close button */}
            {showDeleteButton && (
              <Button
                className={"m-1"} // margin
                variant="destructive"
                label="Delete"
                onClick={() => {
                  deleteFlow(flowInfo!, closeModal);
                }}
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              <Button
                className={"m-1"}
                variant="success"
                label="Save"
                onClick={() => {
                  saveFlow(flowInfo!, closeModal);
                }}
              />

              <Button
                className={"m-1"}
                variant="neutral"
                label="Close"
                onClick={() => {
                  closeModal();
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CashFlowModal;
