import cx from "classnames";
import { Link } from "react-router-dom";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { ThreadMetadata, UserMetadata, userContext } from "../../interfaces";
import { dateDifference, getDecodedString, getUserProfileLink } from "../../utils/generalFunctions";
import { getThreadBadgeColor, hasUserSeenThread } from "./forumTopicUtils";

type Props = {
  encodedSectionName: string;
  encodedTopicName: string;
  encodedThreadName: string;
  threadInformation: ThreadMetadata;
  user: userContext | null;
  usersMetadata: UserMetadata;
};

const ForumThreadRow = ({
  encodedSectionName,
  encodedTopicName,
  encodedThreadName,
  threadInformation,
  user,
  usersMetadata,
}: Props) => {
  const userHasSeenThread = hasUserSeenThread(threadInformation.recentUpdateViewedBy, user);
  const threadUrl = `/forum/s/${encodedSectionName}/topic/${encodedTopicName}/thread/${encodedThreadName}`;
  const createdDiff = dateDifference(threadInformation.createdAt);
  const updateDiff = dateDifference(threadInformation.latestUpdateTimestamp);
  const threadBadge = getThreadBadgeColor(threadInformation.threadLabel);

  return (
    // Whether the user has seen the thread or not
    <div
      className={cx("card-body py-3 card-l-border", {
        "border-primary": userHasSeenThread,
        "border-success": !userHasSeenThread,
      })}
    >
      <div className="row no-gutters align-items-center">
        <div className="col">
          {/* Thread name and info */}
          <Link to={threadUrl} className="text-big">
            {getDecodedString(encodedThreadName)}
          </Link>
          {/* Thread badge label if any */}
          {threadBadge && (
            <div className={cx("mb-2 mr-2 ml-2 align-items-center badge", threadBadge)}>
              {threadInformation.threadLabel}
            </div>
          )}
          <div className="text-muted small mt-1">
            Started {createdDiff} &nbsp;·&nbsp;
            <Link to={getUserProfileLink(threadInformation.createdBy)} className="text-muted">
              {" "}
              {threadInformation.createdByName}
            </Link>
          </div>
        </div>
        <div className="col-4 pl-3">
          <div className="row no-gutters align-items-center">
            {/* Number of replies */}
            <div className="col-4">{threadInformation.numberReplies}</div>
            <div className="media col-8 align-items-center">
              {/* User avatar and latest update */}
              <AvatarOverlap
                users={[threadInformation.latestUserUpdate]}
                usersMetadata={usersMetadata}
              />
              <div className="media-body flex-truncate ml-2">
                <div className="line-height-1 text-truncate">{updateDiff}</div>
                <Link
                  to={getUserProfileLink(threadInformation.latestUserUpdate)}
                  className="text-muted small text-truncate"
                >
                  by {usersMetadata[threadInformation.latestUserUpdate].pinfo.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumThreadRow;
