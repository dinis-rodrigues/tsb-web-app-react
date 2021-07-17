import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import parse from "html-react-parser";
import { UncontrolledTooltip } from "reactstrap";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { getPinnedThreadInfo } from "./dashboardUtils";
import {
  extendDate,
  getHoursInStringFromTimestamp,
  getMinutesInStringFromTimestamp,
  getUserProfileLink,
} from "../../utils/generalFunctions";
import {
  toggleThreadLikedBy,
  usersWhoLikedOrWatchedTooltipList,
} from "../ForumThread/forumThreadUtils";
import { Thread } from "../../interfaces";

const DashForumThread = () => {
  const { usersMetadata, USER } = useAuth();
  const [threadInformation, setThreadInformation] = useState<Thread>();
  const [forumPaths, setForumPaths] = useState({
    encodedSectionName: "",
    encodedTopicName: "",
    encodedThreadName: "",
  });
  useEffect(() => {
    getPinnedThreadInfo(USER, setThreadInformation, setForumPaths);

    // get encoded Topic Name

    // get encoded Thread Information and name
    return () => {
      db.ref("private/forumPinned").off("value");
    };
  }, [USER]);
  return threadInformation ? (
    <Fragment>
      <div className="row">
        <div className="col-md mb-3">
          <div
            className="mr-3 btn bg-grad w-100 cursor-auto"
            style={{ border: "none" }}
          >
            <h5 className="mt-2 ">
              <div className="float-left">
                <span className={"heart-parent"}>
                  <i
                    className={cx("fas fa-heart heart-thread fsize-2", {
                      "heart-liked":
                        threadInformation.likedBy &&
                        USER &&
                        threadInformation.likedBy[USER.id],
                      "text-muted":
                        !threadInformation.likedBy ||
                        (USER && !threadInformation.likedBy[USER.id]),
                    })}
                    onClick={() =>
                      toggleThreadLikedBy(
                        USER,
                        threadInformation,
                        forumPaths.encodedSectionName,
                        forumPaths.encodedTopicName,
                        forumPaths.encodedThreadName
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
                  {usersWhoLikedOrWatchedTooltipList(threadInformation.likedBy)}
                </UncontrolledTooltip>
              </div>
              {/* Thread Title */}
              <Link
                to={`/forum/s/${forumPaths.encodedSectionName}/topic/${forumPaths.encodedTopicName}/thread/${forumPaths.encodedThreadName}`}
                className={"text-white"}
              >
                {threadInformation.threadTitle}
              </Link>
              <div className="float-right">
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
            </h5>
          </div>
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
                    {getHoursInStringFromTimestamp(threadInformation.createdAt)}
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
          </div>
        </div>
      </div>
    </Fragment>
  ) : null;
};

export default DashForumThread;
