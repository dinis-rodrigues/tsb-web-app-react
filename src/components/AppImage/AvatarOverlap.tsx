import { UserMetadata, UsersDB } from "../../interfaces";
import UserAvatar from "./UserAvatar";

type Props = {
  users: string[];
  usersMetadata: UserMetadata | UsersDB;
  size?: "xs2" | "xs" | "sm" | "md" | "lg";
  withTooltip?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
  rounded?: boolean;
  topMargin?: boolean;
  withLink?: boolean;
};

// Overlaps the Users Avatars in a ro
const AvatarOverlap = ({
  users,
  usersMetadata,
  size = "md",
  withTooltip = true,
  placement = "top",
  topMargin = true,
  rounded = false,
  withLink = true,
}: Props) => {
  return (
    <div className="avatar-wrapper avatar-wrapper-overlap">
      {users &&
        users.map((userId: string, index: number) =>
          userId ? (
            <UserAvatar
              key={index} // this key must remain equal for all re-renders, otherwise image will flash (tried it with uuid())
              userId={userId}
              usersMetadata={usersMetadata}
              size={size}
              withTooltip={withTooltip}
              rounded={rounded}
              topMargin={topMargin}
              withLink={withLink}
            />
          ) : (
            " "
          ),
        )}
    </div>
  );
};

export default AvatarOverlap;
