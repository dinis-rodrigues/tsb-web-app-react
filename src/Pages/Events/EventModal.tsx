// Modal components
import { Fragment } from "react";
import { Modal, Button } from "react-rainbow-components";
import { EventInformation } from "../../interfaces";

import { CounterInput, DatePicker, TimePicker } from "react-rainbow-components";

import Select from "react-select";

import { inputToDate } from "../../utils/generalFunctions";

import {
  selectStyles,
  inputHandler,
  counterHandler,
  dateHandler,
  timeHandler,
  durationHandler,
  selectHandler,
  getEventTypeOptions,
  timeForTimePicker,
  durationForTimePicker,
} from "./eventsUtils";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { UncontrolledTooltip } from "reactstrap";

type Props = {
  isModalOpen: boolean;
  currEventInfo: EventInformation;
  modalTitle: string;
  closeModal: Function;
  saveEvent: Function;
  deleteEvent: Function;
  setCurrEventInfo: Function;
  showDeleteEvent: boolean;
  disabledInput: boolean;
};
const EventModal = ({
  isModalOpen,
  currEventInfo,
  setCurrEventInfo,
  modalTitle,
  closeModal,
  saveEvent,
  deleteEvent,
  showDeleteEvent,
  disabledInput,
}: Props) => {
  const { departments, isDarkMode } = useAuth();
  const today = new Date();

  const eventTypeOptions = getEventTypeOptions(departments);
  return (
    <Fragment>
      <Modal
        className={
          isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
        }
        isOpen={isModalOpen}
        title={modalTitle}
        onRequestClose={() => {
          closeModal();
        }}
      >
        {/* Inputs for the event */}
        <div className="form-group row text-center">
          <div className="col-md-8">
            <span className="text-dark small text-uppercase">
              <strong>Title</strong>
            </span>
            <input
              value={currEventInfo.title || ""}
              onChange={(e) =>
                inputHandler(e, "title", currEventInfo, setCurrEventInfo)
              }
              disabled={disabledInput}
              type="text"
              className="form-control m-0"
              placeholder=""
            />
          </div>
          <div className="col-md-4">
            <span className="text-dark small text-uppercase">
              <strong>Periodic</strong>
            </span>
            <FontAwesomeIcon
              className="ml-2 opacity-8"
              icon={faQuestionCircle}
              id="Tooltip-1"
            />
            <CounterInput
              value={currEventInfo.weeks || 0}
              onChange={(e) =>
                counterHandler(e, "weeks", currEventInfo, setCurrEventInfo)
              }
              disabled={disabledInput}
              placeholder=""
            />
            <UncontrolledTooltip placement="top" target="Tooltip-1">
              Event repeats every X weeks
            </UncontrolledTooltip>
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Date</strong>
            </span>
            <DatePicker
              value={
                currEventInfo.date ? inputToDate(currEventInfo.date) : today
              }
              onChange={(value) =>
                dateHandler(value, "date", currEventInfo, setCurrEventInfo)
              }
              disabled={disabledInput}
              className={"datePicker"}
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Time</strong>
            </span>
            <TimePicker
              disabled={disabledInput}
              value={
                currEventInfo.hours && currEventInfo.minutes
                  ? timeForTimePicker(
                      currEventInfo.hours,
                      currEventInfo.minutes
                    )
                  : "12:00"
              }
              onChange={(value) =>
                timeHandler(value, currEventInfo, setCurrEventInfo)
              }
              okLabel={"Set"}
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              hour24
            />
          </div>
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Duration</strong>
            </span>
            <TimePicker
              disabled={disabledInput}
              value={
                currEventInfo.duration
                  ? durationForTimePicker(currEventInfo.duration)
                  : "1:00"
              }
              onChange={(value) =>
                durationHandler(value, currEventInfo, setCurrEventInfo)
              }
              okLabel={"Set"}
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              hour24
            />
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Type</strong>
            </span>
            <Select
              classNamePrefix="react-select-container"
              onChange={(e) =>
                selectHandler(e, "type", currEventInfo, setCurrEventInfo)
              }
              value={{
                value: currEventInfo && currEventInfo.type,
                label: currEventInfo && currEventInfo.type,
              }}
              placeholder={"Select Country"}
              options={eventTypeOptions}
              isDisabled={disabledInput}
              isSearchable={true}
              theme={(theme) => selectStyles(theme, disabledInput)}
              maxMenuHeight={150}
            />
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Additional Link</strong>
            </span>
            <input
              value={currEventInfo.link || ""}
              onChange={(e) =>
                inputHandler(e, "link", currEventInfo, setCurrEventInfo)
              }
              disabled={disabledInput}
              type="text"
              className="form-control m-0"
              placeholder="https:// ...."
            />
          </div>
        </div>
        <div className="form-group row text-center">
          <div className="col">
            <span className="text-dark small text-uppercase">
              <strong>Description</strong>
            </span>
            <input
              value={currEventInfo.description || ""}
              onChange={(e) =>
                inputHandler(e, "description", currEventInfo, setCurrEventInfo)
              }
              disabled={disabledInput}
              type="text"
              className="form-control m-0"
              placeholder="Location for example..."
            />
          </div>
        </div>
        <div className="divider"></div>
        <div className="row">
          <div className="col">
            {/* Edit and close button */}
            {showDeleteEvent && (
              <Button
                className={"m-1"} // margin
                variant="destructive"
                label="Delete"
                onClick={() => {
                  deleteEvent();
                }}
              />
            )}
          </div>
          <div className="col">
            <div className="float-right">
              {!disabledInput && (
                <Button
                  className={"m-1"}
                  variant="success"
                  label="Save"
                  onClick={() => {
                    saveEvent();
                  }}
                />
              )}
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

export default EventModal;
