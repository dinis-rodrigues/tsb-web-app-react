import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Modal } from "react-rainbow-components";
import { useAuth } from "../../contexts/AuthContext";
import { Thread, userContext } from "../../interfaces";
import { submitThreadReply } from "./forumThreadUtils";

type Props = {
  threadInfo: Thread;
  isForumThreadReplyModalOpen: boolean;
  setIsForumThreadReplyModalOpen: Function;
  encodedSectionName: string;
  encodedTopicName: string;
  encodedThreadName: string;
  user: userContext | null;
};
const ForumThreadReplyModal = ({
  threadInfo,
  isForumThreadReplyModalOpen,
  setIsForumThreadReplyModalOpen,
  encodedSectionName,
  encodedTopicName,
  encodedThreadName,
  user,
}: Props) => {
  const { isDarkMode } = useAuth();
  const [replyText, setReplyText] = useState("");
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
  return (
    <Modal
      className={
        isDarkMode ? "app-theme-dark app-modal-dark" : "app-theme-white"
      }
      title="Add Comment"
      size={"medium"}
      isOpen={isForumThreadReplyModalOpen}
      onRequestClose={() => setIsForumThreadReplyModalOpen(false)}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button
              label="Cancel"
              onClick={() => setIsForumThreadReplyModalOpen(false)}
            />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Submit"
              onClick={() =>
                submitThreadReply(
                  replyText,
                  user,
                  encodedSectionName,
                  encodedTopicName,
                  encodedThreadName,
                  threadInfo,
                  setIsForumThreadReplyModalOpen,
                  setReplyText
                )
              }
            />
          </div>
        </div>
      }
    >
      <div className="p3" id="bound">
        {/* Description */}
        <ReactQuill
          theme="snow"
          value={replyText}
          bounds={"#bound"}
          modules={quillModules}
          placeholder={"What's on your mind today?"}
          onChange={(value) => setReplyText(value)}
        />
      </div>
    </Modal>
  );
};

export default ForumThreadReplyModal;
