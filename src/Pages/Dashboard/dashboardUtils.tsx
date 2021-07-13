import { db } from "../../config/firebase";
import {
  BomMaterial,
  EventDatabase,
  EventInformation,
  PinnedThread,
  taskShape,
  UserBomMaterials,
  userContext,
  UserMetadata,
  UserTasks,
} from "../../interfaces";
import { inputToDate } from "../../utils/generalFunctions";
import { updateWhoViewedMostRecentUpdate } from "../ForumThread/forumThreadUtils";

/** Gets the most recent event from the specified meeting type
 * @param   user  authenticated user
 * @param   meetingType specific meeting type to match
 * @param   currEvent event to match the meeting type
 * @param   setEvent set current event update state function
 */
const getSpecifiedEvent = (
  user: userContext | null,
  meetingType: string,
  currEvent: EventInformation | undefined,
  setEvent: Function
) => {
  if (!user) return;
  db.ref(`private/events/current`)
    .once("value")
    .then((snapshot) => {
      let eventsDb: EventDatabase = snapshot.val();
      let events = Object.entries(eventsDb);
      let prevDate: null | string = null;
      for (const event of events) {
        let eventInfo = event[1];
        let date = eventInfo.date;
        // check department Meeting
        if (eventInfo.type.includes(meetingType)) {
          let [newPrevDate, mostRecent] = compareMeetingTime(date, prevDate);
          prevDate = newPrevDate;
          if (mostRecent && !currEvent) {
            setEvent(eventInfo);
          }
        }
      }
    });
};

/** Gets the most recent date between two
 * @param  {string} curr current date
 * @param  {string} prev previous date
 */
const compareMeetingTime = (
  curr: string,
  prev: string | null
): [string, boolean] => {
  // prev is the previous data to compare, in date
  if (!prev) {
    return [curr, true];
  } else {
    let currDate = inputToDate(curr);
    let prevDate = inputToDate(prev);
    if (currDate < prevDate) {
      return [curr, true];
    } else {
      return [prev, false];
    }
  }
};

/** Gets the time left in days or hours between two dates
 * @param  {string} date1 current date
 * @param  {string} date2 next date
 */
const getTimeLeft = (date1: number, date2: number) => {
  const ONE_DAY = 1000 * 60 * 60 * 24;
  // find the interval between now and the countdown time
  let timeLeft = date1 - date2;

  // time calculations for days, hours, minutes and seconds
  var days = Math.floor(timeLeft / ONE_DAY);
  var hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  var minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  //   var seconds = Math.floor((timeLeft / 1000) % 60);
  // display the result in the element with id="demo"
  if (days > 1) {
    return [days + " days left", timeLeft];
  } else if (days === 1) {
    return [days + " day left", timeLeft];
  } else {
    return [hours + "h " + minutes + "m left", timeLeft];
  }
};

/** Gets the time left in days or hours between two dates
 * @param  {Date} date current date
 * @param   timer timeout timer function if any
 * @param   setTimeLeft update time left string state function
 */
const countDownTimer = (
  date: Date,
  timer: NodeJS.Timeout,
  setTimeLeft: Function
) => {
  var later = date.getTime();
  // get today's date and time in milliseconds
  let now = new Date().getTime();

  let [timeLeftString, timeLeft] = getTimeLeft(later, now);
  setTimeLeft(timeLeftString);

  // clearing countdown when complete
  if (timeLeft < 0) {
    if (timer) clearTimeout(timer);
    setTimeLeft("-");
  }
};

/** Creates a countdown timer to the specified meeting date
 * @param   event  event information if any
 * @param   setTimeLeft update time left string state function
 */
const setMeetingTimeout = (
  event: EventInformation | undefined,
  setTimeLeft: Function
) => {
  if (!event) return;
  const d = new Date(inputToDate(event.date));
  d.setHours(parseInt(event.hours));
  d.setMinutes(parseInt(event.minutes));

  let [timeLeftString, timeLeft] = getTimeLeft(
    d.getTime(),
    new Date().getTime()
  );
  if (timeLeft < 0) {
    setTimeLeft("-");
  } else {
    setTimeLeft(timeLeftString);
  }

  var timer = setInterval(function () {
    countDownTimer(d, timer, setTimeLeft);
  }, 5000);
  return timer;
};

/** Retrieves pinned thread information and respective paths
 * @param   setThreadInformation  thread information update state function
 * @param   setForumPaths forum paths update state function
 */
const getPinnedThreadInfo = (
  user: userContext | null,
  setThreadInformation: Function,
  setForumPaths: Function
) => {
  db.ref("private/forumPinned").on("value", (snapshot) => {
    if (!snapshot.val()) {
      setThreadInformation(null);
      return;
    }
    // get encoded Section Name
    let pinnedThread: PinnedThread = snapshot.val();

    Object.entries(pinnedThread).forEach(([eSectionName, sectionInfo]) => {
      Object.entries(sectionInfo).forEach(([eTopicName, topicInfo]) => {
        Object.entries(topicInfo).forEach(([eThreadName, threadInfo]) => {
          // Update who viewed the recent update of thread on page entry
          updateWhoViewedMostRecentUpdate(
            user,
            eSectionName,
            eTopicName,
            eThreadName,
            false,
            "recentUpdateViewedBy",
            threadInfo.recentUpdateViewedBy
          );
          // Update who viewed the thread on page entry
          updateWhoViewedMostRecentUpdate(
            user,
            eSectionName,
            eTopicName,
            eThreadName,
            false,
            "viewedBy",
            threadInfo.viewedBy
          );
          setForumPaths({
            encodedSectionName: eSectionName,
            encodedTopicName: eTopicName,
            encodedThreadName: eThreadName,
          });
          setThreadInformation(threadInfo);
        });
      });
    });
  });
};

/**
 * Retrieves task left and badge color
 * @param toDo task or material
 * @returns [left color, badge color]
 */
const getTaskStatusBadge = (toDo: taskShape & BomMaterial) => {
  let leftColor = "";
  let badgeColor = "";
  if (toDo.hasOwnProperty("priority")) {
    if (toDo.priority === "None") leftColor = "";
    else if (toDo.priority === "High") leftColor = "bg-danger";
    else if (toDo.priority === "Medium") leftColor = "bg-warning";
    else if (toDo.priority === "Low") leftColor = "bg-info";
  }
  if (toDo.status === "To do") badgeColor = "badge-danger";
  else if (toDo.status === "In Progress") badgeColor = "badge-warning";
  return [leftColor, badgeColor];
};

/**
 * Retrieves material left and badge color
 * @param toDo task or material
 * @returns [left color, badge color]
 */
const getMaterialStatusBadge = (toDo: taskShape & BomMaterial) => {
  let colors = ["", ""];
  if (toDo.hasOwnProperty("status")) {
    if (toDo.status === "Required") colors = ["bg-danger", "badge-danger"];
    else if (toDo.status === "In Progress")
      colors = ["bg-warning", "badge-warning"];
  }
  return colors;
};

/**
 * Retrieves left and badge color
 * @param toDo task or bom material
 * @returns [left color, badge color]
 */
const getStatusBadge = (toDo: taskShape & BomMaterial, isTask: boolean) => {
  // If is taskTitleIconColor, check priority
  let colors = ["", ""];
  if (isTask) {
    colors = getTaskStatusBadge(toDo);
  } else {
    colors = getMaterialStatusBadge(toDo);
  }
  return colors;
};

/**
 * Retrieves an assigned by string
 * @param user authenticated user or not
 * @param usersMetadata users metadata
 * @param assignedBy user id
 * @returns
 */
const getAssignedByString = (
  user: userContext | null,
  usersMetadata: UserMetadata,
  assignedBy: string | undefined
) => {
  if (!user || !assignedBy) return "";
  if (user.id === assignedBy) return "Assigned by you.";
  return `Assigned by ${usersMetadata[assignedBy].pinfo.name}.`;
};

const getToDoTitle = (toDo: taskShape & BomMaterial, isTask: boolean) => {
  if (isTask) return toDo.title;

  // if material, return quantity and from as well
  let quantity = toDo.quantity;
  let description = toDo.description;
  let from = toDo.from;
  return `[${quantity}] ${description} from ${from}`;
};

const getLinkTo = (
  toDoId: string,
  toDo: taskShape & BomMaterial,
  isTask: boolean
) => {
  if (isTask) {
    // to do is a task
    let departmentBoard = toDo.departmentBoard;
    let currBoard = toDo.currBoard;
    let pathObject = {
      pathname: `${departmentBoard}/b/${currBoard}`,
      elId: toDoId,
      colId: toDo.columnId ? toDo.columnId : toDo.season,
    };
    return pathObject;
  } else {
    // to do is a budget item
    let pathObject = {
      pathname: `/budget`,
      elId: toDoId,
      colId: toDo.season,
    };
    return pathObject;
  }
};

/**
 * Retrieves assigned user tasks
 * @param user authenticated user or not
 * @returns snapshot of user tasks or false if it does not exist
 */
const getUserTasks = (user: userContext | null) => {
  return new Promise<false | UserTasks>((resolve, reject) => {
    if (!user) resolve(false);
    db.ref("private/usersTasks")
      .child(user!.id)
      .once("value")
      .then((snapshot) => {
        if (snapshot.val()) resolve(snapshot.val());
        resolve(false);
      });
  });
};

/**
 * Retrieves assigned user materials
 * @param user authenticated user or not
 * @returns snapshot of user materials or false if it does not exist
 */
const getUserBomMaterials = (user: userContext | null) => {
  return new Promise<false | UserBomMaterials>((resolve) => {
    if (!user) resolve(false);
    db.ref("private/usersBomMaterials")
      .child(user!.id)
      .once("value")
      .then((snapshot) => {
        if (snapshot.val()) resolve(snapshot.val());
        resolve(false);
      });
  });
};

/**
 * Retrieves user materials and tasks, updating the state with all
 * @param user authenticated user or not
 * @param setToDos update all assigned tasks and materials state function
 */
const getTasksAndMaterials = async (
  user: userContext | null,
  setToDos: Function
) => {
  let tasks = await getUserTasks(user);
  let materials = await getUserBomMaterials(user);

  if (tasks && materials) {
    setToDos({ ...tasks, ...materials });
  } else if (tasks) {
    setToDos(tasks);
  } else if (materials) {
    setToDos(materials);
  }
};

export {
  getSpecifiedEvent,
  setMeetingTimeout,
  getPinnedThreadInfo,
  getTasksAndMaterials,
  getAssignedByString,
  getToDoTitle,
  getLinkTo,
  getStatusBadge,
};
