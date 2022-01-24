import { Fragment, useState, useEffect } from "react";
import Select from "react-select";
import cx from "classnames";
import {
  PersonalInformation,
  selectOption,
  tableColumns,
} from "../../interfaces";
import { useAuth } from "../../contexts/AuthContext";
import { setColumnText } from "../../utils/generalFunctions";
import {
  DropdownToggle,
  DropdownMenu,
  UncontrolledButtonDropdown,
} from "reactstrap";

import {
  clipboardExport,
  defaultOptions,
  excelExport,
  handleSelectOption,
  pdfExport,
  filterTable,
  onFirstDataRendered,
  getTeamDataForTable,
} from "./TeamUtils";

// Table
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import { ColumnApi, GridApi } from "ag-grid-community";

// Layout

const Team = () => {
  const { USER, usersMetadata, isDarkMode } = useAuth();
  // Default table options
  const gridOptions = {
    enableCellTextSelection: false,
    enableRangeSelection: true,
  };

  const [gridApi, setGridApi] = useState<GridApi>(); // Table API
  const [columnApi, setColumnApi] = useState<ColumnApi>(); // Column API
  const [infoOptions, setInfoOptions] = useState<selectOption[]>([]); // ALl select input options
  const [selectedOptions, setSelectedOptions] =
    useState<selectOption[]>(defaultOptions); // selected options
  // const [usersInfo, setUsersInfo] = useState<UserMetadata>({}); // user metadata
  const [tableRowsData, setTableRowsData] = useState<PersonalInformation[]>([]); // row data
  const [tableColumns, setTableColumns] = useState<tableColumns[]>([]); // column definitions

  // Select Options
  useEffect(() => {
    // Retrieve user metadata to fill table
    getTeamDataForTable(
      usersMetadata,
      USER,
      setTableColumns,
      setTableRowsData,
      setInfoOptions,
      setColumnText
    );
  }, [USER, usersMetadata]);

  return (
    <Fragment>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="main-card mb-3 card">
            <div className="card-header">
              <i className="header-icon lnr-license icon-gradient bg-plum-plate"></i>
              Current Members
              <div className="btn-actions-pane-right text-capitalize">
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
                      onClick={() => excelExport(gridApi)}
                    >
                      Excel
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => pdfExport(gridApi, columnApi)}
                    >
                      PDF
                    </button>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </div>
            </div>
            <div className="card-body">
              <h5 className="card-title">
                Select which information to display
              </h5>
              <div className="row" style={{ paddingBottom: "1rem" }}>
                <div className="col-md-8">
                  <Select
                    classNamePrefix="react-select-container"
                    isMulti
                    options={infoOptions}
                    value={selectedOptions}
                    onChange={(e) => {
                      handleSelectOption(
                        e,
                        usersMetadata,
                        setSelectedOptions,
                        setTableColumns,
                        setTableRowsData
                      );
                    }}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    onChange={(e) => {
                      filterTable(e, gridApi);
                    }}
                    className={"form-control"}
                    placeholder={"Search..."}
                    type="text"
                  />
                </div>
                {/* <button onClick={excelExport}>export</button> */}
              </div>
              <div
                className={cx({
                  "ag-theme-alpine": !isDarkMode,
                  "ag-theme-alpine-dark": isDarkMode,
                })}
                style={{ height: "30rem", width: "100%" }}
              >
                <AgGridReact
                  rowData={tableRowsData}
                  gridOptions={gridOptions}
                  columnDefs={tableColumns}
                  onFirstDataRendered={(params) =>
                    onFirstDataRendered(params, setGridApi, setColumnApi)
                  }
                  onGridReady={(params) =>
                    onFirstDataRendered(params, setGridApi, setColumnApi)
                  }
                ></AgGridReact>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Team;
