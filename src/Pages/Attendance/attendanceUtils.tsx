import { ApexOptions } from "apexcharts";
import { get, onValue, ref, remove, set, update } from "firebase/database";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { v4 as uuid } from "uuid";
import { db } from "../../config/firebase";
import {
  EventInformation,
  Statistic,
  User,
  UserMetadata,
  graphColor,
  userContext,
  userStatus,
} from "../../interfaces";
import {
  dateToString,
  inputToDate,
  sendNotification,
  toastrMessage,
  userHasPermission,
} from "../../utils/generalFunctions";

/** Updates the user database with attended or missed evet of user
 * @param  {boolean} payload content of the tooltip
 * @param  {boolean} active if the tooltip is active
 */
const customTooltip = ({ payload, content, active }: any) => {
  if (active) {
    return (
      <div className={"tooltip-inner"}>
        <p>Attended</p>
        <strong>{`${Number(payload[0].value * 100).toFixed(0)}% `}</strong>
      </div>
    );
  }
  return null;
};

/** Checks if the user attended the event, if a presence was already checked.
By setting the state
 * @param  {Statistic} statistic all user statistic events
 * @param  {string} eventId the eventId
 * @param  {Function} setCurrStatus graph mean array
 * @returns nothing if no statistic
 */
const setUserEventStatusState = (
  statistic: Statistic,
  statType: string,
  eventId: string,
  event: EventInformation,
  setCurrStatus: Function,
) => {
  if (!statistic) return;

  //   Only update once, lazy way of if statements
  if (
    (statType === "generalStats" && event.type.includes("General")) ||
    statType === "departmentStats"
  ) {
    if (Object.hasOwn(statistic, eventId)) {
      if (Object.hasOwn(statistic[eventId], "attended")) {
        if (statistic[eventId].attended) {
          //   User attended the event
          setCurrStatus({
            title: "attended",
            badge: "badge-success",
            attended: true,
            missed: false,
          });
        } else {
          // User missed the event
          setCurrStatus({
            title: "missed",
            badge: "badge-danger",
            attended: false,
            missed: true,
          });
        }
      }
    }
  }
};

/** Returns an updated color version of the graph options
 * @param  {string} graphColor graph mean array
 * @param  {graphColor} currOptions graph mean array
 * @returns updated graphColor
 */
const getGraphOptions = (graphColor: string, currOptions: graphColor) => {
  if (graphColor === "red") {
    return graphRed;
  }
  return graphGreen;
};

/** Retrieves the graph color based on a threshold
 * @param  {number[]} statMask graph mean array
 * @returns graph color
 */
const getGraphColor = (statMask: number[]) => {
  const scoreThreshold = 0.85;
  if (statMask[statMask.length - 1] < scoreThreshold) {
    return "red"; // red
  }
  return "green"; // green
};

/** Build the attendance mean array for the graph
 * @param  {Statistic} statistic object filled with ueser event information
 * @param  {string[]} keys keys of the statistic object
 * @param  {number} totalEvents calculate mean until certain point
 * @returns mean
 */
const calcStatMean = (statistic: Statistic, keys: string[], totalEvents: number) => {
  let attendedNum = 0;

  for (let j = 0; j < totalEvents + 1; j++) {
    if (statistic[keys[j]].attended) {
      attendedNum += 1;
    }
  }
  return parseFloat(Number(attendedNum / (totalEvents + 1)).toFixed(2));
};

/** Build the attendance mean array for the graph
 * @param  {Statistic} statistic object filled with ueser event information
 * @returns   [statMask, graphColor] mean array and respective color
 */
const buildStatisticArray = (statistic: Statistic | null) => {
  const arrayLength = 10; // Graph will be the last 10 events
  const statMask: number[] = new Array(arrayLength).fill(0);
  let graphColor = getGraphColor(statMask);
  if (!statistic) return { statSeries: statMask, graphColor: graphColor };

  const statKeys = Object.keys(statistic);
  let statLength = statKeys.length;
  if (statLength > arrayLength) {
    statLength = arrayLength;
  }
  // Calculate the mean for each timestamp of events (recursive like) for the
  // last 10 events, db is already ordered in ascending order -> older events
  // first!
  statKeys.forEach((val, index) => {
    if (index < arrayLength) {
      // Calculate the mean of attending a meeting based on the current index
      // Update event statistics mask, start from the begining
      const pos = arrayLength - statLength + index;
      statMask[pos] = calcStatMean(statistic, statKeys, index);
    }
  });
  graphColor = getGraphColor(statMask);
  return { statSeries: statMask, graphColor: graphColor };
};
/** Conditional matching of allowed events for attendance
 * @param  {string} eventType
 * @returns   {boolean}
 */
const isCorrectType = (eventType: string) => {
  for (const k in meetingType) {
    if (eventType === meetingType[k]) {
      return true;
    }
  }
  return false;
};

/** Conditional matching of allowed events for attendance
 * @param  {string} eventType
 * @returns   {boolean}
 */
const allowedMeetingType = (eventType: string) => {
  if (
    eventType === "Electrical Systems Meeting" ||
    eventType === "Mechanical Systems Meeting" ||
    eventType === "Design and Composites Meeting" ||
    eventType === "Management and Marketing Meeting" ||
    eventType === "Hydrogen Fuel Cell Meeting" ||
    eventType === "General Meeting"
  )
    return true;
  return false;
};

/** Conditional matching of department and meeting type
 * @param  {string} Department
 * @param  {string} eventType
 * @returns   {boolean} boolean
 */
const departmentMatchesEvent = (department: string, eventType: string) => {
  if (
    (department.length > 0 && department.includes("Hydrogen") && eventType.includes("Hydrogen")) ||
    (department.length > 0 && eventType.indexOf(department) !== -1) ||
    eventType === "General Meeting"
  )
    return true;
  return false;
};

/** Sort users based on name
 * @param  {[string, User][]} sortableUsers array of
 * users to be sorted
 * @returns   {sortableUsers} sorted users
 */
const sortUsersDb = (sortableUsers: [string, User][]) => {
  if (sortableUsers) {
    sortableUsers.sort((a: [string, User], b: [string, User]) => {
      if (a[1].pinfo.name && b[1].pinfo.name) {
        // Concatenate strings for sorting
        const nameA = a[1].pinfo.name.replaceAll(" ", "");
        const nameB = b[1].pinfo.name.replaceAll(" ", "");
        if (nameA > nameB) return 1;
        if (nameA < nameB) return -1;
        return 0;
      }
      return 0;
    });
  }
  return sortableUsers;
};

/** Updates the user database with attended or missed evet of user
 * @param  {boolean} didAttend attended the event or not
 * @param  {string} userId the user Id
 * @param  {string} eventId the event Id
 * @param  {EventInformation} event event information
 * @param  {userStatus} currStatus {attended: boolean, missed:boolean}
 */
const updateUserAttendance = (
  didAttend: boolean,
  userId: string,
  eventId: string,
  event: EventInformation,
  currStatus: userStatus,
  user: userContext | null,
) => {
  if (!user) return;
  if (!userHasPermission(user)) {
    toastrMessage("You have insufficient permissions.", "error");
    return;
  }
  // First check if it is a general meeting or department meeting to update
  let statType = "departmentStats";
  if (event.type.includes("General")) statType = "generalStats";

  // Only update if we are not clicking the same button -> OPTIMIZATION LEVEL
  // 9000
  if ((didAttend && !currStatus.attended) || (!didAttend && !currStatus.missed)) {
    // Set the event in the user statistics, with attendance update
    event = { ...event, attended: didAttend };

    set(ref(db, `private/usersStatistics/${userId}/${statType}/currentSeason/${eventId}`), event);
    if (userId !== user.id) {
      if (didAttend) {
        sendNotification(
          userId,
          user.id,
          event.type,
          `Beware, ${user.name} knows you missed this meeting`,
          `/attendance/overall`,
          null,
          "missedEvent",
          "danger",
        );
      } else {
        sendNotification(
          userId,
          user.id,
          event.type,
          `${user.name} checked that you attended this event.`,
          `/attendance/overall`,
          null,
          "attendedEvent",
          "success",
        );
      }
    }
  }
};

/** Build the attendance mean array for the graph
 * @param  {string} statType department statistics or general statistics
 * @param  {string} userId the user Id
 * @param  {string} eventId the event Id
 * @param  {EventInformation} event database event information
 * @param  {graphColor} graphOptions colors for the graph
 * @param  {Function} setGraphSeries updates the graph series data
 * @param  {Function} setGraphOptions updates the graph series color optiones
 * @param  {Function} setCurrStatus updates the status of the user of
 * attendance meeting
 */
const addStatisticListener = (
  statType: string,
  userId: string,
  eventId: string,
  event: EventInformation,
  graphOptions: graphColor,
  setGraphSeries: Function,
  setGraphOptions: Function,
  setCurrStatus: Function,
) => {
  onValue(ref(db, `private/usersStatistics/${userId}/${statType}/currentSeason`), (snapshot) => {
    const statistic: Statistic = snapshot.val();

    // Build array and options for the graph
    const { statSeries, graphColor } = buildStatisticArray(statistic);
    const graphData = statSeries.map((value, idx) => ({ x: idx, y: value }));
    setGraphSeries(graphData);
    const updatedOptions = getGraphOptions(graphColor, graphOptions);
    setGraphOptions({ ...updatedOptions, name: uuid() });

    // Set the current status, only run once
    setUserEventStatusState(statistic, statType, eventId, event, setCurrStatus);
  });
};

const meetingType = [
  "General Meeting",
  "Management and Marketing Meeting",
  "Electrical Systems Meeting",
  "Mechanical Systems Meeting",
  "Hydrogen Fuel Cell Meeting",
  "Design and Composites Meeting",
];

const attendanceTitleIconColor = {
  "Electrical Systems Meeting": {
    title: "Electrical Systems Meeting",
    icon: "fa fa-lightbulb",
    color: "bg-sunny-morning",
  },
  "Mechanical Systems Meeting": {
    title: "Mechanical Systems Meeting",
    icon: "fa fa-cogs",
    color: "bg-happy-itmeo",
  },
  "Design and Composites Meeting": {
    title: "Design and Composites Meeting",
    icon: "fa fa-anchor",
    color: "bg-happy-fisher",
  },
  "Management and Marketing Meeting": {
    title: "Management and Marketing Meeting",
    icon: "fa fa-chart-line",
    color: "bg-tempting-azure",
  },
  "Hydrogen Fuel Cell Meeting": {
    title: "Hydrogen Fuel Cell Meeting",
    icon: "fa fa-atom",
    color: "bg-mixed-hopes",
  },
  "General Meeting": {
    title: "General Meeting",
    icon: "fa fa-globe-europe",
    color: "bg-night-fade",
  },
  "Leaders Meeting": {
    title: "Leaders Meeting",
    icon: "fa fa-globe-europe",
    color: "bg-night-fade",
  },
  Other: {
    title: "Other Meeting",
    icon: "fa fa-globe-europe",
    color: "bg-night-fade",
  },
  "Sponsor Meeting": {
    title: "Sponsor Meeting",
    icon: "fa fa-globe-europe",
    color: "bg-night-fade",
  },
  Competition: {
    title: "Competition Meeting",
    icon: "fa fa-globe-europe",
    color: "bg-night-fade",
  },
};

const graphGreen: graphColor = {
  name: "colorGreen",
  gradient1: "rgba(58, 196, 125, 0.65)",
  gradient2: "rgba(58, 196, 125, 0.65)",
  gradient3: "rgba(58, 196, 125, 0.65)",
  strokeColor: "#3ac47d",
};
const graphRed: graphColor = {
  name: "colorRed",
  gradient1: "rgba(199,0,57,0.65)",
  gradient2: "rgba(227,128,156,0.5)",
  gradient3: "rgba(227,128,156,0.5)",
  strokeColor: "#C70039",
};

const graphOptionsStyle: ApexOptions = {
  grid: {
    padding: {
      left: -100,
    },
  },
  chart: {
    sparkline: {
      enabled: !0,
    },
  },
  stroke: {
    width: 2,
  },
  yaxis: {
    show: false,
    min: -0.2,
    max: 1.2,
  },
  xaxis: {
    crosshairs: {
      width: 1,
    },
  },
  tooltip: {
    fixed: {
      enabled: !1,
    },
    x: {
      show: !1,
    },
    y: {
      title: {
        formatter: (t) => "",
      },
    },
    marker: {
      show: !1,
    },
  },
};

/**
 * Get overall attendance statistics series and options
 * @param statType
 * @param userId
 * @param graphOptions
 * @param setGraphSeries
 * @param setGraphOptions
 */
const addOverallStatisticListener = (
  statType: string,
  userId: string,
  graphOptions: graphColor,
  setGraphSeries: Function,
  setGraphOptions: Function,
) => {
  onValue(ref(db, `private/usersStatistics/${userId}/${statType}/currentSeason`), (snapshot) => {
    const statistic: Statistic = snapshot.val();

    // Build array and options for the graph
    const { statSeries, graphColor } = buildStatisticArray(statistic);
    const graphData = statSeries.map((value, idx) => ({ x: idx, y: value }));
    setGraphSeries(graphData);
    const updatedOptions = getGraphOptions(graphColor, graphOptions);
    setGraphOptions({ ...updatedOptions, name: uuid() });
  });
};

const addLastStatisticUpdateListener = (setLastUpdate: Function) => {
  onValue(ref(db, `private/cache/userStatistics/lastUpdate`), (snapshot) => {
    const lastUpdate: number = snapshot.val();
    if (!lastUpdate) {
      setLastUpdate("");
      return;
    }
    const date = inputToDate(lastUpdate);
    const dateString = dateToString(date, true);
    setLastUpdate(dateString);
  });
};

const resetUserSeason = (userId: string, statType: string) => {
  get(ref(db, `private/usersStatistics/${userId}/${statType}/currentSeason`)).then((snapshot) => {
    const currentSeason: Statistic = snapshot.val();

    // Update historical statistics
    update(ref(db, `private/usersStatistics/${userId}/${statType}/history`), currentSeason);

    // Delete currenSeason statistics
    remove(ref(db, `private/usersStatistics/${userId}/${statType}/currentSeason`));
  });
};

/**
 * This function will move every current season statistic under history
 * @param usersMetadata
 */
const resetSeason = (usersMetadata: UserMetadata) => {
  try {
    Object.entries(usersMetadata).forEach(([userId, _]) => {
      // For each userId, get currentSeason, update history, and delete current
      resetUserSeason(userId, "departmentStats");
      resetUserSeason(userId, "generalStats");

      // Update last season update date
      const timestamp = new Date().getTime();
      set(ref(db, `private/cache/userStatistics`), { lastUpdate: timestamp });
    });
    toastrMessage("Statistics were successfully reset", "success");
  } catch (error) {
    toastrMessage("There was an error resetting the season", "error");
  }
};

const moveStatistics = (usersMetadata: UserMetadata) => {
  Object.entries(usersMetadata).forEach(([userId, _]) => {
    // For each userId, get currentSeason, update history, and delete current
    get(ref(db, `private/usersStatistics/${userId}/departmentStats`)).then((snapshot) => {
      const currentSeason: Statistic = snapshot.val();

      // Delete currenSeason statistics
      remove(ref(db, `private/usersStatistics/${userId}/departmentStats`));

      // Update historical statistics
      set(
        ref(db, `private/usersStatistics/${userId}/departmentStats/currentSeason`),
        currentSeason,
      );
    });

    // For each userId, get currentSeason, update history, and delete current
    get(ref(db, `private/usersStatistics/${userId}/generalStats`)).then((snapshot) => {
      const currentSeason: Statistic = snapshot.val();

      // Delete currenSeason statistics
      remove(ref(db, `private/usersStatistics/${userId}/generalStats`));

      // Update historical statistics
      set(ref(db, `private/usersStatistics/${userId}/generalStats/currentSeason`), currentSeason);
    });
  });
};

/** Show a confirmation message to reset the season
 * @param  {Function} resetSeason function to delete the board
 */
const swalResetSeason = (resetSeason: Function) => {
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
      denyButtonText: "Yes, reset season!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to reset this season.</p> <p><h4>Are you sure?</h4></p>`,
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      }
      if (result.isDenied) {
        resetSeason();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

export {
  addLastStatisticUpdateListener,
  addOverallStatisticListener,
  addStatisticListener,
  allowedMeetingType,
  attendanceTitleIconColor,
  buildStatisticArray,
  customTooltip,
  departmentMatchesEvent,
  getGraphOptions,
  graphGreen,
  graphOptionsStyle,
  graphRed,
  isCorrectType,
  moveStatistics,
  resetSeason,
  setUserEventStatusState,
  sortUsersDb,
  swalResetSeason,
  updateUserAttendance,
};
