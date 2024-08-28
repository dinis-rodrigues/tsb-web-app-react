import { ColumnApi, GridApi, RowClickedEvent } from "ag-grid-community";
// Table
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine-dark.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import cx from "classnames";
import { useEffect, useState } from "react";
import { Input } from "react-rainbow-components";
import Select from "react-select";
import { DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from "reactstrap";
import { useAuth } from "../../../contexts/AuthContext";
import { PersonalInformation, UserMetadata, selectOption, tableColumns } from "../../../interfaces";
import { setColumnText } from "../../../utils/generalFunctions";
import { filterTable, handleSelectOption, onFirstDataRendered } from "../../Team/TeamUtils";
import ApplicationSettings from "./ApplicationSettings";
import UserManagementModal from "./UserManagementModal";
import {
  clipboardAllExport,
  defaultOptions,
  excelAllExport,
  getAllUserDataForTable,
  onRowUserClick,
  pdfAllExport,
} from "./userManagementUtils";

const UserManagement = () => {
  const { USER, isDarkMode } = useAuth();
  const [gridApi, setGridApi] = useState<GridApi>(); // Table API
  const [columnApi, setColumnApi] = useState<ColumnApi>(); // Column API
  const [infoOptions, setInfoOptions] = useState<selectOption[]>([]); // ALl select input options
  const [selectedOptions, setSelectedOptions] = useState<selectOption[]>(defaultOptions); // selected options
  const [usersMetadata, setUsersMetadata] = useState<UserMetadata>({});

  const [tableRowsData, setTableRowsData] = useState<PersonalInformation[]>([]); // row data
  const [tableColumns, setTableColumns] = useState<tableColumns[]>([]); // column definitions

  const [modalOpen, setModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<PersonalInformation>();

  const [selectPositions, setSelectPositions] = useState({});

  const [modalTitle, setModalTitle] = useState("");

  const tableOptions = {
    enableCellTextSelection: false,
    enableRangeSelection: true,
    onRowClicked: (e: RowClickedEvent) =>
      onRowUserClick(e, USER, setUserInfo, setSelectPositions, setModalOpen, setModalTitle),
  };

  useEffect(() => {
    getAllUserDataForTable(
      USER,
      setTableColumns,
      setTableRowsData,
      setInfoOptions,
      setColumnText,
      setUsersMetadata,
      false,
    );
  }, [USER]);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <ApplicationSettings />
        <div className="main-card mb-3 card">
          <div className="card-header">
            <i className="header-icon lnr-pencil icon-gradient bg-plum-plate"></i>
            Edit User Information
            <div className="btn-actions-pane-right text-capitalize">
              <UncontrolledButtonDropdown>
                <DropdownToggle color="btn" className="p-0 mr-2">
                  <span className="btn-wide btn-dark mr-md-2 btn btn-sm dropdown-toggle">
                    <i className="fa fa-download text-white btn-icon-wrapper"></i> Download
                  </span>
                </DropdownToggle>
                <DropdownMenu right className="rm-pointers dropdown-menu">
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => clipboardAllExport(gridApi)}
                  >
                    Clipboard
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => excelAllExport(gridApi)}
                  >
                    Excel
                  </button>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => pdfAllExport(gridApi, columnApi)}
                  >
                    PDF
                  </button>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            </div>
          </div>
          <div className="card-body">
            <h5 className="card-title">Select which information to display</h5>
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
                      setTableRowsData,
                    );
                  }}
                />
              </div>
              <div className="col-md-4">
                <Input
                  placeholder="Filter..."
                  icon={<i className="fa fa-search"></i>}
                  onChange={(e) => {
                    filterTable(e, gridApi);
                  }}
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
                rowData={tableRowsData}
                gridOptions={tableOptions}
                columnDefs={tableColumns}
                onFirstDataRendered={(params) =>
                  onFirstDataRendered(params, setGridApi, setColumnApi)
                }
                onGridReady={(params) => onFirstDataRendered(params, setGridApi, setColumnApi)}
              ></AgGridReact>
            </div>
          </div>
        </div>
      </div>
      {userInfo && (
        <UserManagementModal
          setModalIsOpen={setModalOpen}
          modalTitle={modalTitle}
          modalIsOpen={modalOpen}
          info={userInfo}
          setInfo={setUserInfo}
          selectPositions={selectPositions}
          setSelectPositions={setSelectPositions}
        />
      )}
    </div>
  );
};

export default UserManagement;
