import { Fragment, useState, useEffect } from "react";
import {
  RecruitmentData,
  RecruitmentTable,
  RecruitmentUser,
  selectOption,
  tableColumns,
} from "../../interfaces";
import { useAuth } from "../../contexts/AuthContext";
import Select from "react-select";
import {
  DropdownToggle,
  DropdownMenu,
  UncontrolledButtonDropdown,
} from "reactstrap";

import {
  clipboardExport,
  excelExport,
  pdfExport,
  filterTable,
  onFirstDataRendered,
  getRecruitmentData,
  onRowRecruitmentUserClick,
  selectTableHandler,
  selectDepartmentHandler,
} from "./recruitmentUtils";

// Table
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ColumnApi, GridApi, RowClickedEvent } from "ag-grid-community";
import RecruitmentUserModal from "./RecruitmentUserModal";
import RecruitmentSettings from "./RecruitmentSetting";
import RecruitmentDegreeCount from "./RecruitmentDegreeCount";
import RecruitmentYearCount from "./RecruitmentYearDepCount";
import { db } from "../../config/firebase";

import { CheckboxGroup, Input } from "react-rainbow-components";

// Layout

const Recruitment = () => {
  const { USER } = useAuth();
  // Default table options
  const gridOptions = {
    enableCellTextSelection: false,
    enableRangeSelection: true,
    onRowClicked: (e: RowClickedEvent) =>
      onRowRecruitmentUserClick(e, setUserInfo, setModalOpen),
  };

  const [gridApi, setGridApi] = useState<GridApi>(); // Table API
  const [columnApi, setColumnApi] = useState<ColumnApi>(); // Column API
  // const [usersInfo, setUsersInfo] = useState<UserMetadata>({}); // user metadata
  const [tableRows, setTableRows] = useState<RecruitmentUser[]>([]); // row data
  const [tableColumns, setTableColumns] = useState<tableColumns[]>([]); // column definitions

  const [activeRecruitment, setActiveRecruitment] = useState<string | boolean>(
    false
  );
  const [currTableName, setCurrTableName] = useState<string | boolean>(false);
  const [currTableData, setCurrTableData] = useState<RecruitmentTable>();
  const [recruitmentData, setRecruitmentData] = useState<RecruitmentData>();
  const [modalOpen, setModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<RecruitmentUser>();
  const [tablesList, setTablesList] = useState<string[]>([]);
  const [tableOptions, setTableOptions] = useState<selectOption[]>([]);

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<selectOption[]>(
    []
  );

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
      setSelectedDepartments
    );
    return () => {
      db.ref("public/recruitment").off("value");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [USER]);

  return (
    <Fragment>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <RecruitmentSettings
            tableName={currTableName}
            tablesList={tablesList}
            activeRecruitment={activeRecruitment}
            setActiveRecruitment={setActiveRecruitment}
          />
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
                        onClick={() => excelExport(gridApi, currTableName)}
                      >
                        Excel
                      </button>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() =>
                          pdfExport(gridApi, columnApi, currTableName)
                        }
                      >
                        PDF
                      </button>
                    </DropdownMenu>
                  </UncontrolledButtonDropdown>
                  <Select
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
                        setSelectedDepartments
                      );
                    }}
                    value={
                      currTableName
                        ? { value: currTableName, label: currTableName }
                        : {}
                    }
                    options={tableOptions}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="row" style={{ paddingBottom: "1rem" }}>
                <div className="col-md-4">
                  {/* <input
                    onChange={(e) => {
                      filterTable(e, gridApi);
                    }}
                    className={"form-control"}
                    placeholder={"Search..."}
                    type="text"
                  /> */}
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
                    label="Filter by Department"
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
                        setTableColumns
                      )
                    }
                  />
                </div>
                {/* <button onClick={excelExport}>export</button> */}
              </div>
              <div
                className="ag-theme-alpine"
                style={{ height: "30rem", width: "100%" }}
              >
                <AgGridReact
                  rowData={tableRows}
                  gridOptions={gridOptions}
                  columnDefs={tableColumns}
                  onFirstDataRendered={(params) =>
                    onFirstDataRendered(params, setGridApi, setColumnApi)
                  }
                  onGridReady={(params) =>
                    onFirstDataRendered(params, setGridApi, setColumnApi)
                  }
                  animateRows
                ></AgGridReact>
              </div>
            </div>
          </div>
        </div>
      </div>
      {userInfo && (
        <RecruitmentUserModal
          modalIsOpen={modalOpen}
          setModalIsOpen={setModalOpen}
          info={userInfo}
        />
      )}
    </Fragment>
  );
};

export default Recruitment;
