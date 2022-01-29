import {
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";

import cx from "classnames";
import { AgGridReact } from "ag-grid-react";
import { Flow } from "../../interfaces";
import { useEffect, useState } from "react";
import { dateComparator } from "../../utils/generalFunctions";
import {
  ColDef,
  ColumnApi,
  GridApi,
  ICellRendererParams,
  RowClickedEvent,
} from "ag-grid-community";
import BadgeRender from "./badgeRender";
import {
  filterTable,
  clipboardExport,
  excelExport,
  onRowClick,
  openFlowModal,
  pdfExport,
  onFirstDataRendered,
} from "./cashFlowUtils";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "react-rainbow-components";

type Props = {
  tableTitle: string;
  tableFlow: [string, Flow, number][];
  setModalOpen: Function;
  setFlowInfo: Function;
  setShowDeleteButton: Function;
};

/** Builds the row data table structure
 * @param  {[string, Flow, number][]} tableFlow list of flow data
 * @param  {Function} setTableRows saves the table row data in state
 */
const buildTableRows = (
  tableFlow: [string, Flow, number][],
  setTableRows: Function,
  gridApi: GridApi | null
) => {
  let rows = tableFlow.map(([flowId, flow, cumSum]) => ({
    ...flow,
    id: flowId,
    date: flow.date.replaceAll("-", "/"),
    type: `${flow.type}`,
    total:
      Number(cumSum)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " €", // add commas and euro sign
  }));
  setTableRows(rows);
  if (gridApi && rows.length > 10) {
    gridApi.setDomLayout("normal");
  }
};

const CashFlowTable = ({
  tableTitle,
  tableFlow,
  setModalOpen,
  setFlowInfo,
  setShowDeleteButton,
}: Props) => {
  const { isDarkMode } = useAuth();
  const gridOptions = {
    enableCellTextSelection: false,
    enableRangeSelection: true,
    onRowClicked: (e: RowClickedEvent) =>
      onRowClick(e, setFlowInfo, setModalOpen, setShowDeleteButton),
  };
  const tableColumns: ColDef[] = [
    { field: "description", sortable: true },
    { field: "entity", sortable: true },
    { field: "date", sortable: true, comparator: dateComparator },
    {
      field: "type",
      sortable: true,
      cellRendererFramework: (props: ICellRendererParams) => (
        <BadgeRender {...props} />
      ),
    },
    { field: "value", sortable: true },
    { field: "total", sortable: true },
  ];
  const [tableRows, setTableRows] = useState([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null); // Table API
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null); // Column API

  useEffect(() => {
    buildTableRows(tableFlow, setTableRows, gridApi);
    return () => {};
  }, [tableFlow]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="main-card mb-3 card">
      <div className="card-header">
        <i className="header-icon fas fa-money-bill icon-gradient bg-happy-green"></i>
        Cash Flow - {tableTitle}
        <div className="btn-actions-pane-right text-capitalize">
          <button
            onClick={() => openFlowModal(setModalOpen, setFlowInfo, tableTitle)}
            className="btn-wide btn-dark mr-md-2 btn btn-sm"
          >
            <i className="fa fa-euro-sign text-white btn-icon-wrapper"></i>
            Add Flow
          </button>

          <UncontrolledButtonDropdown>
            <DropdownToggle color="btn" className="p-0 mr-2">
              <span className="btn-wide btn-dark mr-md-2 btn btn-sm dropdown-toggle">
                <i className="fa fa-download text-white btn-icon-wrapper"></i>{" "}
                Download
              </span>
            </DropdownToggle>
            <DropdownMenu right className="rm-pointers dropdown-menu">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => clipboardExport(gridApi)}
              >
                Clipboard
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => excelExport(gridApi, tableTitle)}
              >
                Excel
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => pdfExport(tableTitle, gridApi, columnApi)}
              >
                PDF
              </button>
            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>
      </div>
      <div className="card-body">
        <Input
          className="mb-2"
          placeholder="Filter..."
          icon={<i className="fa fa-search"></i>}
          onChange={(e) => {
            filterTable(e, gridApi);
          }}
        />
        <div
          className={cx({
            "ag-theme-alpine": !isDarkMode,
            "ag-theme-alpine-dark": isDarkMode,
          })}
          style={{
            height: "20rem",
            width: "100%",
          }}
        >
          {
            <AgGridReact
              rowData={tableRows}
              columnDefs={tableColumns}
              gridOptions={gridOptions}
              onFirstDataRendered={(params) =>
                onFirstDataRendered(params, setGridApi, setColumnApi)
              }
              onGridReady={(params) =>
                onFirstDataRendered(params, setGridApi, setColumnApi)
              }
              overlayNoRowsTemplate={"<span >I love you <3</span>"}
            ></AgGridReact>
          }
        </div>
      </div>
    </div>
  );
};

export default CashFlowTable;
