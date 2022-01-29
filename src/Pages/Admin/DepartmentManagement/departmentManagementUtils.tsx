import { child, get, ref, remove, set, update } from "firebase/database";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../../config/firebase";
import {
  AllEvents,
  AllUserTasks,
  AssignedUserMaterials,
  Department,
  DepartmentModalText,
  Departments,
  EntireBom,
  PublicTeam,
  UserMetadata,
} from "../../../interfaces";

const taskPageObject = {
  b: {
    General: {
      "0Todo": {
        classNames: "kanban-board-header card text-center bg-danger text-white",
        name: "To do",
      },
      "1InProgress": {
        classNames:
          "kanban-board-header card text-center bg-warning text-white",
        name: "In Progress",
      },
      "2Completed": {
        classNames:
          "kanban-board-header card text-center bg-success text-white",
        name: "Completed",
      },
    },
  },
  list: ["General"],
};
const gradientColorOptions = [
  { value: "bg-warm-flame", label: "bg-warm-flame" },
  { value: "bg-night-fade", label: "bg-night-fade" },
  { value: "bg-sunny-morning", label: "bg-sunny-morning" },

  { value: "bg-tempting-azure", label: "bg-tempting-azure" },
  { value: "bg-amy-crisp", label: "bg-amy-crisp" },
  { value: "bg-heavy-rain", label: "bg-heavy-rain" },
  { value: "bg-mean-fruit", label: "bg-mean-fruit" },
  { value: "bg-malibu-beach", label: "bg-malibu-beach" },
  { value: "bg-deep-blue", label: "bg-deep-blue" },
  { value: "bg-ripe-malin", label: "bg-ripe-malin" },
  { value: "bg-arielle-smile", label: "bg-arielle-smile" },
  { value: "bg-plum-plate", label: "bg-plum-plate" },
  { value: "bg-happy-fisher", label: "bg-happy-fisher" },
  { value: "bg-happy-itmeo", label: "bg-happy-itmeo" },
  { value: "bg-mixed-hopes", label: "bg-mixed-hopes" },
  { value: "bg-strong-bliss", label: "bg-strong-bliss" },
  { value: "bg-grow-early", label: "bg-grow-early" },
  { value: "bg-love-kiss", label: "bg-love-kiss" },
  { value: "bg-premium-dark", label: "bg-premium-dark" },
  { value: "bg-happy-green", label: "bg-happy-green" },
  { value: "bg-vicious-stance", label: "bg-vicious-stance" },
  { value: "bg-nice-blue", label: "bg-nice-blue" },
  { value: "bg-nice-purple", label: "bg-nice-purple" },
  { value: "bg-midnight-bloom", label: "bg-midnight-bloom" },
  { value: "bg-night-sky", label: "bg-night-sky" },
  { value: "bg-slick-carbon", label: "bg-slick-carbon" },
  { value: "bg-royal", label: "bg-royal" },
  { value: "bg-asteroid", label: "bg-asteroid" },
];

const departmentTemplate: Department = {
  acronym: "aa",
  icon: "fa-cogs",
  gradientColor: "bg-asteroid",
  positions: [],
  description: "A new Department",
  color: "#000000",
};

const adminPositions = [
  "Team Leader",
  "Head of Department",
  "Technical Director",
];
/**
 * Handles any input text for the department
 * @param e
 * @param key
 * @param setDepartmentInfo
 */
const departmentInputHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  key: string,
  setDepartmentInfo: Function
) => {
  // dont allow any funky characters
  let newVal = e.target.value;
  if (key !== "icon") newVal = newVal.replace(/[^A-Za-z ]/gi, "");
  setDepartmentInfo((departmentInfo: Department) => ({
    ...departmentInfo,
    [key]: newVal,
  }));
};

/**
 * Handles the gradient color select input of the department
 * @param option
 * @param setDepartmentInfo
 */
const handleDepartmentSelect = (option: any, setDepartmentInfo: Function) => {
  setDepartmentInfo((departmentInfo: Department) => ({
    ...departmentInfo,
    gradientColor: option.value,
  }));
};

/**
 * Closes the department modal
 * @param setIsDepartmentModalOpen
 */
const closeDepartmentModal = (
  setIsDepartmentModalOpen: Function,
  setNewPosition: Function
) => {
  setIsDepartmentModalOpen(false);
  setNewPosition("");
};

/**
 * Removes a position from the department
 * @param departmentInfo
 * @param positionToRemove
 * @returns
 */
const removePosition = (
  departmentInfo: Department,
  positionToRemove: string,
  setDepartmentInfo: Function
) => {
  let currPositions = [...departmentInfo.positions];
  const index = currPositions.indexOf(positionToRemove);
  if (index > -1) {
    currPositions.splice(index, 1);
  }
  setDepartmentInfo({ ...departmentInfo, positions: currPositions });
};

/**
 * Adds a new position to the department
 * @param newPosition
 * @param departmentInfo
 * @param setNewPosition
 * @param setDepartmentInfo
 * @returns
 */
const addPosition = (
  newPosition: string,
  departmentInfo: Department,
  setNewPosition: Function,
  setDepartmentInfo: Function
) => {
  let currPositions = [...departmentInfo.positions];
  if (adminPositions.includes(newPosition) || !newPosition) return;
  currPositions.push(newPosition);
  setDepartmentInfo({ ...departmentInfo, positions: currPositions });
  setNewPosition("");
};

/**
 * Adds a new task board of the newly created department
 * @param departmentInfo
 */
const createTaskPage = (departmentInfo: Department) => {
  set(
    ref(db, `private/tasks${departmentInfo.acronym.toUpperCase()}`),
    taskPageObject
  );
};

/**
 * Removes all assigned materials that correspond to the department to be deleted
 * @param departmentDescription
 */
const deleteAssignedUserMaterials = (departmentDescription: string) => {
  get(ref(db, "private/usersBomMaterials")).then((snapshot) => {
    let assignedUsers: AssignedUserMaterials = snapshot.val();
    if (!assignedUsers) return;
    Object.entries(assignedUsers).forEach(([userId, materials]) => {
      Object.entries(materials).forEach(([materialId, material]) => {
        if (material.toDepartment === departmentDescription) {
          delete assignedUsers[userId][materialId];
        }
      });
    });
    update(ref(db, "private/usersBomMaterials"), assignedUsers);
  });
};

/**
 * Deletes all budget metadata based on the department to remove
 * @param departmentDescription
 */
const deleteBudgetMetadata = (departmentDescription: string) => {
  get(ref(db, "private/bom")).then((snapshot) => {
    let bomDb: EntireBom = snapshot.val();
    if (!bomDb) return;
    // loop all seasons
    Object.entries(bomDb).forEach(([season, seasonData]) => {
      // dont go through the seasons list
      if (season !== "seasons") {
        Object.entries(seasonData).forEach(([materialId, material]) => {
          // Change department to the new one
          if (material.toDepartment === departmentDescription) {
            delete bomDb[season][materialId];
          }
        });
      }
      update(ref(db, "private/bom"), bomDb);
    });
  });
};

/**
 * Deletes all events from the specified department
 * @param departmentDescription
 */
const deleteAllEventsMetadata = (departmentDescription: string) => {
  get(ref(db, "private/events")).then((snapshot) => {
    const allEvents: AllEvents = snapshot.val();

    if (!allEvents) return;
    Object.entries(allEvents).forEach(([time, eventDb]) => {
      Object.entries(eventDb).forEach(([eventId, event]) => {
        let eventDepartment = event.type.replace(" Meeting", "");
        if (eventDepartment === departmentDescription) {
          delete allEvents[time][eventId];
        }
      });
    });
    update(ref(db, "private/events"), allEvents);
  });
};

/**
 * Removes all assigned materials that correspond to the department to be deleted
 * @param departmentDescription
 */
const deleteAssignedUserTasks = (departmentAcronym: string) => {
  get(ref(db, "private/usersTasks")).then((snapshot) => {
    let allUsersTasks: AllUserTasks = snapshot.val();
    if (!allUsersTasks) return;
    Object.entries(allUsersTasks).forEach(([userId, tasks]) => {
      Object.entries(tasks).forEach(([taskId, task]) => {
        if (
          task.departmentBoard.replace("tasks", "") ===
          departmentAcronym.toUpperCase()
        ) {
          delete allUsersTasks[userId][taskId];
        }
      });
    });
    update(ref(db, "private/usersTasks"), allUsersTasks);
  });
};

/**
 * Removes all related department data from the database
 * @param departmentInfo
 */
const removeAllDepartmentRelatedMetadata = (departmentInfo: Department) => {
  // Delete all user tasks of this department
  deleteAssignedUserTasks(departmentInfo.acronym);
  // Delete all materials
  deleteAssignedUserMaterials(departmentInfo.description);
  // Delete all materials in budget
  deleteBudgetMetadata(departmentInfo.description);
  // Delete all events
  deleteAllEventsMetadata(departmentInfo.description);
};

/**
 * Replaces all users which had the old department name, to the new one
 * @param previousDescription
 * @param currDescription
 */
const changeUserMetadata = (
  previousDescription: string,
  currDescription: string
) => {
  get(ref(db, "private/usersMetadata")).then((snapshot) => {
    let usersMetadata: UserMetadata = snapshot.val();
    if (!usersMetadata) return;
    Object.entries(usersMetadata).forEach(([userId, userInfo]) => {
      if (userInfo.pinfo.department === previousDescription) {
        // change to the new department
        usersMetadata[userId].pinfo.department = currDescription;
      }
    });
    update(ref(db, "private/usersMetadata"), usersMetadata);
  });
};

/**
 * Replaces all users which had the old department name, to the new one in public DB
 * @param previousDescription
 * @param currDescription
 */
const changePublicUserMetadata = (
  previousDescription: string,
  currDescription: string
) => {
  get(ref(db, "public/officialWebsite/team")).then((snapshot) => {
    let usersMetadata: PublicTeam = snapshot.val();
    if (!usersMetadata) return;
    Object.entries(usersMetadata).forEach(([userId, userInfo]) => {
      if (userInfo.info.department === previousDescription) {
        // change to the new department
        usersMetadata[userId].info.department = currDescription;
      }
    });
    update(ref(db, "public/officialWebsite/team"), usersMetadata);
  });
};

/**
 * Changes the old department in all materials of the Budget
 * @param previousDescription
 * @param currDescription
 */
const changeBudgetMetadata = (
  previousDescription: string,
  currDescription: string
) => {
  get(ref(db, "private/bom")).then((snapshot) => {
    let bomDb: EntireBom = snapshot.val();
    if (!bomDb) return;
    // loop all seasons
    Object.entries(bomDb).forEach(([season, seasonData]) => {
      // dont go through the seasons list
      if (season !== "seasons") {
        Object.entries(seasonData).forEach(([materialId, material]) => {
          // Change department to the new one
          if (material.toDepartment === previousDescription) {
            bomDb[season][materialId].toDepartment = currDescription;
          }
        });
      }
      update(ref(db, "private/bom"), bomDb);
    });
  });
};

/**
 * Changes the old department value in the assinged materials
 * @param previousDescription
 * @param currDescription
 */
const changeAssignedUserMaterials = (
  previousDescription: string,
  currDescription: string
) => {
  get(ref(db, "private/usersBomMaterials")).then((snapshot) => {
    let assignedUsers: AssignedUserMaterials = snapshot.val();
    if (!assignedUsers) return;
    Object.entries(assignedUsers).forEach(([userId, materials]) => {
      Object.entries(materials).forEach(([materialId, material]) => {
        if (material.toDepartment === previousDescription) {
          assignedUsers[userId][materialId].toDepartment = currDescription;
        }
      });
    });
    update(ref(db, "private/usersBomMaterials"), assignedUsers);
  });
};

/**
 * Changes all ecents in the database with the new department name
 * @param previousDescription
 * @param currDescription
 */
const changeAllEventsMetadata = (
  previousDescription: string,
  currDescription: string
) => {
  get(ref(db, "private/events")).then((snapshot) => {
    const allEvents: AllEvents = snapshot.val();

    if (!allEvents) return;
    Object.entries(allEvents).forEach(([time, eventDb]) => {
      Object.entries(eventDb).forEach(([eventId, event]) => {
        let eventDepartment = event.type.replace(" Meeting", "");
        if (eventDepartment === previousDescription) {
          allEvents[time][eventId].type = currDescription + " Meeting";
        }
      });
    });
    update(ref(db, "private/events"), allEvents);
  });
};

/**
 * Changes all department related metadata in the database
 * @param previousDescription
 * @param currDescription
 */
const changeAllDepartmentRelatedMetadata = (
  previousDescription: string,
  currDescription: string
) => {
  changeUserMetadata(previousDescription, currDescription);
  changePublicUserMetadata(previousDescription, currDescription);
  changeBudgetMetadata(previousDescription, currDescription);
  changeAssignedUserMaterials(previousDescription, currDescription);
  changeAllEventsMetadata(previousDescription, currDescription);
};
/**
 * Saves the edit department information in the database, based on the acronym
 * @param departmentInfo
 * @param setIsDepartmentModalOpen
 * @param setNewPosition
 */
const saveDepartment = (
  departmentInfo: Department,
  departments: Departments,
  modalText: DepartmentModalText,
  setIsDepartmentModalOpen: Function,
  setNewPosition: Function
) => {
  let acronym = departmentInfo.acronym;
  if (modalText.creatingNewDepartment) {
    // check if the acronym is equal to existing ones
    if (departments[acronym]) {
      return;
    }
    // Create a task page in the database
    createTaskPage(departmentInfo);
  } else {
    // Update all metadata in the database that relates to the changed
    // department description
    let previousDescription = departments[acronym].description;
    let currDescription = departmentInfo.description;
    if (previousDescription !== currDescription) {
      changeAllDepartmentRelatedMetadata(previousDescription, currDescription);
    }
  }
  update(child(ref(db, "private/departments"), acronym), departmentInfo);
  updateRecruitmentDepartments(acronym, departmentInfo);
  closeDepartmentModal(setIsDepartmentModalOpen, setNewPosition);
};

/**
 * Updates the information of the department in the recruitment database
 * @param acronym
 * @param departmentInfo
 */
const updateRecruitmentDepartments = (
  acronym: string,
  departmentInfo: Department
) => {
  get(child(ref(db, "public/recruitment/openDepartments"), acronym)).then(
    (snapshot) => {
      let recruitmentDepartment = snapshot.val();
      if (!recruitmentDepartment) return;
      else
        set(
          child(ref(db, "public/recruitment/openDepartments"), acronym),
          departmentInfo
        );
    }
  );
};

/**
 * Opens the modal with a department template to create
 * @param setDepartmentInfo
 * @param setIsDepartmentModalOpen
 * @param setModalText
 */
const openModalToCreateDepartment = (
  setDepartmentInfo: Function,
  setIsDepartmentModalOpen: Function,
  setModalText: Function
) => {
  setDepartmentInfo({ ...departmentTemplate });
  setIsDepartmentModalOpen(true);
  setModalText({
    title: "Create a new Department",
    saveButton: "Create",
    creatingNewDepartment: true,
  });
};

/**
 * Opens the modal to edit the selected department
 * @param department
 * @param setIsDepartmentModalOpen
 * @param setDepartmentInfo
 * @param setModalText
 */
const editDepartment = (
  department: Department,
  setIsDepartmentModalOpen: Function,
  setDepartmentInfo: Function,
  setModalText: Function
) => {
  setModalText({
    saveButton: "Save",
    title: "Edit Department",
    creatingNewDepartment: false,
  });
  setIsDepartmentModalOpen(true);
  setDepartmentInfo(department);
};

/** Show a confirmation message to delete the topic
 * @param  {Function} deleteFunction function to delete the board
 */
const swalDeleteDepartmentMessage = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this department, this operation is not reversible.</p>
      <h5>The following operation will be performed:</h5>
      <ul class="text-align-left">
        <li>All users with this department will remain unchanged</li>
        <li>All tasks will be deleted</li>
        <li>All events will be deleted</li>
        <li>All budget materials will be deleted</li>
        <li>All assigned tasks and materials of users will be deleted</li>
      </ul>
      <p><h4>Are you sure to proceed?</h4></p>`,

      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
      },
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      } else if (result.isDenied) {
        deleteFunction();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

/**
 * Deletes the department from the database
 * @param departmentInfo
 */
const deleteDepartment = (departmentInfo: Department) => {
  let acronym = departmentInfo.acronym;
  remove(child(ref(db, "private/departments"), acronym));
  remove(child(ref(db, "public/recruitment/openDepartments"), acronym));
  removeAllDepartmentRelatedMetadata(departmentInfo);
};
export {
  gradientColorOptions,
  departmentTemplate,
  saveDepartment,
  addPosition,
  removePosition,
  handleDepartmentSelect,
  departmentInputHandler,
  closeDepartmentModal,
  openModalToCreateDepartment,
  editDepartment,
  swalDeleteDepartmentMessage,
  deleteDepartment,
};
