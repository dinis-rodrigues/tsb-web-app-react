import { Fragment } from "react";
import { taskCommentInfo, userContext, UserMetadata } from "../../interfaces";
import cx from "classnames";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { isDateInPastWeek } from "../../utils/generalFunctions";

type Props = {
  comment: taskCommentInfo;
  USER: userContext;
  usersMetadata: UserMetadata;
};

const AppModalComment = ({ comment, USER, usersMetadata }: Props) => {
  let selfComment = false;
  // the comment is an object with an unique key, get the inside information
  if (comment.createdBy === USER.id) selfComment = true;

  // get date strings of the comment
  // Get comment date
  let d: Date;
  if (!comment.timestamp) {
    d = new Date();
  } else {
    d = new Date(comment.timestamp);
  }
  let dayOfTheComment = isDateInPastWeek(d);
  // Get the time
  let hours = ("0" + d.getHours()).slice(-2);
  let minutes = ("0" + d.getMinutes()).slice(-2);

  const insertImgSection = (
    <div className={cx({ "ml-1": selfComment })}>
      <AvatarOverlap
        users={[USER.id]}
        usersMetadata={usersMetadata}
        size={"md"}
        rounded={true}
        withTooltip={true}
        placement={"top"}
        topMargin={false}
      />
    </div>
  );
  return (
    <Fragment>
      <div className="invisible-divider"></div>
      <div
        className={cx("chat-box-wrapper", {
          "chat-box-wrapper-right": selfComment,
          "float-right": selfComment,
        })}
      >
        {!selfComment && insertImgSection}
        <div>
          <div
            className={cx({
              "chat-box-fb": !selfComment,
              "chat-box-fb-own": selfComment,
            })}
          >
            {comment.comment}
          </div>
          <small className="opacity-6">
            <i className="fa fa-calendar-alt mr-1"></i>
            {`${hours}:${minutes} | ${dayOfTheComment}`}
          </small>
        </div>
        {selfComment && insertImgSection}
      </div>
    </Fragment>
  );
};

export default AppModalComment;
