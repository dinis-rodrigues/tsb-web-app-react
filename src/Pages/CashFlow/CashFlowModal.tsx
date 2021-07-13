import { Fragment } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import { Modal, Button, DatePicker } from "react-rainbow-components";
import Select from "react-select";
import { db } from "../../config/firebase";
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
  let flowData = { ...flowInfo, id: "" };
  if (flowInfo.id) {
    db.ref("private/finances/flow").child(flowInfo.id).set(flowData);
  } else {
    db.ref("private/finances/flow").push(flowData);
  }
  closeModal();
};

const deleteFlow = (flowInfo: Flow, closeModal: Function) => {
  if (!flowInfo.id) return;
  db.ref("private/finances/flow").child(flowInfo.id).remove();
  closeModal();
};
const inputHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  key: string,
  flowInfoMask: Flow | null,
  setFlowInfoMask: Function
) => {
  // console.log(flowInfoMask);
  let value = e.target.value;
  setFlowInfoMask({ ...flowInfoMask, [key]: value });
};

const valueHandler = (
  value: NumberFormatValues,
  flowInfoMask: Flow | null,
  setFlowInfoMask: Function
) => {
  setFlowInfoMask({ ...flowInfoMask, value: value.formattedValue });
};

const selectHandler = (
  value: string,
  key: string,
  flowInfoMask: Flow,
  setFlowInfoMask: Function
) => {
  setFlowInfoMask({ ...flowInfoMask, [key]: value });
};

const dateHandler = (
  date: Date,
  flowInfoMask: Flow | null,
  setFlowInfoMask: Function
) => {
  // saves the date as a portuguese format string
  let dateString = dateToString(date);
  setFlowInfoMask({ ...flowInfoMask, date: dateString });
};

const CashFlowModal = ({
  isModalOpen,
  closeModal,
  flowInfo,
  setFlowInfo,
  showDeleteButton,
}: Props) => {
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
    <Fragment>
      <Modal
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
              onChange={(e) =>
                inputHandler(e, "description", flowInfo, setFlowInfo)
              }
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
            <NumberFormat
              value={flowInfo ? flowInfo.value : ""}
              onValueChange={(value) =>
                valueHandler(value, flowInfo, setFlowInfo)
              }
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
            />
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col-md-6">
            <span className="text-dark small text-uppercase">
              <strong>Flow type</strong>
            </span>
            <Select
              className={"text-center"}
              onChange={(option) =>
                selectHandler(option!.value!, "type", flowInfo!, setFlowInfo)
              }
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
    </Fragment>
  );
};

export default CashFlowModal;
