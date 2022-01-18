import { Fragment, useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import parse from "html-react-parser";
import cx from "classnames";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { db } from "../../config/firebase";
import { Thread, ThreadEditComment, UserMetadata } from "../../interfaces";
import {
  extendDate,
  getAndSetAllUsersMetadata,
  getHoursInStringFromTimestamp,
  getMinutesInStringFromTimestamp,
  getUserProfileLink,
  userHasPermission,
} from "../../utils/generalFunctions";
import {
  getDecodedForumThreadPaths,
  getEncodedForumThreadPaths,
  getAndSetThreadInformation,
  toggleThreadLikedBy,
  deleteThread,
  swalDeleteThreadMessage,
  isThreadPinnedListener,
  toggleWatchList,
  togglePinnedThread,
  userWatchesThread,
  usersWhoLikedOrWatchedTooltipList,
} from "./forumThreadUtils";
import { useAuth } from "../../contexts/AuthContext";
import ForumThreadReplyModal from "./ForumThreadReplyModal";
import ForumEditThreadModal from "./ForumEditThreadModal";
import ThreadReply from "./ThreadReply";
import { UncontrolledTooltip } from "reactstrap";
import ForumThreadEditComment from "./ForumThreadEditComment";

const ForumThread = (props: any) => {
  const { USER } = useAuth();
  // dont trust url parameters from react router, it auto encodes/decodes stuff
  // get it directly from url path
  let [encodedSectionName, encodedTopicName, encodedThreadName] =
    getEncodedForumThreadPaths();
  let [decodedSectionName, decodedTopicName, decodedThreadName] =
    getDecodedForumThreadPaths(
      encodedSectionName,
      encodedTopicName,
      encodedThreadName
    );
  const [usersMetadata, setUsersMetadata] = useState<UserMetadata>();
  const [threadInformation, setThreadInformation] = useState<Thread>();
  const [isPinned, setIsPinned] = useState(false);
  const [redirectTo, setRedirectTo] = useState("");
  const [isForumThreadReplyModalOpen, setIsForumThreadReplyModalOpen] =
    useState(false);
  const [isEditThreadModalOpen, setIsEditThreadModalOpen] = useState(false);
  const [isEditCommentModalOpen, setIsEditCommentModalOpen] = useState(false);
  const [editComment, setEditComment] = useState<ThreadEditComment>({
    id: "",
    threadComment: {
      replyHtml: "",
      replyTimestamp: 0,
      replyBy: "",
      likedBy: {},
    },
  });

  useEffect(() => {
    // Get user metadata for pictures, names etc
    getAndSetAllUsersMetadata(setUsersMetadata);
    getAndSetThreadInformation(
      encodedSectionName,
      encodedTopicName,
      encodedThreadName,
      USER,
      setThreadInformation,
      setRedirectTo
    );
    isThreadPinnedListener(
      setIsPinned,
      encodedSectionName,
      encodedTopicName,
      encodedThreadName
    );
    return () => {
      db.ref("private/forumThreads")
        .child(encodedSectionName)
        .child(encodedTopicName)
        .child(encodedThreadName)
        .off("value");
      db.ref("private/forumPinned")
        .child(encodedSectionName)
        .child(encodedTopicName)
        .child(encodedThreadName)
        .off("value");
    };
  }, [encodedSectionName, encodedTopicName, encodedThreadName, USER]);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {/* BreadCrumbs and delete button */}
        <div className="d-flex flex-wrap justify-content-between">
          <div className="page-title-subheading opacity-10">
            {/* BreadCrumbs */}
            <ol id="FTopicLocation" className="breadcrumb bg-transparent mb-0">
              <li className="breadcrumb-item">
                <Link to="/forum" className={"bread-link"}>
                  <i aria-hidden="true" className="fa fa-home"></i>
                </Link>
              </li>
              <li>
                <div className="breadcrumb-separator">/</div>
              </li>
              <li className="breadcrumb-item">
                <Link to="/forum" className={"bread-link"}>
                  {decodedSectionName}
                </Link>
              </li>
              <li>
                <div className="breadcrumb-separator">/</div>
              </li>
              <li className="breadcrumb-item">
                <Link
                  to={`/forum/s/${encodedSectionName}/topic/${encodedTopicName}`}
                  className={"bread-link"}
                >
                  {decodedTopicName}
                </Link>
              </li>
              <li>
                <div className="breadcrumb-separator">/</div>
              </li>
              <li className="active breadcrumb-item text-dark font-weight-bold">
                {decodedThreadName}
              </li>
            </ol>
          </div>
          <div
            className="col-md-3 p-0"
            style={{ marginBottom: "auto", marginTop: "auto" }}
          >
            {userHasPermission(USER, threadInformation?.createdBy) && (
              <button
                type="button"
                className="float-right mr-1 btn btn-shadow  btn-danger"
                onClick={() =>
                  swalDeleteThreadMessage(() =>
                    deleteThread(
                      USER,
                      threadInformation,
                      encodedSectionName,
                      encodedTopicName,
                      encodedThreadName
                    )
                  )
                }
              >
                <span className="btn-icon-wrapper pr-2 opacity-7">
                  <i className="fa fa-minus fa-w-20"></i>
                </span>
                Delete
              </button>
            )}
          </div>
        </div>
        {/* Thread Content */}
        <div className="btn-shadow mr-3 btn btn-dark w-100 cursor-auto">
          <h5 className="mt-2 ">
            {/* Thread Title */}
            {threadInformation?.threadTitle}
            <div className="float-right">
              {/* Toggle notifications */}
              <span
                id="toggleNotif"
                className={cx("cursor-pointer mr-1", {
                  "text-info": userWatchesThread(USER, threadInformation),
                  "text-muted": !userWatchesThread(USER, threadInformation),
                })}
                onClick={() =>
                  toggleWatchList(
                    USER,
                    threadInformation,
                    encodedSectionName,
                    encodedTopicName,
                    encodedThreadName
                  )
                }
              >
                <i className="pe-7s-bell"> </i>
              </span>
              <UncontrolledTooltip placement="top" target={"toggleNotif"}>
                {!userWatchesThread(USER, threadInformation)
                  ? "Enable Notifications"
                  : "Disable Notifications"}
              </UncontrolledTooltip>
              {/* Toggle pinned thread */}
              {userHasPermission(USER) && (
                <Fragment>
                  <span
                    id="togglePin"
                    className={cx("cursor-pointer ml-1", {
                      "text-info": isPinned,
                      "text-muted": !isPinned,
                    })}
                    onClick={() =>
                      togglePinnedThread(
                        threadInformation,
                        encodedSectionName,
                        encodedTopicName,
                        encodedThreadName
                      )
                    }
                  >
                    <i className="pe-7s-pin"> </i>
                  </span>
                  <UncontrolledTooltip placement="top" target={"togglePin"}>
                    {!isPinned ? "Pin Thread" : "Unpin Thread"}
                  </UncontrolledTooltip>
                </Fragment>
              )}
            </div>
          </h5>
        </div>
        {/* Thread original post */}
        {threadInformation && usersMetadata && USER && (
          <Fragment>
            <div className="card mb-4">
              <div className="card-header">
                {/* Creator information */}
                <div className="media flex-wrap w-100 align-items-center">
                  <AvatarOverlap
                    users={[threadInformation.createdBy]}
                    usersMetadata={usersMetadata}
                  />

                  <div className="media-body ml-3">
                    <Link to={getUserProfileLink(threadInformation.createdBy)}>
                      {usersMetadata[threadInformation.createdBy].pinfo.name}
                    </Link>
                    {" · "}
                    {USER &&
                      usersMetadata &&
                      usersMetadata[threadInformation.createdBy].pinfo.position}
                    <div className="text-muted small no-text-transform">
                      {/* Created at information */}
                      {extendDate(threadInformation.createdAt)} &nbsp;·&nbsp;
                      {getHoursInStringFromTimestamp(
                        threadInformation.createdAt
                      )}
                      :
                      {getMinutesInStringFromTimestamp(
                        threadInformation.createdAt
                      )}
                      {/* Edited information, if edited */}
                      {threadInformation.latestUpdateTimestamp !==
                        threadInformation.createdAt &&
                        " / Edited: " +
                          extendDate(threadInformation.latestUpdateTimestamp) +
                          " · " +
                          getHoursInStringFromTimestamp(
                            threadInformation.latestUpdateTimestamp
                          ) +
                          ":" +
                          getMinutesInStringFromTimestamp(
                            threadInformation.latestUpdateTimestamp
                          )}
                    </div>
                  </div>
                  <div className="text-muted small ml-3">
                    <div>
                      <strong>
                        {
                          usersMetadata[threadInformation.createdBy].pinfo
                            .department
                        }
                      </strong>
                    </div>
                    <div className="float-right">
                      Joined in{" "}
                      <strong>
                        {
                          usersMetadata[threadInformation.createdBy].pinfo
                            .joinedIn
                        }
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body ql-editor wh-sp-inh ">
                {/* Thread post, we need to use a html -> react parser, because the string is pure html and react renders as a string*/}
                {parse(threadInformation.htmlContent)}
              </div>
              <div className="card-footer d-flex flex-wrap justify-content-between align-items-center px-0 pt-0 pb-3">
                <div className="px-4 pt-3">
                  {/* Like Button */}
                  {/* <span className="btn-like">Like</span> */}
                  <span className={"heart-parent"}>
                    <i
                      className={cx("fas fa-heart heart-thread fsize-2", {
                        "heart-liked":
                          threadInformation.likedBy &&
                          USER &&
                          threadInformation.likedBy[USER.id],
                      })}
                      onClick={() =>
                        toggleThreadLikedBy(
                          USER,
                          threadInformation,
                          encodedSectionName,
                          encodedTopicName,
                          encodedThreadName
                        )
                      }
                    ></i>
                  </span>
                  <span
                    id="numThreadLikes"
                    className="text-muted d-inline-flex align-middle cursor-pointer ml-2"
                  >
                    <span className="align-middle">
                      {threadInformation.likedBy
                        ? Object.entries(threadInformation.likedBy).length
                        : "0"}
                    </span>
                  </span>
                  <UncontrolledTooltip target="numThreadLikes" placement="top">
                    {usersWhoLikedOrWatchedTooltipList(
                      threadInformation.likedBy
                    )}
                  </UncontrolledTooltip>
                  {/* Views */}
                  <span className="text-muted d-inline-flex  align-middle ml-4 cursor-pointer">
                    <i className="fas fa-eye text-muted fsize-2"></i>
                    <span className="align-middle ml-2" id="numWatches">
                      {threadInformation.viewedBy
                        ? Object.entries(threadInformation.viewedBy).length
                        : "0"}
                    </span>
                  </span>
                  <UncontrolledTooltip target="numWatches" placement="top">
                    {usersWhoLikedOrWatchedTooltipList(
                      threadInformation.viewedBy
                    )}
                  </UncontrolledTooltip>
                </div>
                <div className="px-4 pt-3 d-inline-flex align-items-center align-middle">
                  <button
                    type="button"
                    className="btn btn-info"
                    onClick={() => setIsForumThreadReplyModalOpen(true)}
                  >
                    <span className="btn-icon-wrapper pr-2 opacity-7">
                      <i className="fa fa-plus fa-w-20"></i>
                    </span>{" "}
                    Reply
                  </button>
                  {userHasPermission(USER, threadInformation.createdBy) && (
                    <button
                      type="button"
                      className="btn btn-info ml-2"
                      onClick={() => setIsEditThreadModalOpen(true)}
                    >
                      <span className="btn-icon-wrapper pr-2 opacity-7">
                        <i className="fa fa-edit fa-w-20"></i>
                      </span>
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            {threadInformation.replies &&
              Object.entries(threadInformation.replies).map(
                ([replyId, threadReply], idx) => (
                  <ThreadReply
                    key={idx}
                    usersMetadata={usersMetadata}
                    replyId={replyId}
                    threadReply={threadReply}
                    encodedSectionName={encodedSectionName}
                    encodedTopicName={encodedTopicName}
                    encodedThreadName={encodedThreadName}
                    user={USER}
                    setEditComment={setEditComment}
                    setIsEditCommentModalOpen={setIsEditCommentModalOpen}
                    setIsForumThreadReplyModalOpen={
                      setIsForumThreadReplyModalOpen
                    }
                  />
                )
              )}

            <ForumThreadReplyModal
              user={USER}
              isForumThreadReplyModalOpen={isForumThreadReplyModalOpen}
              setIsForumThreadReplyModalOpen={setIsForumThreadReplyModalOpen}
              encodedSectionName={encodedSectionName}
              encodedTopicName={encodedTopicName}
              encodedThreadName={encodedThreadName}
              threadInfo={threadInformation}
            />
            <ForumEditThreadModal
              user={USER}
              threadInformation={threadInformation}
              isEditThreadModalOpen={isEditThreadModalOpen}
              setIsEditThreadModalOpen={setIsEditThreadModalOpen}
              encodedSectionName={encodedSectionName}
              encodedTopicName={encodedTopicName}
              encodedThreadName={encodedThreadName}
            />
            <ForumThreadEditComment
              user={USER}
              editComment={editComment}
              setEditComment={setEditComment}
              setIsEditCommentModalOpen={setIsEditCommentModalOpen}
              isEditCommentModalOpen={isEditCommentModalOpen}
              encodedSectionName={encodedSectionName}
              encodedTopicName={encodedTopicName}
              encodedThreadName={encodedThreadName}
            />
          </Fragment>
        )}
      </div>
      {redirectTo && <Redirect to={redirectTo} />}
    </div>
  );
};

export default ForumThread;
