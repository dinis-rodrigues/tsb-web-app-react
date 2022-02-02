import ReactQuill from "react-quill";
import { Button, Modal } from "react-rainbow-components";
import { useAuth } from "../../contexts/AuthContext";
import { ThreadEditComment, userContext } from "../../interfaces";
import { saveComment } from "./forumThreadUtils";

type Props = {
  editComment: ThreadEditComment;
  setEditComment: Function;
  isEditCommentModalOpen: boolean;
  setIsEditCommentModalOpen: Function;
  encodedSectionName: string;
  encodedTopicName: string;
  encodedThreadName: string;
  user: userContext | null;
};

const commentEditHandler = (value: string, setEditComment: Function) => {
  setEditComment((editComment: ThreadEditComment) => ({
    ...editComment,
    threadComment: { replyHtml: value },
  }));
};
const ForumThreadEditComment = ({
  editComment,
  setEditComment,
  user,
  isEditCommentModalOpen,
  setIsEditCommentModalOpen,
  encodedSectionName,
  encodedTopicName,
  encodedThreadName,
}: Props) => {
  const { isDarkMode } = useAuth();
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
      title="Edit Comment"
      size={"medium"}
      isOpen={isEditCommentModalOpen}
      onRequestClose={() => setIsEditCommentModalOpen(false)}
      footer={
        <div className="row justify-content-sm-center">
          <div className="mr-1">
            <Button
              label="Cancel"
              onClick={() => setIsEditCommentModalOpen(false)}
            />
          </div>
          <div className="mr-1">
            <Button
              variant="brand"
              label="Save"
              onClick={() =>
                saveComment(
                  editComment.id,
                  editComment.threadComment.replyHtml,
                  user,
                  encodedSectionName,
                  encodedTopicName,
                  encodedThreadName,
                  setIsEditCommentModalOpen
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
          value={editComment.threadComment.replyHtml}
          bounds={"#bound"}
          modules={quillModules}
          placeholder={"What's on your mind today?"}
          onChange={(value) => commentEditHandler(value, setEditComment)}
        />
      </div>
    </Modal>
  );
};

export default ForumThreadEditComment;
