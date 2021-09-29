import {
  ColDef,
  ColGroupDef,
  ColumnApi,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { db } from "../../config/firebase";
import {
  RecruitmentData,
  RecruitmentTable,
  RecruitmentTables,
  RecruitmentUser,
} from "../../interfaces";
import {
  dateToString,
  dateWithHoursComparator,
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
  let tables = recruitmentData.tables;
  let newTableData = filterTableByDepartments(
    tables[currTableName],
    selectedDepartments
  );
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
  let newTableData = JSON.parse(
    JSON.stringify(recruitmentData.tables[tableName])
  );
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
  if (!currTableData) return;
  const rows: RecruitmentUser[] = [];
  Object.entries(currTableData).forEach(([key, user]) => {
    let time = user.timestamp;
    user.timestamp = time ? dateToString(new Date(time), true) : "-";

    rows.push(user);
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
    setTableOptions(tableOptionsObj);

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
      let auxTable = JSON.parse(JSON.stringify(tables[tableNames[0]]));
      let newTableData = filterTableByDepartments(
        auxTable,
        selectedDepartments
      );

      // console.log(copiedPerson);
      setCurrTableName(tableNames[0]);
      setCurrTableData(newTableData);
      buildTableRows(newTableData, setTableRows);
      buildColumns(newTableData, setTableColumns);
      getExistingDepartmentsOptions(
        newTableData,
        setDepartmentOptions,
        setSelectedDepartments
      );
      // } else {
      //   setCurrTableName(activeTableName);
      //   setCurrTableData(currTableData);
      //   buildTableRows(currTableData, setTableRows);
      //   buildColumns(currTableData, setTableColumns);
      //   getExistingDepartmentsOptions(
      //     currTableData,
      //     setDepartmentOptions,
      //     setSelectedDepartments
      //   );
      // }
    } else {
      if (typeof currTableName !== "boolean") {
        let auxTable = JSON.parse(JSON.stringify(tables[currTableName]));
        let newTableData = filterTableByDepartments(
          auxTable,
          selectedDepartments
        );
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
};