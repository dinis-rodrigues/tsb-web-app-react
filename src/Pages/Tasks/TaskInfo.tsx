import { Drawer, DatePicker, Button } from "react-rainbow-components";
import { useState } from "react";
import ReactQuill from "react-quill"; // Typescript
import "react-quill/dist/quill.bubble.css";

import Select, { components } from "react-select";
import {
  taskPriorityOptions,
  submitComment,
  priorityHandler,
  dateHandler,
  assignToHandler,
  titleHandler,
  descriptionHandler,
  saveTask,
  deleteTask,
  saveTaskAsEvent,
} from "./tasksUtils";
import { inputToDate } from "../../utils/generalFunctions";
import {
  selectOption,
  UserMetadata,
  taskShape,
  userContext,
  columnsShape,
} from "../../interfaces";

import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import AppModalComment from "../../components/AppModalComment/AppModalComment";
import { useAuth } from "../../contexts/AuthContext";
import { defaultEventInfo, saveEvent } from "../Events/eventsUtils";

type Props = {
  isDrawerOpen: boolean;
  drawerOpenHandler: Function;
  departmentBoard: string;
  currBoard: string;
  columns: columnsShape;
  userOptions: selectOption[];
  usersMetadata: UserMetadata;
  taskInfo: taskShape;
  modalTask: taskShape;
  setModalTask: Function;
  currTaskNum: number;
  currTaskColumn: string;
  user: userContext | null;
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

const TaskInfo = ({
  isDrawerOpen,
  drawerOpenHandler,
  departmentBoard,
  currBoard,
  columns,
  userOptions,
  usersMetadata,
  taskInfo,
  modalTask,
  setModalTask,
  currTaskNum,
  currTaskColumn,
  user,
}: Props) => {
  const { isDarkMode } = useAuth();
  const [commentText, setCommentText] = useState("");
  const today = new Date();
  const quillModules = {
    // syntax: true,
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["code-block", "link"],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      ["formula"],
      ["clean"],
    ],
  };

  // useEffect(() => {
  // }, []);
  return modalTask ? (
    <Drawer
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      id="drawer"
      size={"medium"}
      isOpen={isDrawerOpen}
      slideFrom={"right"}
      onRequestClose={() => drawerOpenHandler()}
      footer={
        <div className="row justify-content-sm-center">
          <Button
            className={"m-1"} // margin
            variant="destructive"
            label="Delete"
            onClick={() =>
              deleteTask(
                taskInfo,
                columns,
                departmentBoard,
                currBoard,
                currTaskNum,
                currTaskColumn,
                drawerOpenHandler
              )
            }
          />
          <Button
            className={"m-1"} // margin
            variant="success"
            label="Save"
            onClick={() =>
              saveTask(
                currTaskNum,
                currTaskColumn,
                taskInfo,
                modalTask,
                departmentBoard,
                currBoard,
                drawerOpenHandler,
                user
              )
            }
          />
          <Button
            className={"m-1"} // margin
            variant="neutral"
            label="Create Event"
            onClick={() => {
              saveTask(
                currTaskNum,
                currTaskColumn,
                taskInfo,
                modalTask,
                departmentBoard,
                currBoard,
                drawerOpenHandler,
                user
              );
              saveTaskAsEvent(
                user,
                modalTask,
                structuredClone(defaultEventInfo),
                saveEvent,
                drawerOpenHandler
              );
            }}
          />
        </div>
      }
    >
      <h3 className="themeoptions-heading">
        {/* Title */}
        <input
          id="TTitle"
          placeholder="Task title here..."
          value={modalTask.title}
          className="form-control"
          maxLength={50}
          onChange={(e) => titleHandler(e, modalTask, setModalTask)}
        />
      </h3>

      <div className="divider"></div>
      <div className="p3" id="bound">
        {/* Description */}
        <ReactQuill
          theme="bubble"
          placeholder="Task description here..."
          value={modalTask.description || ""}
          modules={quillModules}
          bounds={"#bound"}
          onChange={(value) =>
            descriptionHandler(value, modalTask, setModalTask)
          }
        />
        <div className="col">
          {/* User assignment */}
          <div className="form-group">
            <label>
              <span className="pr-2 opacity-6">
                <i className="fas fa-users"></i>
              </span>
              Assign to
            </label>
            <Select
              classNamePrefix="react-select-container"
              isMulti
              options={userOptions}
              value={modalTask.assignedTo || []}
              onChange={(selected) => {
                assignToHandler(selected, modalTask, setModalTask);
              }}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
              components={{ Option }} // usersMetadata is automatically passed into here
            />
          </div>
        </div>

        <div className="row pb-4 pl-3 pr-3">
          {/* Date */}
          <div className="col">
            <label className="fw-500">
              <span className="pr-2 opacity-6">
                <i className="fa fa-business-time"></i>
              </span>
              Due Date
            </label>
            <DatePicker
              value={modalTask.date ? inputToDate(modalTask.date) : today}
              onChange={(value) => {
                dateHandler(value, modalTask, setModalTask);
              }}
              className={"datePicker"}
            />
          </div>
          <div className="col">
            {/* Priority */}
            <label className="fw-500">
              <span className="pr-2 opacity-6">
                <i className="fas fa-exclamation-circle"></i>
              </span>
              Priority
            </label>
            <Select
              classNamePrefix="react-select-container"
              onChange={(selected) => {
                priorityHandler(selected, modalTask, setModalTask);
              }}
              value={
                modalTask.priority
                  ? { value: modalTask.priority, label: modalTask.priority }
                  : {}
              }
              options={taskPriorityOptions}
            />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}></div>
      </div>
      <h4 className="modal-heading">
        <span className="pr-2 opacity-6">
          <i className="fas fa-comment-alt"></i>
        </span>
        Comments
      </h4>
      {/* Comments */}

      <div className="p-1">
        {taskInfo && taskInfo.comments && user ? (
          Object.keys(taskInfo.comments).map((key, idx) => {
            if (!taskInfo.comments) return "";
            let currComment = taskInfo.comments[key];
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
            onChange={(e) => setCommentText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                submitComment(
                  commentText,
                  taskInfo,
                  modalTask,
                  setModalTask,
                  currTaskNum,
                  currTaskColumn,
                  departmentBoard,
                  currBoard,
                  user,
                  setCommentText
                );
              }
            }}
          />
          <button
            className="send-icon"
            onClick={() =>
              submitComment(
                commentText,
                taskInfo,
                modalTask,
                setModalTask,
                currTaskNum,
                currTaskColumn,
                departmentBoard,
                currBoard,
                user,
                setCommentText
              )
            }
          >
            <span></span>
          </button>
        </div>
      </div>
    </Drawer>
  ) : null;
};

export default TaskInfo;
