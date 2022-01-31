import { useState } from "react";
import ReactQuill from "react-quill";
import { Button, Modal } from "react-rainbow-components";
import Select from "react-select";
import { useAuth } from "../../contexts/AuthContext";
import { Thread, ThreadCreation, userContext } from "../../interfaces";
import {
  editThreadTitleHandler,
  editThreadDescriptionHandler,
  editThreadLabelHandler,
  saveThread,
} from "./forumThreadUtils";

type Props = {
  threadInformation: Thread;
  isEditThreadModalOpen: boolean;
  setIsEditThreadModalOpen: Function;
  encodedSectionName: string;
  encodedTopicName: string;
  encodedThreadName: string;
  user: userContext | null;
};

const ForumEditThreadModal = ({
  threadInformation,
  isEditThreadModalOpen,
  setIsEditThreadModalOpen,
  encodedSectionName,
  encodedTopicName,
  encodedThreadName,
  user,
}: Props) => {
  const { isDarkMode } = useAuth();
  const [newThreadInfo, setNewThreadInfo] = useState<ThreadCreation>({
    title: threadInformation.threadTitle,
    label: {
      value: threadInformation.threadLabel,
      label: threadInformation.threadLabel,
    },
    description: threadInformation.htmlContent,
  });
  const quillModules = {
    // syntax: true,
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "super" }, { script: "sub" }],
      [{ header: "1" }, { header: "2" }, "blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      ["link", "image", "formula"],
      ["clean"],
    ],
  };
  const labelOptions = [
    { value: "None", label: "None" },
    { value: "Important", label: "Important" },
    { value: "Solved", label: "Solved" },
    { value: "Issue", label: "Issue" },
    { value: "Closed", label: "Closed" },
  ];
  return (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      title="Edit Thread"
      size={"medium"}
      isOpen={isEditThreadModalOpen}
      onRequestClose={() => setIsEditThreadModalOpen(false)}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button
              label="Cancel"
              onClick={() => setIsEditThreadModalOpen(false)}
            />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Save"
              onClick={() =>
                saveThread(
                  newThreadInfo,
                  user,
                  encodedSectionName,
                  encodedTopicName,
                  encodedThreadName,
                  setIsEditThreadModalOpen
                )
              }
            />
          </div>
        </div>
      }
    >
      <div className="form-group row">
        <div className="col-md-7 text-center">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Thread Title</strong>
            </span>
          </label>
          <input
            className="form-control bdc-grey-200"
            value={newThreadInfo.title}
            onChange={(e) =>
              editThreadTitleHandler(e, newThreadInfo, setNewThreadInfo)
            }
          />
        </div>
        <div className="col-md-5 text-center">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-tag"></i>
              <strong> Label</strong>
            </span>
          </label>
          <Select
            classNamePrefix="react-select-container"
            options={labelOptions}
            value={newThreadInfo.label}
            menuPortalTarget={document.body}
            styles={{
              // Fixes the overlapping problem of the component with the datepicker
              menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            onChange={(option) =>
              editThreadLabelHandler(option, newThreadInfo, setNewThreadInfo)
            }
          />
        </div>
      </div>
      <div className="p3" id="bound">
        {/* Description */}
        <ReactQuill
          theme="snow"
          value={newThreadInfo.description}
          bounds={"#bound"}
          modules={quillModules}
          placeholder={"What's on your mind today?"}
          onChange={(value) =>
            editThreadDescriptionHandler(value, newThreadInfo, setNewThreadInfo)
          }
        />
      </div>
    </Modal>
  );
};

export default ForumEditThreadModal;
