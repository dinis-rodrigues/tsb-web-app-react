// Swal Notifications
import { DropResult } from "react-beautiful-dnd";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import {
  columnsShape,
  Departments,
  EventInformation,
  selectOption,
  taskShape,
  userContext,
} from "../../interfaces";
import {
  dateToString,
  getDecodedString,
  getEncodedString,
  sendNotification,
  toastrMessage,
} from "../../utils/generalFunctions";
import { departmentFilter, departmentFilterList } from "../Events/eventsUtils";
import { v4 as uuid } from "uuid";
import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from "firebase/database";

/** SHow a confirmation message to delete the task board
 * @param  {Function} deleteBoard function to delete the board
 */
const swalDeleteMessage = (deleteBoard: Function) => {
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
      denyButtonText: "Yes, delete everything!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this board, and all its tasks.</p> <p><h4>Are you sure?</h4></p>`,
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      } else if (result.isDenied) {
        deleteBoard();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

/** Assigns task to selected users, by setting the current task in the
designated db
 * @param  {taskShape} taskInfo task information
 * @param  {taskShape} modalTask modal task information
 * @param  {userContext} user authenticated user
 */
const addTaskToUsers = (
  taskInfo: taskShape,
  modalTask: taskShape,
  departmentBoard: string,
  currBoard: string,
  user: userContext
) => {
  let usersToRemove: selectOption[] = [];
  let usersToAdd: selectOption[] = [];
  let usersToUpdate: selectOption[] = [];
  let assignedUsers: selectOption[] = [];
  let currAssignedUsers: selectOption[] = [];
  if (modalTask.assignedTo) assignedUsers = modalTask.assignedTo;
  if (taskInfo.assignedTo) currAssignedUsers = taskInfo.assignedTo;

  // check if assigned users is a single user, turn it to a list if needed
  if (assignedUsers && typeof assignedUsers == "string") {
    assignedUsers = [assignedUsers];
  }

  // Build list of users to change
  if (assignedUsers && currAssignedUsers) {
    // users exist in both cases, loop them all
    // elements from assignedUsers that are not in the currAssignedUsers ->
    // difference -> users to Add
    usersToAdd = assignedUsers.filter((x) => !currAssignedUsers.includes(x));
    // elements from currAssignedUsers that are not in the assignedUsers ->
    // difference -> users to remove
    usersToRemove = currAssignedUsers.filter((x) => !assignedUsers.includes(x));
  } else if (currAssignedUsers) {
    // no users were selected (all assigned users removed)
    usersToRemove = currAssignedUsers;
  } else if (assignedUsers) {
    // only new users to add, no previour users existed
    usersToAdd = assignedUsers;
  }
  // Remove task from users
  for (let userOption of usersToRemove) {
    let userKey = userOption.value;
    // remove users
    remove(ref(db, `private/usersTasks/${userKey}/${taskInfo.id}`));
  }

  // Make a copy of the task to add to users
  // modalTask contains the most updated version except for the comments
  let taskToAdd = {
    ...modalTask,
    comments: taskInfo.comments ? taskInfo.comments : {},
    assignedBy: user.id,
    assignedByName: user.name,
  };

  // Add task to new users
  for (let userOption of usersToAdd) {
    let userKey = userOption.value;
    // add users
    set(ref(db, `private/usersTasks/${userKey}/${taskInfo.id}`), taskToAdd);
    if (userKey !== user.id) {
      sendNotification(
        userKey,
        user.id,
        taskToAdd.title,
        "You've been assigned a new task!",
        `/${departmentBoard}/b/${currBoard}`,
        null,
        "task",
        "info"
      );
    }
  }
  // dont update the "assignedBy" user
  let taskToUpdate = {
    ...modalTask,
    comments: taskInfo.comments ? taskInfo.comments : {},
  };
  // Update users who were already there
  usersToUpdate = assignedUsers.filter((x) => currAssignedUsers.includes(x));
  for (let userOption of usersToUpdate) {
    let userKey = userOption.value;
    // add users
    update(
      ref(db, `private/usersTasks/${userKey}/${taskInfo.id}`),
      taskToUpdate
    );
  }
};

/** Deletes a task from the currBoard of the departmentBoard
 * @param  {taskShape} taskInfo task information
 * @param  {columnsShape} columns task columns object
 * @param  {string} departmentBoard department board
 * @param  {string} currBoard board of the department
 * @param  {number} currTaskNum index of the task in the column
 * @param  {string} currTaskColumn columns of the task
 * @param  {Function} drawerOpenHandler drawer modal update state function
 */
const deleteTask = (
  taskInfo: taskShape,
  columns: columnsShape,
  departmentBoard: string,
  currBoard: string,
  currTaskNum: number,
  currTaskColumn: string,
  drawerOpenHandler: Function
) => {
  // remove from the users first
  if (taskInfo.assignedTo) {
    for (let userOption of taskInfo.assignedTo) {
      let userKey = userOption.value;
      // remove users
      remove(ref(db, `private/usersTasks/${userKey}/${taskInfo.id}`));
    }
  }
  // Remove the task of the board db
  // Similar to dragOnEnd
  // Copy the column array into new one
  const updatedColumn = columns[taskInfo.columnId];
  if (!updatedColumn.items) updatedColumn.items = [];
  const updatedItems = [...updatedColumn.items];
  // Remove task from the column (inplace)
  updatedItems.splice(currTaskNum, 1);
  // update database, with the removed column
  update(ref(db, `private/${departmentBoard}/b/${currBoard}`), {
    ...columns,
    [taskInfo.columnId]: { ...updatedColumn, items: updatedItems },
  });

  drawerOpenHandler();
};

/** Counts number of completed objectives in the description
 * @param  {string} description html string of the description
 */
const countCompletedObjectives = (description: string) => {
  let todo = 0;
  let completed = 0;

  let notChecked = description.match(/ul data-checked="false"/g);
  if (notChecked) todo = notChecked.length;
  let checked = description.match(/ul data-checked="true"/g);
  if (checked) completed = checked.length;

  return [completed, todo + completed];
};

/** Deletes a task from the currBoard of the departmentBoard
 * @param  {number} currTaskNum index of the task in the column
 * @param  {string} currTaskColumn columns of the task
 * @param  {taskShape} taskInfo task information
 * @param  {taskShape} modalTask modal task information
 * @param  {string} departmentBoard department board
 * @param  {string} currBoard board of the department
 * @param  {Function} drawerOpenHandler drawer modal update state function
 * @param  {userContext} user authenticated user
 */
const saveTask = (
  currTaskNum: number,
  currTaskColumn: string,
  taskInfo: taskShape,
  modalTask: taskShape,
  departmentBoard: string,
  currBoard: string,
  drawerOpenHandler: Function,
  USER: userContext | null
) => {
  if (!USER) return;
  // Count number of completed tasks, if any
  if (modalTask.description) {
    let [completed, total] = countCompletedObjectives(modalTask.description);
    modalTask = { ...modalTask, totalObj: total, completedObj: completed };
  }

  update(
    ref(
      db,
      `private/${departmentBoard}/b/${currBoard}/${currTaskColumn}/items/${currTaskNum}`
    ),
    modalTask
  );
  drawerOpenHandler();
  addTaskToUsers(taskInfo, modalTask, departmentBoard, currBoard, USER);
};

/** creates an event based on current task
 * @param  {userContext} user authenticated user
 * @param  {taskShape} taskInfo task information
 * @param  {EventInformation} eventInfo default event information
 */
const saveTaskAsEvent = (
  user: userContext | null,
  taskInfo: taskShape,
  eventInfo: EventInformation,
  saveEvent: Function,
  drawerOpenHandler: Function
) => {
  if (!user) return;
  if (!taskInfo.date) {
    toastrMessage("Add date to task.", "error");
    return;
  }
  eventInfo.title = taskInfo.title;
  eventInfo.date = taskInfo.date;
  eventInfo.description = taskInfo.description ? taskInfo.description : "";
  eventInfo.weeks = 0;
  eventInfo.allDay = true;
  let department = taskInfo.departmentBoard.split("tasks")[1];
  if (departmentFilterList.indexOf(department)) {
    eventInfo.type = departmentFilter[department][0];
  }
  saveEvent(
    user,
    "",
    eventInfo,
    () => {},
    () => {},
    () => {}
  );
  drawerOpenHandler();
};

/** Handles the task title input state
 * @param  {event} e input onchange event
 * @param  {taskShape} modalTask modal task information
 * @param  {Function} setModalTask modal task information update state funciton
 */
const titleHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  modalTask: taskShape,
  setModalTask: Function
) => {
  const value = e.target.value;
  setModalTask({ ...modalTask, title: value });
};

/** Handles the task description input state
 * @param  {string} value html string of the description
 * @param  {taskShape} modalTask modal task information
 * @param  {Function} setModalTask modal task information update state funciton
 */
const descriptionHandler = (
  value: string,
  modalTask: taskShape,
  setModalTask: Function
) => {
  setModalTask({ ...modalTask, description: value });
};

/** Handles the assignedTo input state
 * @param  {any} selected selected users
 * @param  {taskShape} modalTask modal task information
 * @param  {Function} setModalTask modal task information update state funciton
 */
const assignToHandler = (
  selected: any,
  modalTask: taskShape,
  setModalTask: Function
) => {
  setModalTask({ ...modalTask, assignedTo: selected });
};

/** Handles the date input state
 * @param  {Date} date selected priority
 * @param  {taskShape} modalTask modal task information
 * @param  {Function} setModalTask modal task information update state funciton
 */
const dateHandler = (
  date: Date,
  modalTask: taskShape,
  setModalTask: Function
) => {
  // saves the date as a portuguese format string
  const newDate = dateToString(date);
  setModalTask({ ...modalTask, date: newDate });
};

/** Handles the priority input state
 * @param  {string} selected selected priority
 * @param  {taskShape} modalTask modal task information
 * @param  {Function} setModalTask modal task information update state funciton
 */
const priorityHandler = (
  selected: any,
  modalTask: taskShape,
  setModalTask: Function
) => {
  setModalTask({ ...modalTask, priority: selected.value });
};

/** Sumits a comment on the current task
 * @param  {string} commentText the comment itself
 * @param  {taskShape} taskInfo task information
 * @param  {taskShape} modalTask modal task information
 * @param  {Function} setModalTask modal task information update state function
 * @param  {number} currTaskNum index of the task in the column container
 * @param  {string} currTaskColumn The columns where the task is
 * @param  {string} departmentBoard department board
 * @param  {string} currBoard board contained in the department
 * @param  {userContext} user authenticated user
 * @return {modalTask} updated task
 */
const submitComment = (
  commentText: string,
  taskInfo: taskShape,
  modalTask: taskShape,
  setModalTask: Function,
  currTaskNum: number,
  currTaskColumn: string,
  departmentBoard: string,
  currBoard: string,
  user: userContext | null,
  setCommentText: Function
) => {
  if (!user) {
    return;
  }
  let comment = {
    comment: commentText,
    timestamp: new Date().getTime(),
    createdBy: user.id,
    createdByName: user.name,
  };

  // Push the comment to DB
  let commentRef = `private/${departmentBoard}/b/${currBoard}/${currTaskColumn}/items/${currTaskNum}/comments`;
  push(ref(db, commentRef), comment);
  // Increment comment count on task db, and in state
  let commentNumRef = `private/${departmentBoard}/b/${currBoard}/${currTaskColumn}/items/${currTaskNum}/numComments`;
  runTransaction(ref(db, commentNumRef), (num) => {
    return (num || 0) + 1;
  });
  setModalTask({ ...modalTask, numComments: modalTask.numComments + 1 });

  // Update number of comments on assigned users db (this is cheating because we
  // are not updating the comments themselves, no need)
  if (taskInfo.assignedTo) {
    for (let userOption of taskInfo.assignedTo) {
      let userKey = userOption.value;
      let userCommentRef = `usersTasks/${userKey}/${taskInfo.id}/numComments`;
      // increment count users
      runTransaction(ref(db, userCommentRef), (num) => {
        return (num || 0) + 1;
      });
      if (userKey !== user.id) {
        sendNotification(
          userKey,
          user.id,
          taskInfo.title,
          `${user.name} commented on this task.`,
          `/${departmentBoard}/b/${currBoard}`,
          null,
          "task",
          "info"
        );
      }
    }
  }

  // Clear the input
  setCommentText("");
};

/** Updates the task status, based on the column ID
 * @param  {taskShape} currTask task to update
 * @param  {string} colId column id to update
 * @return {currTask} updated task
 */
const updateTaskColumn = (currTask: taskShape, colId: string) => {
  // Update column id of task
  currTask.columnId = colId;
  // Update status of task
  if (colId === "0Todo") {
    currTask.status = "To do";
  } else if (colId === "1InProgress") {
    currTask.status = "In Progress";
  } else if (colId === "2Completed") {
    currTask.status = "Completed";
  }

  return currTask;
};

/** Updates the board columns in the database, whenever a task is dropped
 * @param  {DropResult} result destination and source of the dropped task
 * @param  {columnsShape} columns board columns
 * @param  {string} departmentBoard current department board
 * @param  {string} currBoard current board in the department
 */
const onDragEnd = (
  result: DropResult,
  columns: columnsShape,
  departmentBoard: string,
  currBoard: string
) => {
  if (!result.destination) return;
  const { source, destination } = result;
  if (source && source.droppableId !== destination.droppableId) {
    // From source to destination
    // Copy the arrays into new ones
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    if (!destColumn.items) destColumn.items = [];
    if (!sourceColumn.items) sourceColumn.items = [];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    // Remove task from source column
    let [movedTask] = sourceItems.splice(source.index, 1);
    // Update column of the task, where it was moved
    movedTask = updateTaskColumn(movedTask, destination.droppableId);
    // insert the moved task into the destination column
    destItems.splice(destination.index, 0, movedTask);
    // update database
    update(ref(db, `private/${departmentBoard}/b/${currBoard}`), {
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });
    // update new status to all assigned users
    if (movedTask.assignedTo) {
      for (let userOption of movedTask.assignedTo) {
        let userKey = userOption.value;
        // remove users
        update(
          ref(db, `private/usersTasks/${userKey}/${movedTask.id}`),
          movedTask
        );
      }
    }
  } else if (source && source.droppableId) {
    // Dropping in the same place, different position
    const column = columns[source.droppableId];
    if (!column.items) column.items = [];
    const copiedItems = [...column.items];
    // Update the new index position
    const [movedTask] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, movedTask);

    update(ref(db, `private/${departmentBoard}/b/${currBoard}`), {
      ...columns,
      [source.droppableId]: { ...column, items: copiedItems },
    });
  }
};

/**
 * Add a new task to the current board, by updating the database, and opens the
 * modal ready for editing
 * @param columns columns with tasks
 * @param departmentBoard department board
 * @param currBoard current board
 * @param setCurrTaskInfo sets current task info
 * @param setModalTask aux task info state
 * @param setCurrTaskColumn current column of the task
 * @param setCurrTaskNum current task number
 * @param setCommentListener comment listener state
 * @param setDrawerOpen drawer state
 */
const addTask = (
  user: userContext | null,
  columns: columnsShape,
  departmentBoard: string,
  currBoard: string,
  setCurrTaskInfo: Function,
  setModalTask: Function,
  setCurrTaskColumn: Function,
  setCurrTaskNum: Function,
  setCommentListener: Function,
  setDrawerOpen: Function
) => {
  if (!user) return;
  const colId = "0Todo";
  const column = columns[colId];
  if (!column.items) column.items = [];
  const copiedItems = [...column.items];
  const newTask = {
    assignedBy: user.id,
    id: uuid(),
    title: "New Task",
    departmentBoard: departmentBoard,
    currBoard: currBoard,
    columnId: colId,
    status: "To do",
    priority: "None",
    totalObj: 0,
    completedObj: 0,
    numComments: 0,
    date: dateToString(new Date()),
  };
  copiedItems.push(newTask);
  let taskNum = copiedItems.length - 1;
  update(ref(db, `private/${departmentBoard}/b/${currBoard}`), {
    ...columns,
    "0Todo": { ...column, items: copiedItems },
  });
  setCurrTaskColumn(colId);
  setCurrTaskNum(taskNum);
  setModalTask(newTask);
  // Add a listener for the comments
  onValue(
    ref(
      db,
      `private/${departmentBoard}/b/${currBoard}/${colId}/items/${taskNum}`
    ),
    (snapshot) => {
      setCurrTaskInfo(snapshot.val());
    }
  );
  // Save the database reference we are listening to of the comments, to remove
  // on drawer close
  setCommentListener(
    `${departmentBoard}/b/${currBoard}/${colId}/items/${taskNum}`
  );
  setDrawerOpen(true);
};
/** Handler when the task is clicked, opens and fills the modal with the task information
 * @param  {Function} setDrawerOpen update drawer modal state -> open
 * @param  {taskShape} currTask task that was clicked
 * @param  {number} taskNum task index of the column items
 * @param  {Function} setCurrTaskInfo update current task state
 * @param  {Function} setModalTask update auxiliary task state
 * @param  {Function} setCurrTaskColumn update current column id state
 * @param  {Function} setCurrTaskNum update current task index of column items
 * @param  {Function} setCommentListener update database reference for the
 * comment listener
 * @param  {string} departmentBoard current board in the department
 * @param  {string} currBoard current department board
 */
const taskOnClick = (
  setDrawerOpen: Function,
  currTask: taskShape,
  taskNum: number,
  colId: string,
  setCurrTaskInfo: Function,
  setModalTask: Function,
  setCurrTaskColumn: Function,
  setCurrTaskNum: Function,
  setCommentListener: Function,
  departmentBoard: string,
  currBoard: string
) => {
  setDrawerOpen(true); // open drawer modal
  setCurrTaskColumn(colId); // save the task column
  setCurrTaskNum(taskNum); // save the index of the task of the column items
  // Add a listener for the comments
  onValue(
    ref(
      db,
      `private/${departmentBoard}/b/${currBoard}/${colId}/items/${taskNum}`
    ),
    (snapshot) => {
      setCurrTaskInfo(snapshot.val());
    }
  );
  // An auxiliary task info for the drawer modal, on value changes
  setModalTask(currTask);
  // Save the database reference we are listening to of the comments, to remove
  // on drawer close
  setCommentListener(
    `${departmentBoard}/b/${currBoard}/${colId}/items/${taskNum}`
  );
};

/**
 * Retrieves respective task which was sent from url
 * @param taskId task id to find
 * @param colId column id to look in
 * @param columns board columns with tasks
 * @param setCurrTaskInfo set current task info
 * @param setModalTask aux modal task info
 * @param setDrawerOpen modal handler function
 */
const openMatchingTaskId = (
  taskId: string,
  colId: string,
  columns: columnsShape,
  departmentBoard: string,
  currBoard: string,
  setOpenedFromUrl: Function,
  setCurrTaskInfo: Function,
  setModalTask: Function,
  setCurrTaskColumn: Function,
  setCurrTaskNum: Function,
  setDrawerOpen: Function
) => {
  // To do, in progress or completed
  let selectedCol = columns[colId];
  // loop tasks in items
  if (selectedCol.items) {
    Object.entries(selectedCol.items).forEach(([taskNum, task]) => {
      if (task.id === taskId) {
        // Add a listener for the comments
        onValue(
          ref(
            db,
            `private/${departmentBoard}/b/${currBoard}/${colId}/items/${taskNum}`
          ),
          (snapshot) => {
            setCurrTaskInfo(snapshot.val());
            setModalTask(snapshot.val());
          }
        );
        setDrawerOpen(true);
        // An auxiliary task info for the drawer modal, on value changes
        setCurrTaskColumn(colId);
        setCurrTaskNum(taskNum);
        setOpenedFromUrl(true);
      }
    });
  }
};

/** Open the drawer modal or close it, removing the comment listener
 * @param  {Function} setDrawerOpen update drawer modal state -> open
 * @param  {Function} commentListener database comment reference
 * @param  {Function} setCommentListener update database reference for the comment
 */
const drawerOpenHandler = (
  setDrawerOpen: Function,
  commentListener: string | null,
  setCommentListener: Function
) => {
  setDrawerOpen(false);
  if (commentListener) off(ref(db, commentListener));
  setCommentListener(null);
};

/** Gets the list of existing boards in the department, to fill the select input
 * @param  {string} departmentBoard current board in the department
 * @param  {Function} setExistingBoards updates the boards select input state
 */
const updateExistingBoards = (
  departmentBoard: string,
  setExistingBoards: Function
) => {
  onValue(ref(db, `private/${departmentBoard}/list`), (snapshot) => {
    let boards: string[] = snapshot.val();
    setExistingBoards(
      boards.map((board, idx) => {
        return {
          value: getDecodedString(board),
          label: getDecodedString(board),
        };
      })
    );
  });
};

/** Crete a new board in the database
 * @param  {string} boardString board to create
 * @param  {string} departmentBoard current board in the department
 * @param  {columnShape} boardSkeleton board skeleton without items to create
 * @param  {Function} setRedirectToBoard update the state to redirect onto the
 * new created board
 */
const createNewBoard = (
  boardString: string,
  departmentBoard: string,
  boardSkeleton: columnsShape,
  setRedirectToBoard: Function
) => {
  let encodedBoardString = getEncodedString(boardString.trim());
  // Build the new board skeleton
  set(
    ref(db, `private/${departmentBoard}/b/${encodedBoardString}`),
    boardSkeleton
  );
  // Update the boards list
  get(ref(db, `private/${departmentBoard}/list`)).then((snapshot) => {
    let boards: string[] = snapshot.val();
    let newBoardsList = [...boards, encodedBoardString];
    set(ref(db, `private/${departmentBoard}/list`), newBoardsList);
  });
  // Redirect to the newly created board
  setRedirectToBoard(encodedBoardString);
};

/** Redirect to selected board, when user clicks the select input option
 * @param  {string} option board string value
 * @param  {Function} setRedirectToBoard update the location state to redirect
 * @param  {string} departmentBoard current department board
 * @param  {string} currBoard current board in the department
 * @param  {Function} setColumns update columns state
 * new created board
 */
const goToBoard = (
  option: string | boolean,
  setRedirectToBoard: Function,
  departmentBoard: string,
  currBoard: string,
  setColumns: Function
) => {
  if (!option || typeof option !== "string") return;
  let encodedBoardString = getEncodedString(option); // this is the decoded string
  if (currBoard === encodedBoardString) return;
  // Remove current board listener
  off(ref(db, `private/${departmentBoard}/b/${currBoard}`));
  setColumns([]);
  setRedirectToBoard(encodedBoardString);
};

/** Deletes the current board, can't be general
 * @param  {columnsShape} columns current columns of the board
 * @param  {string} departmentBoard current board in the department
 * @param  {string} currBoard current board in the department
 * @param  {Function} setRedirectToBoard redirects to general
 */
const deleteBoard = (
  columns: columnsShape,
  departmentBoard: string,
  currBoard: string,
  setRedirectToBoard: Function
) => {
  // For each task in board, remove task from assigned users
  Object.keys(columns).forEach((colId, idx) => {
    let column = columns[colId];
    if (column.items) {
      // Loop columns
      column.items.forEach((task, idx) => {
        let taskId = task.id;
        if (task.assignedTo) {
          // Loop tasks
          task.assignedTo.forEach((option, idx) => {
            let userId = option.value;
            // remove task from user
            remove(ref(db, `private/usersTasks/${userId}/${taskId}`));
          });
        }
      });
    }
  });
  // Remove board from DB
  remove(ref(db, `private/${departmentBoard}/b/${currBoard}`));
  // Remove board name from department boards list
  get(ref(db, `private/${departmentBoard}/list`)).then((snapshot) => {
    let boards: string[] = snapshot.val();
    const index = boards.indexOf(currBoard);
    if (index > -1) {
      boards.splice(index, 1);
    }
    set(ref(db, `private/${departmentBoard}/list`), boards).then(() => {
      setRedirectToBoard(`/${departmentBoard}/b/General`);
    });
    // Redirect to general
  });
};

/** Checks if the department board is allowed to search in the DB
 * @param  {string} departmentBoard current board in the department
 * @return {boolean} allowed or not
 */
const isDepartmentBoardAllowed = (departmentBoard: string) => {
  const allowedDepBoard = [
    "tasksES",
    "tasksMM",
    "tasksMS",
    "tasksDC",
    "tasksHP",
  ];
  return allowedDepBoard.includes(departmentBoard);
};

const boardSkeleton = {
  "0Todo": {
    classNames: "kanban-board-header card text-center bg-danger text-white",
    name: "To do",
  },
  "1InProgress": {
    classNames: "kanban-board-header card text-center bg-warning text-white",
    name: "In Progress",
  },
  "2Completed": {
    classNames: "kanban-board-header card text-center bg-success text-white",
    name: "Completed",
  },
};
const taskSkeleton = {
  departmentBoard: "a",
  currBoard: "",
  columnId: "0Todo",
  assignedBy: "",
  assignedByName: "",
  assignedTo: [],
  completedObj: 0,
  numComments: 0,
  date: "",
  description: "alo",
  priority: "",
  status: "",
  totalObj: 0,
  id: "",
  title: "",
};

const taskPriorityOptions = [
  {
    value: "None",
    label: "None",
  },
  {
    value: "High",
    label: "High",
  },
  {
    value: "Medium",
    label: "Medium",
  },
  {
    value: "Low",
    label: "Low",
  },
];

const initialColumns = {
  "0Todo": {
    name: "To do",
    items: [],
    classNames: "kanban-board-header card text-center bg-danger text-white",
  },
  "1InProgress": {
    name: "In progress",
    items: [],
    classNames: "kanban-board-header card text-center bg-warning text-white",
  },
  "2Completed": {
    name: "Completed",
    items: [],
    classNames: "kanban-board-header card text-center bg-success text-white",
  },
};

const taskTitleIconColor = {
  tasksES: {
    title: "Electrical Systems Board",
    icon: "fa fa-lightbulb",
    color: "bg-sunny-morning",
  },
  tasksMS: {
    title: "Mechanical Systems Board",
    icon: "fa fa-cogs",
    color: "bg-happy-itmeo",
  },
  tasksDC: {
    title: "Design and Composites Board",
    icon: "fa fa-anchor",
    color: "bg-happy-fisher",
  },
  tasksMM: {
    title: "Management and Marketing Board",
    icon: "fa fa-chart-line",
    color: "bg-tempting-azure",
  },
  tasksHP: {
    title: "Hydrogen Board",
    icon: "fa fa-atom",
    color: "bg-mixed-hopes",
  },
};

const selectStyles = (theme: any, isDisabled: boolean) => {
  return {
    ...theme,
    borderRadius: "0.2rem",

    container: (base: any) => ({
      ...base,
      flex: 1,
    }),
    colors: {
      ...theme.colors,
      neutral5: isDisabled && "#e9ecef", //I'm changing the predefined variable of the disabled color
      neutral40: "#495057",
      neutral10: "#ced4da",
    },
  };
};

const getTaskBoardTitleAndColor = (
  departmentBoard: string,
  departments: Departments,
  setDepartment: Function
) => {
  // Get the acronym
  let acronym = departmentBoard.replace("tasks", "").toLowerCase();
  // Get department
  let department = departments[acronym];
  setDepartment(department);
};

/**
 * Gets the encoded task url names from the url path
 * @returns
 */
const getEncodedBoardNames = () => {
  const pathName = window.location.pathname;
  // thread pathName
  // /forum/s/encodedSectionName/topic/encodedTopicName/thread/encodedThreadName
  let splitted = pathName.split("/");
  let encodedDepartmentBoard = splitted[1];
  let encodedCurrBoard = splitted[3];
  // decode everything and encode everything (our encoding is different from
  // browsers url)
  encodedDepartmentBoard = getEncodedString(
    getDecodedString(encodedDepartmentBoard)
  );
  encodedCurrBoard = getEncodedString(getDecodedString(encodedCurrBoard));

  return [encodedDepartmentBoard, encodedCurrBoard];
};
// }
export {
  taskTitleIconColor,
  selectStyles,
  initialColumns,
  taskPriorityOptions,
  taskSkeleton,
  boardSkeleton,
  swalDeleteMessage,
  isDepartmentBoardAllowed,
  onDragEnd,
  deleteBoard,
  goToBoard,
  createNewBoard,
  drawerOpenHandler,
  updateExistingBoards,
  taskOnClick,
  addTask,
  submitComment,
  priorityHandler,
  dateHandler,
  assignToHandler,
  titleHandler,
  descriptionHandler,
  saveTask,
  saveTaskAsEvent,
  countCompletedObjectives,
  addTaskToUsers,
  deleteTask,
  openMatchingTaskId,
  getTaskBoardTitleAndColor,
  getEncodedBoardNames,
};
