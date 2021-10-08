import { ColumnApi, GridApi, RowClickedEvent } from "ag-grid-community";
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
  UsersDB,
} from "../../../interfaces";
import { dateToString } from "../../../utils/generalFunctions";
import printDoc from "../../../utils/pdfExport/printDoc";
import {
  setDepartmentPositions,
  savePublicUser,
} from "../../Profile/profileUtils";
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
  onlyInTeamUsers: boolean = true
) => {
  if (!user) {
    return;
  }
  db.ref("private/usersMetadata").on("value", (snapshot) => {
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
    buildTableRows(
      usersMetadata,
      defaultOptions,
      setTableRowsData,
      onlyInTeamUsers
    );
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
  gridApi.exportDataAsExcel({ fileName: exportedAllFilename() + ".xlsx" });
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
const pdfAllExport = (
  gridApi: GridApi | undefined,
  columnApi: ColumnApi | undefined
) => {
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
  setModalTitle: Function
) => {
  let userId = event.data.userId;
  // console.log(userId);

  // Retrieve user data
  db.ref("private/usersMetadata")
    .child(userId)
    .child("pinfo")
    .once("value")
    .then((snapshot) => {
      if (!snapshot.val()) return;
      let userInfo = snapshot.val();
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
  let userId = info.uid;
  if (!userId) return;
  const newInfo = updateWithLeftInDate(info);
  db.ref("private/usersMetadata").child(userId).child("pinfo").update(newInfo);
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
  setMaintenanceIsOpen: Function
) => {
  db.ref("public/applicationSettings").on("value", (snapshot) => {
    let applicationSettings: ApplicationSettings = snapshot.val();
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
  db.ref("public/applicationSettings").update({
    registrationIsOpen: !registrationIsOpen,
  });
};
/**
 * Toggles maintenance
 * @param setMaintenanceIsOpen
 */
const toggleMaintenance = (maintenanceIsOpen: boolean) => {
  db.ref("public/applicationSettings").update({
    maintenanceIsOpen: !maintenanceIsOpen,
  });
};

const moveEverythingInUsers = () => {
  db.ref("private/users")
    .once("value")
    .then((snapshot) => {
      let allusers: UsersDB = snapshot.val();
      if (!allusers) return;
      Object.entries(allusers).forEach(([userId, user]) => {
        if (user.hasOwnProperty("statistics")) {
          let statistics = user.statistics;
          db.ref("private/usersStatistics").child(userId).set(statistics);
        }
        if (user.hasOwnProperty("notifications")) {
          let statistics = user.statistics;
          db.ref("private/usersNotifications").child(userId).set(statistics);
        }
      });
      // console.log("done");
    });
};

const replaceEventMeetingType = () => {
  db.ref("private/events")
    .once("value")
    .then((snapshot) => {
      const allEvents: AllEvents = snapshot.val();

      if (!allEvents) return;
      Object.entries(allEvents).forEach(([time, eventDb]) => {
        if (time === "history") {
          Object.entries(eventDb).forEach(([eventId, event]) => {
            allEvents[time][eventId].isHistory = true;
          });
        }
      });
      db.ref("private/events").update(allEvents);
    });
};

const replaceUidFromAllNotifications = () => {
  let uuidToReplace = "bkYOlvmsz3hpoeEHQxzi6dYBaVC2";
  db.ref("private/usersNotifications")
    .once("value")
    .then((snapshot) => {
      let allUserNotifications: {
        [key: string]: { [key: string]: Notifications };
      } = snapshot.val();
      if (!allUserNotifications) return;

      Object.entries(allUserNotifications).forEach(([userId, names]) => {
        Object.entries(names).forEach(([nameId, notifications]) => {
          if (nameId === "all" || nameId === "new") {
            Object.entries(notifications).forEach(([notifId, notification]) => {
              if (notification.sentBy === "v9J2pDVMmvM4bS3qwdTcSScT6YR2") {
                allUserNotifications[userId][nameId][notifId].sentBy =
                  uuidToReplace;
              }
            });
          } else {
            delete allUserNotifications[userId][nameId];
          }
        });
      });
      db.ref("private/usersNotifications").update(allUserNotifications);
    });
};

const replaceUidFromAllTasks = () => {
  let uuidToReplace = "bkYOlvmsz3hpoeEHQxzi6dYBaVC2";
  db.ref("private/usersTasks")
    .once("value")
    .then((snapshot) => {
      let allUsersTasks: AllUserTasks = snapshot.val();
      if (!allUsersTasks) return;
      Object.entries(allUsersTasks).forEach(([userId, tasks]) => {
        Object.entries(tasks).forEach(([taskId, task]) => {
          if (task.assignedBy === "v9J2pDVMmvM4bS3qwdTcSScT6YR2") {
            allUsersTasks[userId][taskId].assignedBy = uuidToReplace;
          }
        });
      });
      db.ref("private/usersTasks").update(allUsersTasks);
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
  moveEverythingInUsers,
  replaceEventMeetingType,
  replaceUidFromAllNotifications,
  replaceUidFromAllTasks,
};
