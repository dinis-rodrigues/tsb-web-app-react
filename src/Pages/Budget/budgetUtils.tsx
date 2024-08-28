import { ColumnApi, GridApi, GridReadyEvent, RowClickedEvent } from "ag-grid-community";
import {
  child,
  off,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from "firebase/database";
import { NumberFormatValues } from "react-number-format";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import {
  BomDb,
  BomMaterial,
  BomTableData,
  Departments,
  DepartmentsWithDesc,
  RedirectedData,
  bomDepartmentIconColorTitle,
  selectOption,
  userContext,
} from "../../interfaces";
import {
  dateToString,
  inputToDate,
  numberWithCommas,
  sendNotification,
} from "../../utils/generalFunctions";
import printDoc from "../../utils/pdfExport/printDoc";

/** SHow a confirmation message to delete the material
 * @param  {Function} deleteBoard function to delete the board
 */
const swalBomDeleteMessage = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      target: ".app-container",
      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
        container: "zIndex-inf",
      },
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete it!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this.</p> <p><h4>Are you sure?</h4></p>`,
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      }
      if (result.isDenied) {
        deleteFunction();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

/** Sorts seasons list by date
 * @param  {string[]} seasonArray the season array
 */
const sortSeasonsArray = (seasonArray: string[]) => {
  return seasonArray.sort((a, b) => {
    const seasonA = parseInt(a.replace("/", ""));
    const seasonB = parseInt(b.replace("/", ""));
    if (seasonA > seasonB) return -1;
    if (seasonA < seasonB) return 1;
    return 0;
  });
};

/** Deletes season from the database
 * @param  {string} season season to delete yyyy-yyyy
 * @param  {selectOption[]} seasonOptions existing seasons in selectOption format
 */
const deleteSeason = (season: string, seasonOptions: selectOption[]) => {
  // season is in form yyyy-yyyy, we want in yyyy/yyyy for the list
  const seasonOfList = season.replace("-", "/");
  // crease season array from select options
  const seasonArray = seasonOptions.map((obj) => obj.value);
  // remove season from the seasons list
  const updatedSeasons = seasonArray.filter((item) => item !== seasonOfList);
  // remove all materials from season
  remove(child(ref(db, "private/bom"), season));
  // update seasons list database
  set(ref(db, "private/bom/seasons"), updatedSeasons);
};

/** Builds rows for the ag grid from the database material data
 * @param  {[string, BomMaterial][]} e data from the database in array form with [key, materialData]
 * @param  {Fucntion} setTableRows ag gridrows state update function
 * @param {Function} setMoney money update state function
 */
const buildBudgetRows = (
  tableData: [string, BomMaterial][],
  setTableRows: Function,
  setMoney: Function,
) => {
  // Acquired and total budget, use this inseide map function
  const money = { acquired: 0, total: 0 };
  // Build rows Array for table
  const rows = tableData.map(([materialId, material]) => {
    money.total += parseFloat(material.totalValue.replaceAll(",", "").replace(" €", ""));
    if (material.status === "Acquired") {
      money.acquired += parseFloat(material.totalValue.replaceAll(",", "").replace(" €", ""));
    }
    return {
      ...material,
      date: material.date.replaceAll("-", "/"),
      id: materialId,
    };
  }, money);
  let percentage = "0";
  if (money.total !== 0) percentage = Number(money.acquired / money.total).toFixed(2);
  setMoney({
    acquired: money.acquired,
    total: money.total,
    percentage: percentage,
  });
  setTableRows(rows);
};

/** Opens the material model with clean information
 * @param  {Function} setIsModalOpen modal tate update function
 * @param  {Function} setMaterialInfo material info update function
 */
const closeMaterialModal = (
  setIsModalOpen: Function,
  setMaterialInfo: Function,
  setMaterialInfoMask: Function,
  commentListener: string,
  setCommentListener: Function,
) => {
  setIsModalOpen(false);
  setMaterialInfo(defaultMaterial);
  setMaterialInfoMask(defaultMaterial);
  // remove material listener off comments
  if (commentListener) off(ref(db, commentListener));
  setCommentListener("");
};
/** Opens the material model with clean information
 * @param  {Function} setIsModalOpen modal tate update function
 * @param  {Function} setMaterialInfo material info update function
 */
const openCleanMaterialModal = (
  setIsModalOpen: Function,
  setMaterialInfo: Function,
  setShowDeleteButton: Function,
) => {
  setIsModalOpen(true);
  setShowDeleteButton(false);
  setMaterialInfo(defaultMaterial);
};
/** Gets the clicked flow data, and opens the modal with the corresponding data
 * @param  {RowClickedEvent} event ag grid parameters
 * @param  {Function} setFlowInfo flow info state function
 * @param  {Function} setModalOpen modal open state function
 * @param  {Function} setShowDeleteButton modal delete button state function
 */
const onRowBomClick = (
  event: RowClickedEvent | RedirectedData,
  setMaterialInfo: Function,
  setMaterialInfoMask: Function,
  setModalOpen: Function,
  setShowDeleteButton: Function,
  setCommentListener: Function,
) => {
  const materialData: BomMaterial = event.data;

  // Get the season from the data, dynamic parameters here don't work
  const season = materialData.season;

  // Add listener for the comments
  setCommentListener(`bom/${season}/${materialData.id}`);
  onValue(ref(db, `private/bom/${season}/${materialData.id}`), (snapshot) => {
    const materialDataDb = snapshot.val();

    if (!materialDataDb) return;
    setMaterialInfo({ ...materialDataDb, id: materialData.id });
    setMaterialInfoMask({ ...materialDataDb, id: materialData.id });
  });
  setModalOpen(true);
  setShowDeleteButton(true);
};
/** Creates a filename for the table
 * @param  {string} department title of the table
 */
const exportedFilename = (department: string) => {
  const base = `TSB_Budget_${department}`;
  const year = new Date().getFullYear();
  return base + year;
};

/** Exports the table to an excel file
 * @param  {GridApi} gridApi ag-grid grid Api
 * @param  {ColumnApi} columnApi ag-grid column Api
 * @param  {string} tableTitle title of the table
 */
const excelExport = (gridApi: GridApi | null, department: string) => {
  if (!gridApi) return;
  gridApi.exportDataAsExcel({
    fileName: `${exportedFilename(department)}.xlsx`,
  });
};

/** Exports the table to the clipboard
 * @param  {GridApi} gridApi ag-grid grid Api
 */
const clipboardExport = (gridApi: GridApi | null) => {
  if (!gridApi) return;
  gridApi.selectAll();
  gridApi.copySelectedRowsToClipboard(true);
  gridApi.deselectAll();
};

/** Exports the table to a pdf file
 * @param  {string} department title of the table
 * @param  {GridApi} gridApi ag-grid grid Api
 * @param  {ColumnApi} columnApi ag-grid column Api
 */
const pdfExport = (department: string, gridApi: GridApi | null, columnApi: ColumnApi | null) => {
  printDoc(gridApi, columnApi, exportedFilename(department));
};

/** Filters the table to show rows based on input text
 * @param  {event} e on change event of the input text
 * @param  {GridApi} gridApi ag grid grid Api of the table
 */
const filterTable = (e: React.ChangeEvent<HTMLInputElement>, gridApi: GridApi | null) => {
  if (!gridApi) return;
  gridApi.setQuickFilter(e.target.value);
};

/** Resizes the table to fit the data, and saves the grid api states
 * @param  {GridReadyEvent} params ag grid parameters
 * @param  {Function} setGridApi
 * @param  {Function} setColumnApi
 */
const onFirstDataRendered = (
  params: GridReadyEvent,
  setGridApi: Function,
  setColumnApi: Function,
) => {
  if (!params.api) return;

  params.api.sizeColumnsToFit();
  setGridApi(params.api);
  setColumnApi(params.columnApi);
};

/**
 * Functions for Budget modal
 */

/** Deletes the currently opened material
 * @param  {BomMaterial} materialInfo material info that gets updated
 * @param  {BomMaterial} materialInfoMask material info that remains the same
 * @param  {Function} closeModal close modal state update function
 * @param  {string} season current season
 */
const deleteMaterial = (
  materialInfo: BomMaterial,
  materialInfoMask: BomMaterial,
  closeModal: Function,
  season: string,
) => {
  const materialId = materialInfo.id;
  if (!materialId) {
    return;
  }
  // Update material
  remove(ref(db, `private/bom/${season}/${materialId}`));

  if (materialInfoMask.assignedTo) {
    // delete material from user
    const userKey = materialInfo.assignedTo.value;
    remove(ref(db, `private/usersBomMaterials/${userKey}/${materialInfo.id}`));
  }

  closeModal();
};

/** Updates the assigned materials for users, based on creation or update
 * @param  {BomMaterial} materialInfo material info that gets updated
 * @param  {BomMaterial} materialInfoMask material info that remains the same
 * @param  {string} materialId the material ID key of DB
 */
const updateMaterialsForUsers = (
  materialInfo: BomMaterial,
  materialInfoMask: BomMaterial,
  materialId: string,
  user: userContext | null,
) => {
  if (!user) return;
  if (materialInfo.assignedTo) {
    const prevUserKey = materialInfoMask.assignedTo.value;
    // update information on assigned user
    const userKey = materialInfo.assignedTo.value;
    update(ref(db, `private/usersBomMaterials/${userKey}/${materialId}`), materialInfo);

    if (userKey !== user.id && userKey !== prevUserKey) {
      sendNotification(
        userKey,
        user.id,
        materialInfo.description,
        `${user.name} assigned you a material.`,
        `/budget`,
        null,
        "material",
        "info",
      );

      // delete from previously assigned user
      if (materialInfoMask.assignedTo && materialInfoMask.assignedTo !== materialInfo.assignedTo) {
        remove(ref(db, `private/usersBomMaterials/${prevUserKey}/${materialInfoMask.id}`));
      }
    }
  }
};

/** Validates the information of the materialInfo
 * @param  {BomMaterial} materialInfo material info that gets updated
 * @returns {BomMaterial} materialInfo material info that gets updated
 */
const validateInputs = (materialData: BomMaterial) => {
  if (!materialData.unitaryValue) {
    materialData.unitaryValue = "0.00 €";
  }
  if (!materialData.totalValue) {
    materialData.totalValue = "0.00 €";
  }
  return materialData;
};

/** Saves the material in the database
 * @param  {BomMaterial} materialInfo material info that gets updated
 * @param  {BomMaterial} materialInfoMask material info that remains the same
 * @param  {Function} closeModal modal update state function
 * @param  {string} season current season
 */
const saveMaterial = (
  materialInfo: BomMaterial,
  materialInfoMask: BomMaterial,
  user: userContext | null,
  closeModal: Function,
  season: string,
) => {
  if (!user) return;
  const materialId = materialInfoMask.id;
  let assignedBy = "";
  if (!materialInfo.assignedBy) assignedBy = user.id;
  else assignedBy = materialInfo.assignedBy;
  let materialData = {
    ...materialInfo,
    season: season,
    assignedBy: assignedBy,
  }; // update the season, from the default data
  materialData = validateInputs(materialData);
  if (!materialId) {
    // Create new material
    push(child(ref(db, "private/bom/"), season), materialData).then((snapshot) => {
      // retrieve newly created Key of the DB
      const materialKey = snapshot.key;
      if (materialKey) updateMaterialsForUsers(materialData, materialInfoMask, materialKey, user);
    });
  } else {
    // Update material
    set(ref(db, `private/bom/${season}/${materialId}`), materialData);
    updateMaterialsForUsers(materialData, materialInfoMask, materialId, user);
  }

  closeModal();
};

/** Submits a comment and updates the number of comments in the material and
users as well
 * @param  {string} commentText comment text
 * @param  {userContext} user current user who is commenting
 * @param  {string} season current season
 * @param  {BomMaterial} materialInfo material info that remains the same
 * @param  {Function} setCommentText comment input text state update function
 */
const submitComment = (
  commentText: string,
  user: userContext | null,
  season: string,
  materialInfo: BomMaterial,
  setCommentText: Function,
) => {
  if (!user || !materialInfo.id) {
    return;
  }
  const comment = {
    comment: commentText,
    timestamp: new Date().getTime(),
    createdBy: user.id,
    createdByName: user.name,
  };
  // Push the comment to DB
  const commentRef = `private/bom/${season}/${materialInfo.id}/comments`;
  push(ref(db, commentRef), comment);
  const numCommentRef = `private/bom/${season}/${materialInfo.id}/numComments`;
  // Increment comment count on task db, and in state
  runTransaction(ref(db, numCommentRef), (num) => {
    return (num || 0) + 1;
  });
  // Update number of comments on assigned users db (this is cheating because we
  // are not updating the comments themselves, no need)
  if (materialInfo.assignedTo) {
    const userKey = materialInfo.assignedTo.value;
    const userCommentRef = `usersBomMaterials/${userKey}/${materialInfo.id}`;
    // increment count users
    runTransaction(child(ref(db, userCommentRef), "numComments"), (num) => {
      return (num || 0) + 1;
    });
    if (userKey !== user.id) {
      sendNotification(
        userKey,
        user.id,
        materialInfo.description,
        `${user.name} commented on this material.`,
        `/budget`,
        null,
        "material",
        "info",
      );
    }
  }
  // Send notification

  // Reset comment
  setCommentText("");
};

/** Updates material info (keys) of text inputs
 * @param  {event} e input event
 * @param  {string} key current user who is commenting
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 * @param  {Function} setCommentText comment input text state update function
 */
const inputBudgetModalHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  key: string,
  materialInfo: BomMaterial,
  setMaterialInfo: Function,
) => {
  const value = e.target.value;
  setMaterialInfo({ ...materialInfo, [key]: value });
};

/** Handler for the Select Assign To options, updates material info
 * @param  {any} selected input event
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 */
const assignToHandler = (selected: any, materialInfo: BomMaterial, setMaterialInfo: Function) => {
  setMaterialInfo({ ...materialInfo, assignedTo: selected });
};

/** Handler for the Select Status options, updates material info
 * @param  {any} selected input event
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 */
const statusHandler = (selected: any, materialInfo: BomMaterial, setMaterialInfo: Function) => {
  setMaterialInfo({ ...materialInfo, status: selected.value });
};

/** Handler for the Select Department options, updates material info
 * @param  {any} selected input event
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 */
const forDepartmentHandler = (
  selected: any,
  materialInfo: BomMaterial,
  setMaterialInfo: Function,
) => {
  setMaterialInfo({ ...materialInfo, toDepartment: selected.value });
};

/** Handler for quantity counter, updates material info
 * @param  {number} value input event
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 */
const counterHandler = (value: number, setMaterialInfo: Function, materialInfo: BomMaterial) => {
  if (value < 0) {
    return false;
  }
  // multiply unitary value by quantity, to update total value
  const quantity = value;
  const floatUnitary = parseFloat(materialInfo.unitaryValue.replaceAll(",", "").replace(" €", ""));
  const total = quantity ? floatUnitary * quantity : 0;
  const totalString = numberWithCommas(total);
  setMaterialInfo({
    ...materialInfo,
    quantity: value,
    totalValue: totalString,
  });
  // setMaterialInfo({ ...materialInfo, quantity: value });
};

/** Handler for unitary and total value, updates material info
 * @param  {NumberFormatValues} value input event
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 * @param {string} key unitaryValue | totalValue
 */
const valueHandler = (
  value: NumberFormatValues,
  materialInfo: BomMaterial | null,
  setMaterialInfo: Function,
  key: string,
) => {
  const floatValue = parseFloat(value.formattedValue.replaceAll(",", "").replace(" €", ""));
  const quantity = materialInfo!.quantity ? materialInfo!.quantity : 0;
  if (key === "totalValue") {
    // divide total value by quantity, to update unitary value
    const unitary = quantity ? floatValue / quantity : 0;
    const unitaryString = numberWithCommas(unitary);
    setMaterialInfo({
      ...materialInfo,
      [key]: value.formattedValue,
      unitaryValue: unitaryString,
    });
  } else if (key === "unitaryValue") {
    // multiply unitary value by quantity, to update total value
    const total = quantity ? floatValue * quantity : 0;
    const totalString = numberWithCommas(total);
    setMaterialInfo({
      ...materialInfo,
      [key]: value.formattedValue,
      totalValue: totalString,
    });
  }
};

/** Handler for the datepicker, updates material info
 * @param  {Date} date input event
 * @param  {BomMaterial} materialInfo material info that get updated
 * @param  {Function} setMaterialInfo material info update state function
 */
const dateHandler = (date: Date, materialInfo: BomMaterial | null, setMaterialInfo: Function) => {
  // saves the date as a portuguese format string
  const dateString = dateToString(date);
  setMaterialInfo({ ...materialInfo, date: dateString });
};

/** Handler for the comment input, updates commentText
 * @param  {event} e input event
 * @param  {Function} setCommentText material info update state function
 */
const commentTextHandler = (e: React.ChangeEvent<HTMLInputElement>, setCommentText: Function) => {
  setCommentText(e.target.value);
};

const sortMaterialsByDate = (materials: [string, BomMaterial][]) => {
  materials.sort((a, b) => {
    const matA = a[1];
    const matB = b[1];
    const dateA = inputToDate(matA.date);
    const dateB = inputToDate(matB.date);
    if (dateA < dateB) return 1;
    if (dateA > dateB) return -1;
    return 0;
  });
  return materials;
};

/**
 * Buils the bom datara object based on the departments in the database
 * @param departmentsWDesc
 * @returns
 */
const getEmptyTableDataObject = (departmentsWDesc: DepartmentsWithDesc) => {
  const dataArray: BomTableData = {};
  Object.entries(departmentsWDesc).forEach(([description, department]) => {
    dataArray[description] = [];
  });
  dataArray.All = [];
  return dataArray;
};
const getSeasonBudgetData = (
  departmentsWDesc: DepartmentsWithDesc,
  season: string | null,
  openMatId: string | null,
  openSeasonId: string,
  openedFromRedirect: boolean,
  setSeasonsOptions: Function,
  setSeason: Function,
  setTableData: Function,
  setLoadingData: Function,
  setOpenedFromRedirect: Function,
  setMaterialInfo: Function,
  setMaterialInfoMask: Function,
  setModalOpen: Function,
  setShowDeleteButton: Function,
  setCommentListener: Function,
) => {
  if (openSeasonId && openedFromRedirect && !season) {
    setSeason(openSeasonId); // e.g 2020-2021
    // This will trigger the useEffect again, with the new season
    return;
  }
  onValue(ref(db, "private/bom/seasons"), (snapshot) => {
    const seasonsFromDb: string[] = snapshot.val();
    if (!seasonsFromDb) return;
    const selectSeasons = seasonsFromDb.map((season) => ({
      value: season,
      label: season,
    }));
    setSeasonsOptions(selectSeasons);
    if (!season) {
      setSeason(seasonsFromDb[0].replace("/", "-"));
      return;
    }
    onValue(ref(db, `private/bom/${season}`), (snapshot) => {
      const bomDataHolder = getEmptyTableDataObject(departmentsWDesc);
      const budgetSeasonData: BomDb = snapshot.val();
      if (budgetSeasonData) {
        Object.entries(budgetSeasonData).forEach(([materialId, material]) => {
          // append material to respective department, and to all
          try {
            bomDataHolder[material.toDepartment].push([materialId, material]);
          } catch (error) {
            bomDataHolder[material.toDepartment] = [[materialId, material]];
          }

          bomDataHolder.All.push([materialId, material]);
          if (openMatId === materialId && openedFromRedirect) {
            onRowBomClick(
              { data: { ...material, id: materialId } }, // add id
              setMaterialInfo,
              setMaterialInfoMask,
              setModalOpen,
              setShowDeleteButton,
              setCommentListener,
            );
          }
        });
        // sort by date all arrays
        Object.entries(bomDataHolder).forEach(([department, materials]) => {
          const sortedMaterials = sortMaterialsByDate(materials);
          bomDataHolder[department] = sortedMaterials;
        });
      }
      // open budget modal if from redirect

      setTableData(bomDataHolder);
      setLoadingData(false);
      if (openedFromRedirect) setOpenedFromRedirect(false);
    });
  });
};

const todaysDate = dateToString(new Date());

const defaultMaterial: BomMaterial = {
  assignedBy: "",
  assignedTo: { value: "", label: "" },
  assignedToName: "",
  date: todaysDate,
  quantity: 1,
  description: "",
  from: "",
  status: "Required",
  toDepartment: "Electrical Systems",
  totalValue: "",
  unitaryValue: "",
  numComments: 0,
  season: "2020-2021",
};
const bomDefaultData: BomTableData = {
  "Electrical Systems": [],
  "Mechanical Systems": [],
  "Design and Composites": [],
  Hydrogen: [],
  "Management and Marketing": [],
  All: [],
};

const statusSelectOptions = [
  { value: "Required", label: "Required" },
  { value: "In Progress", label: "In Progress" },
  { value: "Acquired", label: "Acquired" },
  { value: "Sponsor", label: "Sponsor" },
  { value: "To Buy", label: "To Buy" },
];

interface depSelectOptions {
  value:
    | "Electrical Systems"
    | "Mechanical Systems"
    | "Design and Composites"
    | "Hydrogen"
    | "Management and Marketing";
  label:
    | "Electrical Systems"
    | "Mechanical Systems"
    | "Design and Composites"
    | "Hydrogen"
    | "Management and Marketing";
}
const departmentSelectOptions: depSelectOptions[] = [
  { value: "Electrical Systems", label: "Electrical Systems" },
  { value: "Mechanical Systems", label: "Mechanical Systems" },
  { value: "Design and Composites", label: "Design and Composites" },
  { value: "Hydrogen", label: "Hydrogen" },
  { value: "Management and Marketing", label: "Management and Marketing" },
];

/**
 * Build the department options based on the departments from thedatabase
 * @param departments
 * @returns
 */
const getBudgetDepartmentOptions = (departments: Departments) => {
  const depOptions = Object.entries(departments).map(([acronym, department]) => ({
    value: department.description,
    label: department.description,
  }));
  return depOptions;
};

const bomDepartmentTitleIconColor: bomDepartmentIconColorTitle = {
  "Electrical Systems": {
    title: "Electrical Systems",
    icon: "fa fa-lightbulb",
    color: "bg-sunny-morning",
  },
  "Mechanical Systems": {
    title: "Mechanical Systems",
    icon: "fa fa-cogs",
    color: "bg-happy-itmeo",
  },
  "Design and Composites": {
    title: "Design and Composites",
    icon: "fa fa-anchor",
    color: "bg-happy-fisher",
  },
  "Management and Marketing": {
    title: "Management and Marketing",
    icon: "fa fa-chart-line",
    color: "bg-tempting-azure",
  },
  Hydrogen: {
    title: "Hydrogen",
    icon: "fa fa-atom",
    color: "bg-mixed-hopes",
  },
  All: {
    title: "All",
    icon: "fa fa-globe-europe",
    color: "bg-night-fade",
  },
};

export {
  closeMaterialModal,
  openCleanMaterialModal,
  onRowBomClick,
  exportedFilename,
  excelExport,
  clipboardExport,
  pdfExport,
  filterTable,
  bomDefaultData,
  defaultMaterial,
  onFirstDataRendered,
  statusSelectOptions,
  departmentSelectOptions,
  submitComment,
  inputBudgetModalHandler,
  assignToHandler,
  dateHandler,
  commentTextHandler,
  valueHandler,
  counterHandler,
  forDepartmentHandler,
  statusHandler,
  deleteMaterial,
  saveMaterial,
  buildBudgetRows,
  swalBomDeleteMessage,
  deleteSeason,
  sortSeasonsArray,
  bomDepartmentTitleIconColor,
  getSeasonBudgetData,
  getBudgetDepartmentOptions,
};
