import cx from "classnames";
import parse from "html-react-parser";
import { Link } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { ThreadReplyInfo, UserMetadata, userContext } from "../../interfaces";
import {
  extendDate,
  getHoursInStringFromTimestamp,
  getMinutesInStringFromTimestamp,
  getUserProfileLink,
  userHasPermission,
} from "../../utils/generalFunctions";
import {
  deleteComment,
  openEditCommentModal,
  toggleCommentLikedBy,
  usersWhoLikedOrWatchedTooltipList,
} from "./forumThreadUtils";

type Props = {
  threadReply: ThreadReplyInfo;
  usersMetadata: UserMetadata;
  user: userContext | null;
  replyId: string;
  encodedSectionName: string;
  encodedTopicName: string;
  encodedThreadName: string;
  setEditComment: Function;
  setIsEditCommentModalOpen: Function;
  setIsForumThreadReplyModalOpen: Function;
};

const ThreadReply = ({
  threadReply,
  usersMetadata,
  user,
  replyId,
  encodedSectionName,
  encodedTopicName,
  encodedThreadName,
  setEditComment,
  setIsEditCommentModalOpen,
  setIsForumThreadReplyModalOpen,
}: Props) => {
  return (
    <div className="card mb-3">
      <div className="card-body pb-0">
        <div className="media">
          <AvatarOverlap users={[threadReply.replyBy]} usersMetadata={usersMetadata} />
          <div className="media-body ml-4">
            <div className="float-right text-muted small">
              {extendDate(threadReply.replyTimestamp)} &nbsp;·&nbsp;
              {getHoursInStringFromTimestamp(threadReply.replyTimestamp)}:
              {getMinutesInStringFromTimestamp(threadReply.replyTimestamp)}
            </div>
            <Link to={getUserProfileLink(threadReply.replyBy)}>
              {usersMetadata[threadReply.replyBy].pinfo.name}
            </Link>
            {" · "}
            {usersMetadata && usersMetadata[threadReply.replyBy].pinfo.position}
            <div className="text-muted small">
              {usersMetadata[threadReply.replyBy].pinfo.department} &nbsp;·&nbsp; Joined in{" "}
              {usersMetadata[threadReply.replyBy].pinfo.joinedIn}
              <div className="float-right">
                <span>
                  {threadReply.latestUpdateTimestamp &&
                    threadReply.latestUpdateTimestamp !== threadReply.replyTimestamp &&
                    `Edited: ${extendDate(threadReply.latestUpdateTimestamp)} · ${getHoursInStringFromTimestamp(
                      threadReply.latestUpdateTimestamp,
                    )}:${getMinutesInStringFromTimestamp(threadReply.latestUpdateTimestamp)}`}
                </span>
              </div>
            </div>
            <div className="mt-2 ql-editor wh-sp-inh">{parse(threadReply.replyHtml)}</div>
            <div className="card-footer small d-flex flex-wrap justify-content-between align-items-center">
              <span className="text-muted d-inline-flex align-items-center align-middle">
                <span className={"heart-parent mr-1"}>
                  <i
                    className={cx("fas fa-heart heart-thread fsize-1", {
                      "heart-liked": threadReply.likedBy && user && threadReply.likedBy[user.id],
                    })}
                    onClick={() =>
                      toggleCommentLikedBy(
                        user,
                        replyId,
                        threadReply,
                        encodedSectionName,
                        encodedTopicName,
                        encodedThreadName,
                      )
                    }
                  ></i>
                </span>
                <span className="align-middle mr-1 cursor-pointer" id="numReplyLikes">
                  {threadReply.likedBy ? Object.entries(threadReply.likedBy).length : "0"}
                </span>
                <UncontrolledTooltip target="numReplyLikes" placement="top">
                  {usersWhoLikedOrWatchedTooltipList(threadReply.likedBy)}
                </UncontrolledTooltip>
                <span
                  className="text-muted bread-link cursor-pointer ml-1 mt-1"
                  onClick={() => setIsForumThreadReplyModalOpen(true)}
                >
                  Reply
                </span>
                {user?.id === threadReply.replyBy && (
                  <span
                    className="text-muted bread-link cursor-pointer ml-1 mt-1"
                    onClick={() =>
                      openEditCommentModal(
                        threadReply,
                        replyId,
                        setIsEditCommentModalOpen,
                        setEditComment,
                      )
                    }
                  >
                    Edit
                  </span>
                )}
              </span>
              {userHasPermission(user, threadReply.replyBy) && (
                <span
                  className="text-muted bread-link-danger cursor-pointer ml-1 mt-1"
                  onClick={() =>
                    deleteComment(
                      replyId,
                      threadReply,
                      user,
                      encodedSectionName,
                      encodedTopicName,
                      encodedThreadName,
                    )
                  }
                >
                  Delete
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadReply;
