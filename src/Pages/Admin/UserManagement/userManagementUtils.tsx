import { ColumnApi, GridApi, RowClickedEvent } from "ag-grid-community";
import { get, onValue, ref, update } from "firebase/database";
import { db } from "../../../config/firebase";
import {
  AllEvents,
  AllUserTasks,
  ApplicationSettings,
  Notifications,
  PersonalInformation,
  RedirectedData,
  selectOption,
  userContext,
} from "../../../interfaces";
import { dateToString } from "../../../utils/generalFunctions";
import printDoc from "../../../utils/pdfExport/printDoc";
import { savePublicUser, setDepartmentPositions } from "../../Profile/profileUtils";
import { buildColumns, buildTableRows } from "../../Team/TeamUtils";

// Default selected columns to display
const defaultOptions = [
  {
    value: "name",
    label: "Name",
  },
  {
    value: "department",
    label: "Department",
  },
  {
    value: "position",
    label: "Position",
  },
  {
    value: "phone",
    label: "Phone",
  },
  {
    value: "inTeam",
    label: "In Team",
  },
];

/**
 * Retrieves and processes all user metadata to build AG grid table
 * @param user
 * @param setTableColumns
 * @param setTableRowsData
 * @param setInfoOptions
 * @param setColumnText
 * @param setUsersMetadata
 * @param onlyInTeamUsers
 * @returns
 */
const getAllUserDataForTable = (
  user: userContext | null,
  setTableColumns: Function,
  setTableRowsData: Function,
  setInfoOptions: Function,
  setColumnText: Function,
  setUsersMetadata: Function,
  onlyInTeamUsers: boolean = false,
) => {
  if (!user) {
    return;
  }
  onValue(ref(db, "private/usersMetadata"), (snapshot) => {
    const usersMetadata = snapshot.val();
    if (!usersMetadata) return;
    setUsersMetadata(usersMetadata);
    const availableOptions: selectOption[] = [];
    const myInfo = usersMetadata[user.id].pinfo;
    // Get the keys of the personal information
    Object.keys(myInfo).forEach((key: string, idx: number) => {
      availableOptions.push({ label: setColumnText(key), value: key });
    });

    // Build rows to fill the table WITH THE DEFAULT INFO
    buildTableRows(usersMetadata, defaultOptions, setTableRowsData, onlyInTeamUsers);
    buildColumns(defaultOptions, setTableColumns);

    setInfoOptions(availableOptions);
  });

  // }
};

/**
 * Get the team export file name
 * @returns
 */
const exportedAllFilename = () => {
  const base = "TSB_All_Users_";
  const year = new Date().getFullYear();
  return base + year;
};

/**
 * Export table to excel
 * @param gridApi
 * @returns
 */
const excelAllExport = (gridApi: GridApi | undefined) => {
  if (!gridApi) return;
  gridApi.exportDataAsExcel({ fileName: `${exportedAllFilename()}.xlsx` });
};
/**
 * Export table to clipboard
 * @param gridApi
 * @returns
 */
const clipboardAllExport = (gridApi: GridApi | undefined) => {
  if (!gridApi) return;
  gridApi.selectAll();
  gridApi.copySelectedRowsToClipboard(true);
  gridApi.deselectAll();
};
/**
 * Filter table based on input text
 * @param e
 * @param gridApi
 * @returns
 */
const filterAllTable = (e: any, gridApi: GridApi | undefined) => {
  if (!gridApi) return;
  gridApi.setQuickFilter(e.target.value);
};
/**
 * Export table to pdf
 * @param gridApi
 * @param columnApi
 * @returns
 */
const pdfAllExport = (gridApi: GridApi | undefined, columnApi: ColumnApi | undefined) => {
  if (!gridApi || !columnApi) return;
  printDoc(gridApi, columnApi, exportedAllFilename());
};

/**
 * Opens a modal with the corresponding user personal information to be edited
 * @param event
 * @param setInfo
 * @param setSelectPositions
 * @param setModalOpen
 * @param setModalTitle
 */
const onRowUserClick = (
  event: RowClickedEvent | RedirectedData,
  user: userContext | null,
  setInfo: Function,
  setSelectPositions: Function,
  setModalOpen: Function,
  setModalTitle: Function,
) => {
  const userId = event.data.userId;

  // Retrieve user data
  get(ref(db, `private/usersMetadata/${userId}/pinfo`)).then((snapshot) => {
    if (!snapshot.val()) return;
    const userInfo = snapshot.val();
    setInfo(userInfo);
    setDepartmentPositions(userInfo.department, user, setSelectPositions);
    setModalOpen(true);
    setModalTitle(`Edit "${userInfo.name}" Information`);
  });
};

/**
 * Saves the user information in the database
 * @param info
 * @param setModalOpen
 * @returns
 */
const saveUserInfo = (info: PersonalInformation, setModalOpen: Function) => {
  const userId = info.uid;
  if (!userId) return;
  const newInfo = updateWithLeftInDate(info);
  update(ref(db, `private/usersMetadata/${userId}/pinfo`), newInfo);
  savePublicUser(userId, newInfo);
  setModalOpen(false);
};

/**
 * Checks if user was removed from team, and updates with date
 * @param info
 * @returns updated leftIn date
 */
const updateWithLeftInDate = (info: PersonalInformation) => {
  if (info.inTeam) return { ...info, leftIn: "" };
  const t = new Date();
  const dateString = dateToString(t);
  return { ...info, leftIn: dateString };
};

/**
 * Get and set application settings state
 * @param setMaintenanceIsOpen
 * @param setRegistrationIsOpen
 */
const getAndSetApplicationSettings = (
  setRegistrationIsOpen: Function,
  setMaintenanceIsOpen: Function,
) => {
  onValue(ref(db, "public/applicationSettings"), (snapshot) => {
    const applicationSettings: ApplicationSettings = snapshot.val();
    if (!applicationSettings) return;
    setMaintenanceIsOpen(applicationSettings.maintenanceIsOpen);
    setRegistrationIsOpen(applicationSettings.registrationIsOpen);
  });
};

/**
 * Toggles user registration
 * @param setRegistrationIsOpen
 */
const toggleRegistration = (registrationIsOpen: boolean) => {
  update(ref(db, "public/applicationSettings"), {
    registrationIsOpen: !registrationIsOpen,
  });
};
/**
 * Toggles maintenance
 * @param setMaintenanceIsOpen
 */
const toggleMaintenance = (maintenanceIsOpen: boolean) => {
  update(ref(db, "public/applicationSettings"), {
    maintenanceIsOpen: !maintenanceIsOpen,
  });
};

const replaceEventMeetingType = () => {
  get(ref(db, "private/events")).then((snapshot) => {
    const allEvents: AllEvents = snapshot.val();

    if (!allEvents) return;
    Object.entries(allEvents).forEach(([time, eventDb]) => {
      if (time === "history") {
        Object.entries(eventDb).forEach(([eventId, event]) => {
          allEvents[time][eventId].isHistory = true;
        });
      }
    });
    update(ref(db, "private/events"), allEvents);
  });
};

const replaceUidFromAllNotifications = () => {
  const uuidToReplace = "bkYOlvmsz3hpoeEHQxzi6dYBaVC2";
  get(ref(db, "private/usersNotifications")).then((snapshot) => {
    const allUserNotifications: {
      [key: string]: { [key: string]: Notifications };
    } = snapshot.val();
    if (!allUserNotifications) return;

    Object.entries(allUserNotifications).forEach(([userId, names]) => {
      Object.entries(names).forEach(([nameId, notifications]) => {
        if (nameId === "all" || nameId === "new") {
          Object.entries(notifications).forEach(([notifId, notification]) => {
            if (notification.sentBy === "v9J2pDVMmvM4bS3qwdTcSScT6YR2") {
              allUserNotifications[userId][nameId][notifId].sentBy = uuidToReplace;
            }
          });
        } else {
          delete allUserNotifications[userId][nameId];
        }
      });
    });
    update(ref(db, "private/usersNotifications"), allUserNotifications);
  });
};

const replaceUidFromAllTasks = () => {
  const uuidToReplace = "bkYOlvmsz3hpoeEHQxzi6dYBaVC2";
  get(ref(db, "private/usersTasks")).then((snapshot) => {
    const allUsersTasks: AllUserTasks = snapshot.val();
    if (!allUsersTasks) return;
    Object.entries(allUsersTasks).forEach(([userId, tasks]) => {
      Object.entries(tasks).forEach(([taskId, task]) => {
        if (task.assignedBy === "v9J2pDVMmvM4bS3qwdTcSScT6YR2") {
          allUsersTasks[userId][taskId].assignedBy = uuidToReplace;
        }
      });
    });
    update(ref(db, "private/usersTasks"), allUsersTasks);
  });
};
export {
  getAllUserDataForTable,
  filterAllTable,
  excelAllExport,
  pdfAllExport,
  clipboardAllExport,
  onRowUserClick,
  saveUserInfo,
  getAndSetApplicationSettings,
  toggleMaintenance,
  toggleRegistration,
  replaceEventMeetingType,
  replaceUidFromAllNotifications,
  replaceUidFromAllTasks,
  defaultOptions,
};
