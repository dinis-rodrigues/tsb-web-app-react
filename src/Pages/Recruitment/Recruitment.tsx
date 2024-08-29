import { useEffect, useState } from "react";
import Select from "react-select";
import { DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from "reactstrap";
import { useAuth } from "../../contexts/AuthContext";
import { RecruitmentData, RecruitmentTable, RecruitmentUser, selectOption } from "../../interfaces";

import {
  clipboardExport,
  deleteTable,
  excelExport,
  filterTable,
  getRecruitmentData,
  onFirstDataRendered,
  onRowRecruitmentUserClick,
  pdfExport,
  selectDepartmentHandler,
  selectTableHandler,
  swalDeleteRecruitmentTable,
} from "./recruitmentUtils";

// Table
import { ColDef, GridApi, RowClickedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { db } from "../../config/firebase";
import RecruitmentDegreeCount from "./RecruitmentDegreeCount";
import RecruitmentSettings from "./RecruitmentSetting";
import RecruitmentUserModal from "./RecruitmentUserModal";
import RecruitmentYearCount from "./RecruitmentYearDepCount";

import cx from "classnames";
import { off, ref } from "firebase/database";
import { CheckboxGroup, Input } from "react-rainbow-components";

// Layout

const Recruitment = () => {
  const { USER, isMarketingOrAdmin, isDarkMode } = useAuth();
  // Default table options
  const gridOptions = {
    enableCellTextSelection: false,
    enableRangeSelection: true,
    onRowClicked: (e: RowClickedEvent) => onRowRecruitmentUserClick(e, setUserInfo, setModalOpen),
  };

  const [gridApi, setGridApi] = useState<GridApi>(); // Table API
  const [columnApi, setColumnApi] = useState<GridApi>(); // Column API
  // const [usersInfo, setUsersInfo] = useState<UserMetadata>({}); // user metadata
  const [tableRows, setTableRows] = useState<RecruitmentUser[]>([]); // row data
  const [tableColumns, setTableColumns] = useState<ColDef[]>([]); // column definitions

  const [activeRecruitment, setActiveRecruitment] = useState<string | boolean>(false);
  const [currTableName, setCurrTableName] = useState<string | boolean>(false);
  const [currTableData, setCurrTableData] = useState<RecruitmentTable>();
  const [recruitmentData, setRecruitmentData] = useState<RecruitmentData>();
  const [modalOpen, setModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<RecruitmentUser>();
  const [tablesList, setTablesList] = useState<string[]>([]);
  const [tableOptions, setTableOptions] = useState<selectOption[]>([]);

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<selectOption[]>([]);

  // Select Options
  useEffect(() => {
    // Retrieve user metadata to fill table
    getRecruitmentData(
      currTableName,
      currTableData,
      selectedDepartments,
      setCurrTableName,
      setCurrTableData,
      setTableRows,
      setTableColumns,
      setRecruitmentData,
      setTablesList,
      setTableOptions,
      setActiveRecruitment,
      setDepartmentOptions,
      setSelectedDepartments,
    );
    return () => {
      off(ref(db, "public/recruitment"));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [USER]);

  return (
    <>
      <div className="app-main__outer">
        <div className="app-main__inner">
          {isMarketingOrAdmin && (
            <RecruitmentSettings
              tableName={currTableName}
              tablesList={tablesList}
              activeRecruitment={activeRecruitment}
              setActiveRecruitment={setActiveRecruitment}
            />
          )}
          {currTableData && (
            <div className="row">
              <RecruitmentDegreeCount tableData={currTableData} />
              <RecruitmentYearCount tableData={currTableData} />
            </div>
          )}
          <div className="main-card mb-3 card">
            <div className="card-header">
              <i className="header-icon lnr-license icon-gradient bg-plum-plate"></i>
              {currTableName}
              <div className="btn-actions-pane-right text-capitalize">
                <div className="row mr-1">
                  {isMarketingOrAdmin && (
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded="false"
                      className="p-0 mr-2 btn btn-btn"
                      onClick={() =>
                        swalDeleteRecruitmentTable(() =>
                          deleteTable(currTableName as string, tablesList),
                        )
                      }
                    >
                      <span className="btn-wide btn-danger mr-md-2 btn btn-sm">Delete</span>
                    </button>
                  )}
                  <UncontrolledButtonDropdown>
                    <DropdownToggle color="btn" className="p-0 mr-2">
                      <span className="btn-wide btn-dark mr-md-2 btn btn-sm dropdown-toggle">
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
                        onClick={() => excelExport(gridApi, currTableName)}
                      >
                        Excel
                      </button>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => pdfExport(gridApi, columnApi, currTableName)}
                      >
                        PDF
                      </button>
                    </DropdownMenu>
                  </UncontrolledButtonDropdown>
                  <Select
                    classNamePrefix="react-select-container"
                    className="sel-width text-center"
                    onChange={(selected) => {
                      selectTableHandler(
                        selected,
                        recruitmentData,
                        selectedDepartments,
                        setCurrTableName,
                        setTableColumns,
                        setTableRows,
                        setCurrTableData,
                        setDepartmentOptions,
                        setSelectedDepartments,
                      );
                    }}
                    value={currTableName ? { value: currTableName, label: currTableName } : {}}
                    options={tableOptions}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row" style={{ paddingBottom: "1rem" }}>
                <div className="col-md-4">
                  <Input
                    className="datePicker mt-1"
                    style={{ borderRadius: "25px" }}
                    placeholder="Search..."
                    icon={<i className="fa fa-search"></i>}
                    onChange={(e) => {
                      filterTable(e, gridApi);
                    }}
                  />
                </div>
                <div className="col">
                  <CheckboxGroup
                    id="checkbox-group-2"
                    label={"Filter by Department"}
                    options={departmentOptions}
                    value={selectedDepartments}
                    orientation={"horizontal"}
                    onChange={(values) =>
                      selectDepartmentHandler(
                        values,
                        recruitmentData,
                        currTableName,
                        setSelectedDepartments,
                        setCurrTableData,
                        setTableRows,
                        setTableColumns,
                      )
                    }
                  />
                </div>
                {/* <button type="button" onClick={excelExport}>export</button> */}
              </div>
              <div
                className={cx({
                  "ag-theme-alpine": !isDarkMode,
                  "ag-theme-alpine-dark": isDarkMode,
                })}
                style={{ height: "30rem", width: "100%" }}
              >
                <AgGridReact
                  rowData={tableRows}
                  gridOptions={gridOptions}
                  columnDefs={tableColumns}
                  onFirstDataRendered={(params) =>
                    onFirstDataRendered(params, setGridApi, setColumnApi)
                  }
                  onGridReady={(params) => onFirstDataRendered(params, setGridApi, setColumnApi)}
                  overlayNoRowsTemplate={"<span >No applications yet :(</span>"}
                  animateRows
                ></AgGridReact>
              </div>
            </div>
          </div>
        </div>
      </div>
      {userInfo && (
        <RecruitmentUserModal
          tableName={currTableName}
          modalIsOpen={modalOpen}
          setModalIsOpen={setModalOpen}
          info={userInfo}
        />
      )}
    </>
  );
};

export default Recruitment;
