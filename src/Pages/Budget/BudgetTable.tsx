import {
  ColDef,
  GridApi,
  ICellRendererParams,
  RowClickedEvent,
  ValueGetterParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import cx from "classnames";
import { useEffect, useState } from "react";
import { Input } from "react-rainbow-components";
import { DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from "reactstrap";
import { useAuth } from "../../contexts/AuthContext";
import { BomMaterial, UserMetadata } from "../../interfaces";
import { dateComparator } from "../../utils/generalFunctions";
import AssignedUserRender from "./assignedUserRender";
import BadgeBomRender from "./badgeBomRender";
import {
  buildBudgetRows,
  clipboardExport,
  excelExport,
  filterTable,
  onFirstDataRendered,
  onRowBomClick,
  openCleanMaterialModal,
  pdfExport,
} from "./budgetUtils";

type Props = {
  tableData: [string, BomMaterial][];
  department: string;
  setMoney: Function;
  setIsModalOpen: Function;
  setShowDeleteButton: Function;
  setMaterialInfo: Function;
  setMaterialInfoMask: Function;
  setCommentListener: Function;
  season: string;
  usersMetadata: UserMetadata;
  allTabs: {
    [key: string]: { icon: string; description: string; gradientColor: string };
  };
};

const BudgetTable = ({
  tableData,
  department,
  setMoney,
  setIsModalOpen,
  setShowDeleteButton,
  setMaterialInfo,
  setMaterialInfoMask,
  setCommentListener,
  season,
  allTabs,
  usersMetadata,
}: Props) => {
  const { isDarkMode } = useAuth();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<GridApi | null>(null); // Column API
  const [tableRows, setTableRows] = useState([]);
  const tableOptions = {
    enableCellTextSelection: false,
    enableRangeSelection: true,
    onRowClicked: (e: RowClickedEvent) =>
      onRowBomClick(
        e,
        setMaterialInfo,
        setMaterialInfoMask,
        setIsModalOpen,
        setShowDeleteButton,
        setCommentListener,
      ),
  };

  // Table column definition
  const tableColumns: ColDef[] = [
    {
      field: "assignedTo",
      sortable: true,
      cellRenderer: (props: ICellRendererParams) => (
        <AssignedUserRender props={props} usersMetadata={usersMetadata} />
      ),
      valueGetter: (params: ValueGetterParams) => params.data.assignedTo.label, // for the pdf etc exports
    },
    { field: "description", sortable: true },
    { field: "from", sortable: true },
    {
      field: "status",
      sortable: true,
      cellRenderer: (props: ICellRendererParams) => <BadgeBomRender {...props} />,
    },
    { field: "date", sortable: true, comparator: dateComparator },
    { field: "quantity", sortable: true },
    { field: "unitaryValue", sortable: true },
    { field: "totalValue", sortable: true },
  ];

  useEffect(() => {
    buildBudgetRows(tableData, setTableRows, setMoney);
    return () => {};
  }, [tableData, setMoney]);
  return (
    <div className="main-card mb-3 card">
      <div className="card-header">
        <i
          className={cx(
            "header-icon icon-gradient fa",
            allTabs[department].icon,
            allTabs[department].gradientColor,
          )}
        ></i>
        Budget - {allTabs[department].description}
        <div className="btn-actions-pane-right text-capitalize">
          <button
            type="button"
            onClick={() =>
              openCleanMaterialModal(setIsModalOpen, setMaterialInfo, setShowDeleteButton)
            }
            className="btn-wide btn-info mr-md-2 btn btn-sm"
          >
            <i className="fa fa-hammer text-white btn-icon-wrapper"></i> Add Material
          </button>

          <UncontrolledButtonDropdown>
            <DropdownToggle color="btn" className="p-0 mr-2">
              <span className="btn-wide btn-info mr-md-2 btn btn-sm dropdown-toggle">
                <i className="fa fa-download text-white btn-icon-wrapper"></i> Download
              </span>
            </DropdownToggle>
            <DropdownMenu end className="rm-pointers dropdown-menu">
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
                onClick={() => excelExport(gridApi, department)}
              >
                Excel
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => pdfExport(department, gridApi, columnApi)}
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
            height: "30rem",
            width: "100%",
          }}
        >
          {
            <AgGridReact
              rowData={tableRows}
              columnDefs={tableColumns}
              gridOptions={tableOptions}
              onFirstDataRendered={(params) =>
                onFirstDataRendered(params, setGridApi, setColumnApi)
              }
              onGridReady={(params) => onFirstDataRendered(params, setGridApi, setColumnApi)}
              overlayNoRowsTemplate={"<span >I love you <3</span>"}
            ></AgGridReact>
          }
        </div>
      </div>
    </div>
  );
};

export default BudgetTable;
