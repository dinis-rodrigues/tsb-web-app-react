import { PersonalInformation, UserMetadata } from "../../interfaces";
import AvatarOverlap from "../AppImage/AvatarOverlap";
import cx from "classnames";
import { getUserProfileLink } from "../../utils/generalFunctions";
import { Link } from "react-router-dom";

type Props = {
  searchedUsers: [string, { pinfo: PersonalInformation }][];
  usersMetadata: UserMetadata;
  dropdownOpen: boolean;
};

const UsersDropdown = ({
  searchedUsers,
  usersMetadata,
  dropdownOpen,
}: Props) => {
  return (
    <div
      className={cx(
        "dropdown-menu-xl rm-pointers dropdown-menu dropdown-menu-right p-0",
        { "d-none": !dropdownOpen, "d-block": dropdownOpen }
      )}
      role="menu"
      tabIndex={0} // this is required to hide the dropdown on blur
    >
      <div className="tab-content">
        <div className={cx("tab-pane", { active: dropdownOpen })}>
          <ul
            className={"todo-list-wrapper list-group list-group-flush"}
            style={{ maxHeight: "500px", overflow: "scroll" }} // scrollable users
          >
            {searchedUsers.map(([userId, user]) => (
              <li
                key={userId}
                className={
                  "list-group-item search-hover user-info cursor-pointer"
                }
              >
                <Link
                  to={getUserProfileLink(userId)}
                  className={"td-n"}
                  style={{ color: "inherit" }}
                >
                  <div className={"widget-content p-0"}>
                    <div className={"widget-content-wrapper"}>
                      <AvatarOverlap
                        users={[userId]}
                        usersMetadata={usersMetadata}
                        withTooltip={false}
                        withLink={false}
                      />
                      <div className={"widget-content-left ml-2"}>
                        <div className={"widget-heading"}>
                          {user.pinfo.name} &nbsp;·&nbsp; {user.pinfo.position}
                        </div>
                        <div className={"widget-subheading"}>
                          {user.pinfo.department} &nbsp;·&nbsp;{" "}
                          {user.pinfo.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UsersDropdown;
