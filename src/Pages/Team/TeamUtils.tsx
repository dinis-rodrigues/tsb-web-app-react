import { dateComparator } from "../../utils/generalFunctions";
import {
  PersonalInformation,
  selectOption,
  tableColumns,
  userContext,
  UserMetadata,
} from "../../interfaces";
import { ColumnApi, GridApi, GridReadyEvent } from "ag-grid-community";
import printDoc from "../../utils/pdfExport/printDoc";

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
];

/**
 * Builds AG grid table columns
 * @param selectedOptions
 * @param setTableColumns
 */
const buildColumns = (
  selectedOptions: selectOption[],
  setTableColumns: Function
) => {
  // Build column definition
  const columnsDefs: tableColumns[] = [];
  for (const selected of selectedOptions) {
    const key = selected.value;
    // const label = selected.label;
    if (key === "name") {
      columnsDefs.push({ field: key, sortable: true, pinned: "left" });
    } else if (key === "birth" || key === "joinedIn") {
      columnsDefs.push({
        field: key,
        sortable: true,
        comparator: dateComparator,
      });
    } else {
      columnsDefs.push({ field: key, sortable: true });
    }
  }
  setTableColumns(columnsDefs);
};

/**
 * Builds AG grid table rows from users metadata
 * @param usersMetadata
 * @param selectedOptions
 * @param setTableRowsData
 */
const buildTableRows = (
  usersMetadata: UserMetadata,
  selectedOptions: selectOption[],
  setTableRowsData: Function,
  onlyInTeamUsers: boolean = true
) => {
  // loop selectedOptions value keys ->
  const rows: PersonalInformation[] = [];
  if (usersMetadata) {
    Object.keys(usersMetadata).forEach((key: string, idx: number) => {
      const currUser = usersMetadata[key];
      let userRow: any = {};
      if (onlyInTeamUsers) {
        if (currUser.pinfo.inTeam) {
          // loop selected options to build row
          for (const selected of selectedOptions) {
            const key = selected.value as keyof typeof currUser.pinfo;
            // const label = selected.label;
            userRow[key] = currUser.pinfo[key];
          }
          rows.push(userRow);
        }
      } else {
        // loop selected options to build row
        for (const selected of selectedOptions) {
          const meta = selected.value as keyof typeof currUser.pinfo;
          // const label = selected.label;
          userRow[meta] = currUser.pinfo[meta];
        }
        userRow = { ...userRow, userId: key };
        rows.push(userRow);
      }
    });
  }
  setTableRowsData(rows);
};

/**
 * Select handler. Set columns to display on the table
 * @param e
 * @param usersInfo
 * @param setSelectedOptions
 * @param setTableColumns
 * @param setTableRowsData
 */
const handleSelectOption = (
  e: any,
  usersInfo: UserMetadata,
  setSelectedOptions: Function,
  setTableColumns: Function,
  setTableRowsData: Function
) => {
  setSelectedOptions(e);
  buildTableRows(usersInfo, e, setTableRowsData, false);
  buildColumns(e, setTableColumns);
};

// Table Functions
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
    state: [{ colId: "name", sort: "asc" }],
  });
  setGridApi(params.api);
  setColumnApi(params.columnApi);
};

/**
 * Get the team export file name
 * @returns
 */
const exportedFilename = () => {
  const base = "TSB_Team_Members_";
  const year = new Date().getFullYear();
  return base + year;
};

/**
 * Export table to excel
 * @param gridApi
 * @returns
 */
const excelExport = (gridApi: GridApi | undefined) => {
  if (!gridApi) return;
  gridApi.exportDataAsExcel({ fileName: exportedFilename() + ".xlsx" });
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
  columnApi: ColumnApi | undefined
) => {
  if (!gridApi || !columnApi) return;
  printDoc(gridApi, columnApi, exportedFilename());
};

/**
 * Processes user metadata to build table columns and rows data
 * @param usersMetadata
 * @param user
 * @param setTableColumns
 * @param setTableRowsData
 * @param setInfoOptions
 * @param setColumnText
 * @param onlyInTeamUsers
 * @returns
 */
const getTeamDataForTable = (
  usersMetadata: UserMetadata,
  user: userContext | null,
  setTableColumns: Function,
  setTableRowsData: Function,
  setInfoOptions: Function,
  setColumnText: Function,
  onlyInTeamUsers: boolean = true
) => {
  if (!user) {
    return;
  }
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
  // }
};
export {
  defaultOptions,
  buildColumns,
  buildTableRows,
  handleSelectOption,
  onFirstDataRendered,
  excelExport,
  filterTable,
  pdfExport,
  clipboardExport,
  getTeamDataForTable,
};
