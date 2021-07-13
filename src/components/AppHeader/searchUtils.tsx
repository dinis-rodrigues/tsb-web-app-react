import { PersonalInformation, UserMetadata } from "../../interfaces";
import { normalizedString } from "../../utils/generalFunctions";

const sortSearchedUsers = (
  searchResults: [string, { pinfo: PersonalInformation }][]
) => {
  return searchResults.sort((a, b) => {
    if (a[1].pinfo.name && b[1].pinfo.name) {
      // Concatenate strings for sorting
      const nameA = normalizedString(a[1].pinfo.name.replaceAll(" ", ""));
      const nameB = normalizedString(b[1].pinfo.name.replaceAll(" ", ""));

      if (nameA > nameB) return 1;
      if (nameA < nameB) return -1;
      return 0;
    }
    return 0;
  });
};

const getUsersSearchList = (
  usersMetadata: UserMetadata,
  searchText: string,
  setSearchText: Function,
  setSearchedUsers: Function
) => {
  setSearchText(searchText);
  // build array of objects
  let searchResults = Object.entries(usersMetadata).filter(([userId, user]) => {
    return (
      normalizedString(user.pinfo.name!.toLowerCase()).includes(
        normalizedString(searchText.toLowerCase())
      ) ||
      normalizedString(user.pinfo.department!.toLowerCase()).includes(
        normalizedString(searchText.toLowerCase())
      )
    );
  });

  // sort search results by name
  let sortedSearchedUsers = sortSearchedUsers(searchResults);
  setSearchedUsers(sortedSearchedUsers);
};

export { getUsersSearchList, sortSearchedUsers };
