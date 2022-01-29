import { useEffect, useState } from "react";
import { Nav, NavItem, NavLink, UncontrolledTooltip } from "reactstrap";
import Select from "react-select";
import cx from "classnames";
import { v4 as uuid } from "uuid";
import { db } from "../../config/firebase";
import {
  bomDefaultData,
  closeMaterialModal,
  defaultMaterial,
  deleteSeason,
  getSeasonBudgetData,
  swalBomDeleteMessage,
} from "./budgetUtils";
import { BomMaterial, BomMoney, selectOption } from "../../interfaces";
import { setUserAssignmentOptions } from "../../utils/generalFunctions";
import BudgetTable from "./BudgetTable";
import BudgetModal from "./BudgetModal";
import { useAuth } from "../../contexts/AuthContext";
import CreateSeasonModal from "./CreateSeasonModal";
import { child, off, ref } from "firebase/database";

const toggle = (tab: string, activeTab: string, setActiveTab: Function) => {
  setActiveTab(tab);
};

const seasonSelectHandler = (
  selected: any,
  season: string,
  setSeason: Function
) => {
  // remove all database reference listeners from current season
  off(child(ref(db, "private/bom"), season));
  setSeason(selected.value.replace("/", "-"));
};

const Budget = (props: any) => {
  const { USER, usersMetadata, departmentsWDesc } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [tableData, setTableData] = useState(bomDefaultData);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState<boolean>(false);
  const [userOptions, setUserOptions] = useState<selectOption[] | []>([]);
  const [season, setSeason] = useState("");
  const [seasonsOptions, setSeasonsOptions] = useState<selectOption[]>([]);
  const [materialInfo, setMaterialInfo] =
    useState<BomMaterial>(defaultMaterial);
  const [materialInfoMask, setMaterialInfoMask] =
    useState<BomMaterial>(defaultMaterial);
  const [money, setMoney] = useState<BomMoney>({
    acquired: 0,
    total: 0,
    percentage: 0,
  });
  const [commentListener, setCommentListener] = useState("");
  const allTabs = {
    All: {
      description: "All",
      icon: "fa-globe-europe",
      gradientColor: "bg-night-fade",
    },
    ...departmentsWDesc,
  };

  const [openedFromRedirect, setOpenedFromRedirect] = useState(true);

  // if it was clicked from the To Do board in dashboard
  const openMatId = props.location.elId;
  const openSeasonId = props.location.colId;

  useEffect(() => {
    setUserAssignmentOptions(setUserOptions, usersMetadata);

    getSeasonBudgetData(
      departmentsWDesc,
      season,
      openMatId,
      openSeasonId,
      openedFromRedirect,
      setSeasonsOptions,
      setSeason,
      setTableData,
      setLoadingData,
      setOpenedFromRedirect,
      setMaterialInfo,
      setMaterialInfoMask,
      setIsModalOpen,
      setShowDeleteButton,
      setCommentListener
    );

    // Get users metadata and set the state of user options

    return () => {
      off(ref(db, `private/season/${season}`));
    };
  }, [season, openMatId, openSeasonId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {/* Progress Bar */}
        <div className="row">
          <div className="col">
            <div className="card mb-3 widget-chart ">
              <div className="widget-chart-content">
                <div
                  className={"row justify-content-center mb-2"} // center contents
                  style={{ opacity: 1 }}
                >
                  <Select
                    classNamePrefix="react-select-container"
                    className={"sel-width-budget"}
                    value={[
                      {
                        value: season.replace("-", "/"),
                        label: season.replace("-", "/"),
                      },
                    ]}
                    onChange={(selected) => {
                      seasonSelectHandler(selected, season, setSeason);
                    }}
                    options={seasonsOptions}
                  />
                  <button
                    id={"createSeason"}
                    onClick={() => setIsSeasonModalOpen(true)}
                    className="ml-md-2 btn-icon btn-icon-only btn btn-outline-success"
                  >
                    <i className="fas fa-plus btn-icon-wrapper"> </i>
                  </button>
                  <button
                    id={"deleteSeason"}
                    onClick={() =>
                      swalBomDeleteMessage(() =>
                        deleteSeason(season, seasonsOptions)
                      )
                    }
                    className="ml-md-2 btn-icon btn-icon-only btn btn-outline-danger"
                  >
                    <i className="fas fa-trash btn-icon-wrapper"> </i>
                  </button>
                  <UncontrolledTooltip
                    placement={"top"}
                    target={"createSeason"}
                  >
                    Create new season
                  </UncontrolledTooltip>
                  <UncontrolledTooltip
                    placement={"top"}
                    target={"deleteSeason"}
                  >
                    Delete new season
                  </UncontrolledTooltip>
                </div>
                <div className="widget-subheading">
                  Progress of Acquired Budget
                </div>
                <div className="widget-numbers">
                  <span id="BAcquiredBudget">{money.acquired} €</span> of{" "}
                  <span id="BTotalBudget">
                    {Number(money.total).toFixed(2)} €
                  </span>
                </div>
                <div className="widget-description text-success">
                  <i className="fas fa-bullseye"></i>
                  <span className="pl-1" id="BBudgetPercentage">
                    {`${money.percentage * 100}%`}
                  </span>
                </div>
              </div>
              <div className="widget-progress-wrapper progress-wrapper-bottom">
                <div className="progress-bar-sm progress-bar-animated-alt progress">
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    aria-valuenow={0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: `${money.percentage * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Nav
          className={
            "body-tabs  body-tabs-layout tabs-animated  body-tabs-animated"
          }
        >
          {Object.entries(allTabs).map(([acronym, department], idx) => (
            <NavItem key={uuid()}>
              <NavLink
                className={cx({ active: activeTab === department.description })}
                onClick={() => {
                  toggle(department.description, activeTab, setActiveTab);
                }}
              >
                <span>{department.description}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>
        {!loadingData && Object.keys(usersMetadata).length > 0 && (
          <BudgetTable
            tableData={tableData[activeTab]}
            setMaterialInfo={setMaterialInfo}
            setMaterialInfoMask={setMaterialInfoMask}
            setIsModalOpen={setIsModalOpen}
            setShowDeleteButton={setShowDeleteButton}
            department={activeTab}
            allTabs={allTabs}
            setMoney={setMoney}
            setCommentListener={setCommentListener}
            season={season}
            usersMetadata={usersMetadata}
          />
        )}
      </div>
      <BudgetModal
        materialInfo={materialInfo}
        materialInfoMask={materialInfoMask}
        setMaterialInfoMask={setMaterialInfoMask}
        isModalOpen={isModalOpen}
        setMaterialInfo={setMaterialInfo}
        showDeleteButton={showDeleteButton}
        closeModal={() =>
          closeMaterialModal(
            setIsModalOpen,
            setMaterialInfo,
            setMaterialInfoMask,
            commentListener,
            setCommentListener
          )
        }
        usersMetadata={usersMetadata}
        assignToOptions={userOptions}
        user={USER}
        season={season}
      />
      <CreateSeasonModal
        isSeasonModalOpen={isSeasonModalOpen}
        setIsSeasonModalOpen={setIsSeasonModalOpen}
        seasonsOptions={seasonsOptions}
      />
    </div>
  );
};

export default Budget;
