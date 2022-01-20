import {
  ColDef,
  ColGroupDef,
  ColumnApi,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import {
  Departments,
  RecruitmentData,
  RecruitmentTable,
  RecruitmentTables,
  RecruitmentUser,
  selectOption,
  UserMetadata,
} from "../../interfaces";
import {
  dateToString,
  dateWithHoursComparator,
  normalizedString,
  toastrMessage,
} from "../../utils/generalFunctions";
import printDoc from "../../utils/pdfExport/printDoc";
import {
  buildRecruitmentBarDepartmentSeries,
  buildRecruitmentBarSeries,
} from "../Statistics/statisticsUtils";

const recruitmentMonths: { [key: string]: number } = {
  JAN: 0,
  FEB: 1,
  MAR: 2,
  APR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AUG: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DEC: 11,
};
const numberToMonths: { [key: string]: string } = {
  "0": "JAN",
  "1": "FEB",
  "2": "MAR",
  "3": "APR",
  "4": "MAY",
  "5": "JUN",
  "6": "JUL",
  "7": "AUG",
  "8": "SEP",
  "9": "OCT",
  "10": "NOV",
  "11": "DEC",
};

/** Show a confirmation message to delete the recruitment table
 * @param  {Function} deleteFunction function to delete the table
 */
const swalDeleteRecruitmentTable = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this recruitment table, this operation is not reversible.</p>
      <p><h4>Are you sure to proceed?</h4></p>`,

      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
      },
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      } else if (result.isDenied) {
        deleteFunction();
      }
    });
};

/** Show a confirmation message to delete the recruitment table
 * @param  {Function} deleteFunction function to delete the table
 */
const swalDeleteApplication = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this user application, this operation is not reversible.</p>
      <p><h4>Are you sure to proceed?</h4></p>`,

      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
      },
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      } else if (result.isDenied) {
        deleteFunction();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

const openDepartmentsHandler = (value: string[], departments: Departments) => {
  const openedDepartments: Departments = {};
  value.forEach((acronym) => {
    acronym = acronym.toLowerCase();
    let depToOpen = departments[acronym];
    openedDepartments[acronym] = depToOpen;
  });
  db.ref("public/recruitment/openDepartments").set(openedDepartments);
};
const getDepartmentOptions = (
  departments: Departments,
  setDepartmentOptions: Function
) => {
  let depOptions: selectOption[] = [];
  Object.entries(departments).forEach(([key, dep]) => {
    depOptions.push({
      value: dep.acronym.toUpperCase(),
      label: dep.acronym.toUpperCase(),
    });
  });
  depOptions.sort();
  setDepartmentOptions(depOptions);
};

const getOpenedDepartments = (setOpenDepartments: Function) => {
  db.ref("public/recruitment/openDepartments").on("value", (snapshot) => {
    const openDepartments: Departments = snapshot.val();
    if (!openDepartments) {
      setOpenDepartments([]);
      return;
    }
    let depList = Object.entries(openDepartments).map(([key, dep]) => {
      return dep.acronym.toUpperCase();
    });
    setOpenDepartments(depList);
  });
};

/**
 * Switches chart pane
 * @param newTab
 * @param activeTab
 * @param tableData
 * @param setSeries
 * @param setLabels
 * @param setActiveTab
 * @returns
 */
const switchBarChart = (
  newTab: string,
  activeTab: string,
  tableData: RecruitmentTable,
  setSeries: Function,
  setLabels: Function,
  setActiveTab: Function
) => {
  if (newTab && newTab === activeTab) return;
  if (newTab === "1")
    buildRecruitmentBarSeries(tableData, setSeries, setLabels);
  else buildRecruitmentBarDepartmentSeries(tableData, setSeries, setLabels);
  setActiveTab(newTab);
};
/**
 * Toggle the user registration
 * @param tablesList
 * @param activeRecruitment
 */
const toggleRegistration = (
  tablesList: string[],
  activeRecruitment: string | boolean
) => {
  if (activeRecruitment) db.ref("public/recruitment/activeTable").set(false);
  else db.ref("public/recruitment/activeTable").set(tablesList[0]);
};

/**
 * Selects which departments to display on the table
 * @param selectedDepartments
 * @param recruitmentData
 * @param currTableName
 * @param setSelectedDepartments
 * @param setCurrTableData
 * @param setTableRows
 * @param setTableColumns
 * @returns
 */
const selectDepartmentHandler = (
  selectedDepartments: string[],
  recruitmentData: RecruitmentData | undefined,
  currTableName: string | boolean,
  setSelectedDepartments: Function,
  setCurrTableData: Function,
  setTableRows: Function,
  setTableColumns: Function
) => {
  if (
    !recruitmentData ||
    !currTableName ||
    typeof currTableName === "boolean" ||
    selectedDepartments.length <= 0
  )
    return;
  let auxTable = JSON.parse(
    JSON.stringify(recruitmentData.tables[currTableName])
  );
  let newTableData = filterTableByDepartments(auxTable, selectedDepartments);
  setCurrTableData(newTableData);
  buildTableRows(newTableData, setTableRows);
  buildColumns(newTableData, setTableColumns);
  setSelectedDepartments(selectedDepartments);
};

/**
 * Switches to a different recruitment table
 * @param selected
 * @param recruitmentData
 * @param selectedDepartments
 * @param setCurrTableName
 * @param setTableColumns
 * @param setTableRows
 * @param setCurrTableData
 * @returns
 */
const selectTableHandler = (
  selected: any,
  recruitmentData: RecruitmentData | undefined,
  selectedDepartments: string[],
  setCurrTableName: Function,
  setTableColumns: Function,
  setTableRows: Function,
  setCurrTableData: Function,
  setDepartmentOptions: Function,
  setSelectedDepartments: Function
) => {
  let tableName = selected.value;
  if (!recruitmentData) return;

  let newTableData: RecruitmentTable = {};
  if (recruitmentData.tables.hasOwnProperty(tableName)) {
    newTableData = JSON.parse(
      JSON.stringify(recruitmentData.tables[tableName])
    );
  }
  setCurrTableName(tableName);
  setCurrTableData(newTableData);
  buildTableRows(newTableData, setTableRows);
  buildColumns(newTableData, setTableColumns);
  getExistingDepartmentsOptions(
    newTableData,
    setDepartmentOptions,
    setSelectedDepartments
  );
};
/**
 * Generates the tale name based on month and year
 * @returns table string
 */
const generateRecruitmentTable = () => {
  let d = new Date();
  let monthNum = d.getMonth().toString();
  let month = numberToMonths[monthNum];
  let yearNum = d.getFullYear().toString();
  yearNum = yearNum.substring(2);

  return `Recruta${month}${yearNum}`;
};

const createNewDbTable = (tableName: string, tablesList: string[]) => {
  const newTableList = [...tablesList, tableName];
  db.ref("public/recruitment/activeTable").set(tableName);
  db.ref("public/recruitment/tablesList").set(newTableList);
};

const createNewSqlAndDbTable = async (
  tablesList: string[],
  userId: string | undefined
) => {
  if (!userId) return;
  let tableName = generateRecruitmentTable();
  var data = new FormData();
  data.append("activeTable", tableName);
  data.append("userId", userId);

  try {
    const res = await fetch(
      "https://tecnicosolarboat.tecnico.ulisboa.pt/api/createNewRecruitmentTable.php",
      {
        method: "POST",
        body: data,
      }
    );
    const resData = await res.json();
    if (resData.success) {
      // Send data to firebase database
      createNewDbTable(tableName, tablesList);

      toastrMessage("Table created successfully", "success", false);
    }
  } catch (error) {
    toastrMessage(error as string, "error", false);
  }
};
/**
 * Get the team export file name
 * @returns
 */
const exportedFilename = (currActiveTable: string) => {
  const base = "TSB_Recruitment_" + currActiveTable;
  return base;
};

/**
 * Export table to excel
 * @param gridApi
 * @returns
 */
const excelExport = (
  gridApi: GridApi | undefined,
  currActiveTable: string | boolean
) => {
  if (!gridApi || typeof currActiveTable === "boolean") return;
  gridApi.exportDataAsExcel({
    fileName: exportedFilename(currActiveTable) + ".xlsx",
  });
};
/**
 * Export table to clipboard
 * @param gridApi
 * @returns
 */
const clipboardExport = (gridApi: GridApi | undefined) => {
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
const filterTable = (e: any, gridApi: GridApi | undefined) => {
  if (!gridApi) return;
  gridApi.setQuickFilter(e.target.value);
};
/**
 * Export table to pdf
 * @param gridApi
 * @param columnApi
 * @returns
 */
const pdfExport = (
  gridApi: GridApi | undefined,
  columnApi: ColumnApi | undefined,
  currActiveTable: string | boolean
) => {
  if (!gridApi || !columnApi || typeof currActiveTable === "boolean") return;
  printDoc(gridApi, columnApi, exportedFilename(currActiveTable));
};

/**
 * Resizes columns to fit table on first table render
 * @param params
 * @param setGridApi
 * @param setColumnApi
 */
const onFirstDataRendered = (
  params: GridReadyEvent,
  setGridApi: Function,
  setColumnApi: Function
) => {
  params.api.sizeColumnsToFit();
  // Initial sort by name
  params.columnApi.applyColumnState({
    state: [{ colId: "timestamp", sort: "asc" }],
  });
  setGridApi(params.api);
  setColumnApi(params.columnApi);
};

const onRowRecruitmentUserClick = (
  e: RowClickedEvent,
  setUserInfo: Function,
  setModalOpen: Function
) => {
  console.log(e);
  setUserInfo(e.data);
  setModalOpen(true);
};

/**
 * Gets an array with all table names, sorted
 * @param tables
 * @returns
 */
const getTableNames = (tables: RecruitmentTables) => {
  const tableNames: string[] = [];
  Object.entries(tables).forEach(([name, table]) => {
    tableNames.push(name);
  });
  // sort
  tableNames.sort((a, b) => {
    let monthA = a.substring(7, 10); //RecrutaSET21
    let yearA = parseInt("20" + a.substring(10));
    let monthB = b.substring(7, 10); //RecrutaSET21
    let yearB = parseInt("20" + b.substring(10));

    let dateA = new Date(yearA, recruitmentMonths[monthA], 1);
    let dateB = new Date(yearB, recruitmentMonths[monthB], 1);

    if (dateA.getTime() > dateB.getTime()) return 1;
    if (dateA.getTime() > dateB.getTime()) return -1;
    return 0;
  });
  return tableNames;
};

/**
 * Builds AG grid table columns
 * @param selectedOptions
 * @param setTableColumns
 */
const buildColumns = (
  currTableData: RecruitmentTable | undefined,
  setTableColumns: Function
) => {
  if (!currTableData) return;
  if (Object.keys(currTableData).length <= 0) return;
  // Build column definition
  const columnsDefs: (ColDef | ColGroupDef)[] | undefined = [];
  const auxUser = currTableData[Object.keys(currTableData)[0]];
  Object.keys(auxUser).forEach((key) => {
    // const label = selected.label;
    if (key === "name") {
      columnsDefs.push({
        field: key,
        sortable: true,
        pinned: "left",
        suppressSizeToFit: true,
      });
    } else if (key === "departments") {
      columnsDefs.push({
        field: key,
        sortable: true,
      });
    } else if (key === "timestamp") {
      columnsDefs.push({
        field: key,
        sortable: true,
        comparator: dateWithHoursComparator,
        pinned: "left",
        suppressSizeToFit: true,
      });
    } else if (key === "applicationId") {
      columnsDefs.push({
        headerName: "Id",
        field: key,
        suppressColumnsToolPanel: true,
        hide: true,
      });
    } else {
      columnsDefs.push({
        field: key,
        sortable: true,
      });
    }
  });
  setTableColumns(columnsDefs);
};

/**
 * Builds rows array for the table
 * @param currTableData
 * @param setTableRows
 * @returns
 */
const buildTableRows = (
  currTableData: RecruitmentTable | undefined,
  setTableRows: Function
) => {
  if (!currTableData) {
    currTableData = {};
  }
  const rows: RecruitmentUser[] = [];
  Object.entries(currTableData).forEach(([key, user]) => {
    let time = user.timestamp;
    let date = time ? dateToString(new Date(time), true) : "-";
    let userData = { ...user, timestamp: date, applicationId: key };

    rows.push(userData);
  });
  setTableRows(rows);
};

const getExistingDepartmentsOptions = (
  tableData: RecruitmentTable | undefined,
  setDepartmentOptions: Function,
  setSelectedDepartments: Function
) => {
  let departments: string[] = [];
  if (!tableData) return;
  Object.entries(tableData).forEach(([key, user]) => {
    user.departments.forEach((dep) => {
      if (!departments.includes(dep)) departments.push(dep);
    });
  });
  departments.sort();
  let options = departments.map((dep) => ({ value: dep, label: dep }));
  setSelectedDepartments(departments);
  setDepartmentOptions(options);
};

const filterTableByDepartments = (
  tableData: RecruitmentTable,
  selectedDepartments: string[]
) => {
  if (selectedDepartments.length <= 0) return tableData;
  const newTableData: RecruitmentTable = {};
  Object.entries(tableData).forEach(([key, user]) => {
    let userDepartments = user.departments;
    if (selectedDepartments.some((dep) => userDepartments.includes(dep)))
      newTableData[key] = user;
  });
  return newTableData;
};

const getRecruitmentData = (
  currTableName: string | boolean,
  currTableData: RecruitmentTable | undefined,
  selectedDepartments: string[],
  setCurrTableName: Function,
  setCurrTableData: Function,
  setTableRows: Function,
  setTableColumns: Function,
  setRecruitmentData: Function,
  setTablesList: Function,
  setTableOptions: Function,
  setActiveRecruitment: Function,
  setDepartmentOptions: Function,
  setSelectedDepartments: Function
) => {
  db.ref("public/recruitment").on("value", (snapshot) => {
    const recruitmentData: RecruitmentData = snapshot.val();

    if (!recruitmentData) return;
    setRecruitmentData(recruitmentData);

    // Create table options to select from
    let tableOptionsObj = recruitmentData.tablesList.map((table) => ({
      value: table,
      label: table,
    }));
    setTableOptions(tableOptionsObj.reverse()); // Last is first to show in select

    // Get table name
    const activeTableName = recruitmentData.activeTable;
    setActiveRecruitment(activeTableName);

    // Get all tables
    const tables = recruitmentData.tables;

    // Get tables list
    setTablesList(recruitmentData.tablesList);
    const tableNames = recruitmentData.tablesList;

    // Build rows and columns for the displayed table
    if (!currTableName) {
      // if no table is selected or recruitment is not open
      // if (typeof currTableName === "boolean") {
      setCurrTableName(tableNames[tableNames.length - 1]);
      if (tables.hasOwnProperty(tableNames[tableNames.length - 1])) {
        let auxTable = JSON.parse(
          JSON.stringify(tables[tableNames[tableNames.length - 1]])
        );
        let newTableData = filterTableByDepartments(
          auxTable,
          selectedDepartments
        );

        setCurrTableData(newTableData);
        buildTableRows(newTableData, setTableRows);
        buildColumns(newTableData, setTableColumns);
        getExistingDepartmentsOptions(
          newTableData,
          setDepartmentOptions,
          setSelectedDepartments
        );
      }
    } else {
      if (typeof currTableName !== "boolean") {
        let newTableData: RecruitmentTable = {};
        if (tables.hasOwnProperty(currTableName)) {
          let auxTable = JSON.parse(JSON.stringify(tables[currTableName]));
          newTableData = filterTableByDepartments(
            auxTable,
            selectedDepartments
          );
        }

        setCurrTableData(newTableData);
        setCurrTableName(activeTableName);
        buildTableRows(newTableData, setTableRows);
        buildColumns(newTableData, setTableColumns);
        getExistingDepartmentsOptions(
          newTableData,
          setDepartmentOptions,
          setSelectedDepartments
        );
      }
    }
  });
};

const buildUserNameFromFullName = (fullName: string) => {
  const names = fullName.trim().split(" ");
  let firstName = normalizedString(names[0]);
  let lastName = normalizedString(names[names.length - 1]);
  return `${firstName}-${lastName}`.toLowerCase();
};

const buildUserNames = () => {
  db.ref("private/usersMetadata")
    .once("value")
    .then((snapshot) => {
      const users: UserMetadata = snapshot.val();

      const usersList = Object.entries(users);

      let existingUserNames: string[] = [];

      for (let i = 0; i < usersList.length; i++) {
        const userId = usersList[i][0];
        const userInfo = usersList[i][1].pinfo;

        let currUserName = buildUserNameFromFullName(userInfo.fullName!);

        // check if user name already exists
        let equalUserNames: string[] = [];
        for (const userName of existingUserNames) {
          if (userName.includes(currUserName)) {
            equalUserNames.push(userName);
          }
        }

        // add index to current username
        if (equalUserNames.length > 0) {
          // sort equalusernames
          equalUserNames.sort();
          currUserName = `${currUserName}-${equalUserNames.length}`;
        }

        // add to existing usernames
        existingUserNames.push(currUserName);

        // Add user name to user metadata
        db.ref(`private/usersMetadata/${userId}/pinfo/userName`).set(
          currUserName
        );

        // Add user name public official website team
        db.ref(`public/officialWebsite/team/${userId}/info/userName`).set(
          currUserName
        );
      }
    });
};

const deleteTable = (tableName: string, tablesList: string[]) => {
  const newTableList = tablesList.filter((table) => table !== tableName);
  db.ref("public/recruitment/activeTable").child(tableName).remove();
  db.ref("public/recruitment/tablesList").set(newTableList);
};

const deleteRecruitmentMemberFromDB = (
  recruitmentTable: string | boolean,
  memberId: string | undefined,
  setModalIsOpen: Function
) => {
  if (typeof recruitmentTable !== "string" || !recruitmentTable || !memberId)
    return;
  db.ref(`public/recruitment/tables/${recruitmentTable}/${memberId}`)
    .remove()
    .then(() => {
      toastrMessage("Application deleted successfully", "success");
      setModalIsOpen(false);
    })
    .catch(() => {
      toastrMessage("Error deleting application", "error");
    });
};

export {
  buildColumns,
  buildTableRows,
  onFirstDataRendered,
  excelExport,
  filterTable,
  pdfExport,
  clipboardExport,
  getRecruitmentData,
  onRowRecruitmentUserClick,
  generateRecruitmentTable,
  selectTableHandler,
  getTableNames,
  toggleRegistration,
  selectDepartmentHandler,
  switchBarChart,
  getDepartmentOptions,
  getOpenedDepartments,
  openDepartmentsHandler,
  createNewSqlAndDbTable,
  buildUserNames,
  deleteTable,
  swalDeleteRecruitmentTable,
  deleteRecruitmentMemberFromDB,
  swalDeleteApplication,
};
