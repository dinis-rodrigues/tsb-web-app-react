import { Fragment, useState } from "react";

import cx from "classnames";
import { getUsersSearchList, sortSearchedUsers } from "./searchUtils";
import { PersonalInformation } from "../../interfaces";
import { useAuth } from "../../contexts/AuthContext";
import UsersDropdown from "./UsersDropdown";

const SearchBox = () => {
  const { usersMetadata } = useAuth();

  const [activeSearch, setActiveSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<
    [string, { pinfo: PersonalInformation }][]
  >(sortSearchedUsers(Object.entries(usersMetadata)));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Fragment>
      <div
        className={cx("search-wrapper", {
          active: activeSearch,
        })}
      >
        <div
          className="input-holder"
          onBlur={(e) => {
            if (!e.relatedTarget) setDropdownOpen(false);
          }}
          style={{ overflow: "visible" }}
        >
          <input
            type="text"
            className="search-input"
            onFocus={() => setDropdownOpen(true)}
            value={searchText}
            onChange={(e) =>
              getUsersSearchList(
                usersMetadata,
                e.target.value,
                setSearchText,
                setSearchedUsers
              )
            }
            placeholder="Search user..."
          />
          <button
            onClick={() => setActiveSearch(!activeSearch)}
            className="search-icon"
          >
            <span />
          </button>
          <UsersDropdown
            usersMetadata={usersMetadata}
            searchedUsers={searchedUsers}
            dropdownOpen={dropdownOpen}
          />
        </div>
        <button
          onClick={() => setActiveSearch(!activeSearch)}
          className="close"
        />
      </div>
    </Fragment>
  );
};

export default SearchBox;
