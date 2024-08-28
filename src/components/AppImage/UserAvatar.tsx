import { Link } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";

import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { UserMetadata, UsersDB } from "../../interfaces";
import { getUserImgUrl, getUserProfileLink } from "../../utils/generalFunctions";
import ImageContainer from "./ImageContainer";

type Props = {
  userId: string;
  usersMetadata: UserMetadata | UsersDB;
  size: "xs2" | "xs" | "sm" | "md" | "lg";
  withTooltip: boolean;
  placement?: "top" | "bottom" | "left" | "right";
  rounded: boolean;
  topMargin: boolean;
  withLink: boolean;
};
const UserAvatar = ({
  userId,
  usersMetadata,
  size,
  withTooltip,
  placement,
  rounded,
  topMargin,
  withLink,
}: Props) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  // Only when the ref is assigned, then we load the tooltips, otherwise, it
  // doesnt show or it throws error sometimes
  useEffect(() => {
    if (elRef.current) setReady(true);
  }, [elRef]);
  return (
    <div
      ref={elRef}
      className={cx("avatar-icon-wrapper", {
        "avatar-icon-xs2": size === "xs2",
        "avatar-icon-xs": size === "xs",
        "avatar-icon-sm": size === "sm",
        "avatar-icon-md": size === "md",
        "avatar-icon-lg": size === "lg",
        rounded: rounded,
      })}
    >
      {withLink ? (
        <Link to={getUserProfileLink(userId)}>
          <div
            className={cx("avatar-icon align-content-center", {
              "mt-1": topMargin,
            })}
            style={{ display: "flex" }}
          >
            <ImageContainer imageSrc={getUserImgUrl(userId, false, true)} />
          </div>
        </Link>
      ) : (
        <div
          className={cx("avatar-icon align-content-center", {
            "mt-1": topMargin,
          })}
          style={{ display: "flex" }}
        >
          <ImageContainer imageSrc={getUserImgUrl(userId, false, true)} />
        </div>
      )}
      {withTooltip && ready && (
        <UncontrolledTooltip placement={placement} target={elRef}>
          {usersMetadata[userId].pinfo.name}
        </UncontrolledTooltip>
      )}
    </div>
  );
};

export default UserAvatar;
