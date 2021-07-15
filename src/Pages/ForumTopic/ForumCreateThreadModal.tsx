import { Button, Modal } from "react-rainbow-components";
import Select from "react-select";
import ReactQuill from "react-quill"; // Typescript
import "react-quill/dist/quill.snow.css";
import { ThreadCreation, ThreadMetadata, userContext } from "../../interfaces";
import {
  newThreadDescriptionHandler,
  newThreadLabelHandler,
  newThreadTitleHandler,
  createNewThread,
} from "./forumTopicUtils";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  isCreateThreadModalOpen: boolean;
  setIsCreateThreadModalOpen: Function;
  newThreadInfo: ThreadCreation;
  setNewThreadInfo: Function;
  forumTopicMetadata: [string, ThreadMetadata][];
  encodedSectionName: string;
  encodedTopicName: string;
  user: userContext | null;
};

const ForumCreateThreadModal = ({
  isCreateThreadModalOpen,
  setIsCreateThreadModalOpen,
  newThreadInfo,
  setNewThreadInfo,
  forumTopicMetadata,
  encodedSectionName,
  encodedTopicName,
  user,
}: Props) => {
  const { usersMetadata } = useAuth();
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
      title="New Thread"
      size={"medium"}
      isOpen={isCreateThreadModalOpen}
      onRequestClose={() => setIsCreateThreadModalOpen(false)}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button
              label="Cancel"
              onClick={() => setIsCreateThreadModalOpen(false)}
            />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Create"
              onClick={() =>
                createNewThread(
                  newThreadInfo,
                  encodedSectionName,
                  encodedTopicName,
                  user,
                  forumTopicMetadata,
                  usersMetadata,
                  setNewThreadInfo,
                  setIsCreateThreadModalOpen
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
              newThreadTitleHandler(e, newThreadInfo, setNewThreadInfo)
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
            options={labelOptions}
            value={newThreadInfo.label}
            menuPortalTarget={document.body}
            styles={{
              // Fixes the overlapping problem of the component with the datepicker
              menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            onChange={(option) =>
              newThreadLabelHandler(option, newThreadInfo, setNewThreadInfo)
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
            newThreadDescriptionHandler(value, newThreadInfo, setNewThreadInfo)
          }
        />
      </div>
    </Modal>
  );
};

export default ForumCreateThreadModal;
