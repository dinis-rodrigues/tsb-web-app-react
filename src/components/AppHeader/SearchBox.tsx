import { useState } from "react";

import cx from "classnames";
import { useAuth } from "../../contexts/AuthContext";
import { PersonalInformation } from "../../interfaces";
import UsersDropdown from "./UsersDropdown";
import { getUsersSearchList, sortSearchedUsers } from "./searchUtils";

const SearchBox = () => {
  const { usersMetadata } = useAuth();

  const [activeSearch, setActiveSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<[string, { pinfo: PersonalInformation }][]>(
    sortSearchedUsers(Object.entries(usersMetadata)),
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
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
              getUsersSearchList(usersMetadata, e.target.value, setSearchText, setSearchedUsers)
            }
            placeholder="Search user..."
          />
          <button
            type="button"
            onClick={() => {
              setActiveSearch(!activeSearch);
              setDropdownOpen(!activeSearch);
            }}
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
          type="button"
          onClick={() => {
            setActiveSearch(!activeSearch);
            setDropdownOpen(!activeSearch);
          }}
          className="close"
        />
      </div>
    </>
  );
};

export default SearchBox;
