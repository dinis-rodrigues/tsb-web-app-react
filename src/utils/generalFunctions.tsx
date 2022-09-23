// import firebase from "firebase/app";
import { db } from "../config/firebase";
import { v4 as uuid } from "uuid";

// Swal Notifications
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// Toastr Notification
import { toast, ToastPosition } from "react-toastify";
import {
  ApplicationFeatures,
  Department,
  Notification,
  PersonalInformation,
  selectOption,
  UrlObject,
  userContext,
  UserMetadata,
} from "../interfaces";
import { get, push, ref } from "firebase/database";

/** Sends a Toastr Notification to the User
 * @param  {string} title Notification title
 * @param  {string} message Notification message
 * @param  {"error" | "success" | "info" | "warning" | "default"} type Notification type
 */
const toastrMessage = (
  message: string = "",
  type: "error" | "success" | "info" | "warning" | "default" = "info",
  autoclose: boolean = true
) => {
  const position: ToastPosition = "top-right";
  const config = {
    closeButton: true,
    newestOnTop: true,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    autoClose: autoclose ? 5000 : autoclose,
    position: position,
    pauseOnHover: true,
    draggable: true,
    className: "zIndex-inf",
    progress: undefined,
    hideProgressBar: false,
    toastId: uuid(),
  };
  switch (type) {
    case "error":
      toast.error(message, config);
      break;
    case "success":
      toast.success(message, config);
      break;
    case "warning":
      toast.warn(message, config);
      break;
    case "info":
      toast.info(message, config);
      break;
    default:
      toast(message, config);
      break;
  }
};

/** Sends a Swal Notification to the User
 * @param  {string} title Notification title
 * @param  {string} message Notification message
 * @param  {"error" | "success" | "info" | "question"} type Notification type
 */
const swalMessage = (
  title: string,
  message: string,
  type: "error" | "success" | "info" | "question"
) => {
  swalAlert.fire({
    target: ".app-container",
    customClass: {
      denyButton: "btn btn-shadow btn-danger",
      confirmButton: "btn btn-shadow btn-info",
    },
    title: title,
    icon: type,
    html: `<p>${message}</p>`,
  });
};
const swalAlert = withReactContent(Swal);

/** Returns a snapshot of all the users personal information metadata
 * @return {snapshot} all users metadata snapshot
 */
const getAllUsersMetadata = async () => {
  return get(ref(db, "private/usersMetadata"));
};

/** Retrieves and sets users metadata into the state
 * @param {Function} setUsersMetadata users metadata update state function
 */
const getAndSetAllUsersMetadata = (setUsersMetadata: Function) => {
  return get(ref(db, "private/usersMetadata")).then((snapshot) => {
    if (!snapshot.val()) return;
    setUsersMetadata(snapshot.val());
  });
};

/** Retrieves the profile image path based on the User ID
 * @param  {string} id User id
 * @param  {any} firebaseStorage firebase storage object
 * @param  {boolean} compressed returns the compressed image path or not
 * @return {string} image path
 */
const getUserImgUrl = (
  id: string,
  firebaseStorage: any,
  compressed: boolean
) => {
  if (firebaseStorage) {
    const st = firebaseStorage;
    try {
      return st.ref(`users/${id}/${id}comp`).getDownloadURL();
    } catch (error) {}
  } else if (compressed) {
    return `/db/users/${id}/img/${id}comp.png`;
  } else {
    return `/db/users/${id}/img/${id}.png`;
  }
};

/**
 * Normalizes string, removing accents etc..
 * @param str
 * @returns normalized string
 */
const normalizedString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

/** Puts commas and decimals to number
 * @param  {number} x
 * @return {string} xxx,xxx.xx €
 */
const numberWithCommas = (x: number) => {
  let n = Number(x)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return n + " €";
};
/** Transforms the date object into a dd/mm/yyyy string
 * @param  {string} d DateObject
 * @return {string} dd/mm/yyyy
 */
const dateToString = (d: Date | number, withHours = false) => {
  if (d instanceof Date) {
    let day = ("0" + d.getDate()).slice(-2);
    let month = ("0" + String(d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear().toString();
    let dateString = `${day}/${month}/${year}`;
    if (withHours) {
      dateString += " ";
      dateString += ("0" + d.getHours()).slice(-2);
      dateString += "h";
      dateString += ("0" + d.getMinutes()).slice(-2);
    }
    return dateString;
  } else {
    let newD = new Date(d);
    let day = ("0" + newD.getDate()).slice(-2);
    let month = ("0" + String(newD.getMonth() + 1)).slice(-2);
    let year = newD.getFullYear().toString();
    let dateString = `${day}/${month}/${year}`;
    if (withHours) {
      dateString += " ";
      dateString += ("0" + newD.getHours()).slice(-2);
      dateString += "h";
      dateString += ("0" + newD.getMinutes()).slice(-2);
    }
    return dateString;
  }
};

/** Transforms the date string into Date Object
 * @param  {string} date dd/mm/yyy or dd-mm-yyyy
 * @return {Date Object}
 */
const inputToDate = (date: string | number) => {
  if (!date) {
    return new Date();
  }
  if (typeof date === "string") {
    let splitter = "";
    if (date.includes("/")) {
      splitter = "/";
    } else if (date.includes("-")) {
      splitter = "-";
    } else {
      return new Date();
    }
    const arr: Array<string> = date.split(splitter);
    if (arr.length <= 1) {
      // when the state is initializing, the date doesn't exist yet
      return new Date();
    }
    const year = parseInt(arr[2]);
    const month = parseInt(arr[1]) - 1;
    const day = parseInt(arr[0]);
    return new Date(year, month, day);
  } else if (typeof date === "number") {
    // then it is a timestamp
    return new Date(date);
  } else {
    return new Date();
  }
};

/** Extends a date input to a string format
 * @param  {string | Date | number} date in the form of dd/mm/yyyy, Date or timestamp
 * @returns  {string} string in the format eg: Thu, May 14, 2021
 */
const extendDate = (date: string | Date | number) => {
  let newDate = date;
  if (typeof date === "string") {
    newDate = inputToDate(date);
  } else if (date instanceof Date) {
    newDate = date;
  } else {
    newDate = new Date(date);
  }
  return newDate.toLocaleDateString("en-us", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** Gets hours of timestamp date
 * @param  {number} date in the form of dd/mm/yyyy, Date or timestamp
 * @returns  {number} hours of timestamp
 */
const getHoursFromTimestamp = (date: number) => {
  let newDate = new Date(date);
  return newDate.getHours();
};

/** Gets minutes of timestamp date
 * @param  {number} date in the form of dd/mm/yyyy, Date or timestamp
 * @returns  {number} hours of timestamp
 */
const getMinutesFromTimestamp = (date: number) => {
  let newDate = new Date(date);
  return newDate.getMinutes();
};
/** Gets minutes of timestamp date in a string form "00"
 * @param  {number} date in the form of dd/mm/yyyy, Date or timestamp
 * @returns  {number} hours of timestamp
 */
const getMinutesInStringFromTimestamp = (timestamp: number) => {
  let date = new Date(timestamp);
  let minutes = date.getMinutes();
  return ("0" + minutes).slice(-2);
};

/** Gets hours of timestamp date in a string form "00"
 * @param  {number} date in the form of dd/mm/yyyy, Date or timestamp
 * @returns  {number} hours of timestamp
 */
const getHoursInStringFromTimestamp = (timestamp: number) => {
  let date = new Date(timestamp);
  let hours = date.getHours();
  return ("0" + hours).slice(-2);
};

/** Formats the text of the column header, inserting spaces and uppercases,
based on database key's
 * @param  {string} keyId database key Id
 * @returns  {string} string in the format eg: Thu, May 14, 2021
 */
const setColumnText = (keyId: string) => {
  // Transforms the keys to upper values
  for (let i = 0; i < keyId.length; i++) {
    if (keyId.charAt(i) === keyId.charAt(i).toUpperCase()) {
      // insert space between the string
      var newVal = keyId.substr(0, i) + " " + keyId.substr(i);
      newVal = newVal.charAt(0).toUpperCase() + newVal.slice(1);
      return newVal;
    }
  }
  return keyId.charAt(0).toUpperCase() + keyId.slice(1);
};

/** Sorting formatter for Dates
 * @param  {Date} date1
 * @param  {Date} date2
 * @returns  {number} difference
 */
function dateComparator(date1: string, date2: string) {
  var date1Number = dateStringComparableNumber(date1);
  var date2Number = dateStringComparableNumber(date2);

  if (date1Number === null && date2Number === null) {
    return 0;
  }
  if (date1Number === null) {
    return -1;
  }
  if (date2Number === null) {
    return 1;
  }

  return date1Number - date2Number;
}
/** Sorting formatter for Dates
 * @param  {Date} date1
 * @param  {Date} date2
 * @returns  {number} difference
 */
const dateWithHoursComparator = (date1: string, date2: string) => {
  var date1Number = dateWithHoursComparableNumber(date1);
  var date2Number = dateWithHoursComparableNumber(date2);

  if (date1Number === null && date2Number === null) {
    return 0;
  }
  if (date1Number === null) {
    return -1;
  }
  if (date2Number === null) {
    return 1;
  }

  return date1Number - date2Number;
};

/** eg 29/08/2004 gets converted to 20040829
 * @param  {string} date
 * @returns  {number}
 */
function dateStringComparableNumber(date: string) {
  if (date === undefined || date === null || date.length !== 10) {
    return null;
  }

  var yearNumber = parseInt(date.substring(6, 10));
  var monthNumber = parseInt(date.substring(3, 5));
  var dayNumber = parseInt(date.substring(0, 2));

  let newD = new Date(yearNumber, monthNumber - 1, dayNumber);
  return newD.getTime();
}

/** eg 29/08/2004 22h00 gets converted to 20040829 (example)
 * @param  {string} date
 * @returns  {number}
 */
function dateWithHoursComparableNumber(date: string) {
  if (date === undefined || date === null || date.length < 10) {
    return null;
  }
  var yearNumber = parseInt(date.substring(6, 10));
  var monthNumber = parseInt(date.substring(3, 5));
  var dayNumber = parseInt(date.substring(0, 2));
  var hours = parseInt(date.substring(11, 13));
  var minutes = parseInt(date.substring(14));

  let newD = new Date(yearNumber, monthNumber - 1, dayNumber, hours, minutes);

  return newD.getTime();
}

/** Calculates remaining hours between a given date, and now
 * @param  {Date} d
 * @param  {number} hours
 * @param  {number} minutes
 * @returns  {number}remaining hours
 */
const remainingHours = (
  date: string,
  hours: number | string,
  minutes: number | string
) => {
  var now = new Date();
  let endDate = inputToDate(date);
  let offset = now.getTimezoneOffset();
  let diferentialoffsetmili = (offset + 60) * 60 * 1000;
  if (typeof hours === "string") hours = parseInt(hours);
  if (typeof minutes === "string") minutes = parseInt(minutes);
  endDate.setHours(hours);
  endDate.setMinutes(minutes);

  let endTime = endDate.getTime() / 1000; // ISO format
  var elapsed = (now.getTime() - diferentialoffsetmili) / 1000;
  var totalSec = endTime - elapsed;
  var h = Math.round(totalSec / 3600);
  // var m = (totalSec / 60) % 60;
  // var s = totalSec % 60;
  //   var result = h + " hours, " + m + " minutes " + s + " seconds";

  return h;
};
/** Checks if the date is in tha past week, returning the corresponding day
 * @param  {Date} d
 * @returns  {string}past week date, or the corresponding date
 */
const isDateInPastWeek = (d: Date) => {
  let last7Days = new Date();
  var todayDay = last7Days.getDate();
  last7Days.setDate(d.getDate() - 7);
  var weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // if the date is in the on the current week, then return the day of the week
  if (d > last7Days) {
    var currDay = d.getDate();
    if (currDay === todayDay) {
      return "Today";
    } else if (currDay === todayDay - 1) {
      return "Yesterday";
    } else {
      var currWeekDay = d.getDay();
      return weekdays[currWeekDay];
    }
  } else {
    var day = ("0" + d.getDate()).slice(-2);
    var month = ("0" + String(d.getMonth() + 1)).slice(-2);
    var year = d.getFullYear().toString();
    var date = day + "/" + month + "/" + year;
    return date;
  }
};

/** Object with multiple functions to calculate difference between dates, in
years, months, weeks and days
 * @param  {Date}d1 date 1
 * @param  {Date}d2 date 2
 * @returns {number} respctive difference
 */
const DateDiff = {
  inDays: function (d1: Date, d2: Date) {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt(Number((t2 - t1) / (24 * 3600 * 1000)).toFixed(20));
  },

  inWeeks: function (d1: Date, d2: Date) {
    var t2 = d2.getTime();
    var t1 = d1.getTime();

    return parseInt(Number((t2 - t1) / (24 * 3600 * 1000 * 7)).toFixed(20));
  },

  inMonths: function (d1: Date, d2: Date) {
    var d1Y = d1.getFullYear();
    var d2Y = d2.getFullYear();
    var d1M = d1.getMonth();
    var d2M = d2.getMonth();

    return parseInt(Number(d2M + 12 * d2Y - (d1M + 12 * d1Y)).toFixed(20));
  },

  inYears: function (d1: Date, d2: Date) {
    return parseInt(Number(d2.getFullYear() - d1.getFullYear()).toFixed(20));
  },
};

/** Returns a string indicanting the difference betewwn now and a previosu date
 * @param  {number} timestamp a date timestamp of the respective date to get
 * difference of
 * @returns {string} respective difference in a string form
 */
const dateDifference = (timestamp: number) => {
  var d1 = new Date();
  var d2 = new Date(timestamp);
  var inYears = Math.abs(DateDiff.inYears(d1, d2));
  var inMonths = Math.abs(DateDiff.inMonths(d1, d2));
  var inWeeks = Math.abs(DateDiff.inWeeks(d1, d2));
  var inDays = Math.abs(DateDiff.inDays(d1, d2));
  var hoursMinutes = `${("0" + d2.getHours()).slice(-2)}:${(
    "0" + d2.getMinutes()
  ).slice(-2)}`;

  if (inYears) {
    if (inYears > 1) {
      return inYears + " years ago";
    } else if (inYears === 1) {
      return inYears + " year ago";
    }
  }
  if (inMonths && inDays > 30) {
    if (inMonths > 1) {
      return inMonths + " months ago";
    } else if (inMonths === 1) {
      return inMonths + " month ago";
    }
  }
  if (inWeeks) {
    if (inWeeks > 1) {
      return inWeeks + " weeks ago";
    } else if (inWeeks === 1) {
      return inWeeks + " week ago";
    }
  }
  if (inDays) {
    if (inDays > 1) {
      return inDays + " days ago";
    } else if (inDays === 1) {
      return `Yesterday`;
    }
  } else {
    // today
    return hoursMinutes;
  }
};

/** Decodes a string to its original form
 * @param  {string} s encoded string
 */
const getDecodedString = (s: string) => {
  return decodeData(decodeData(decodeData(s)));
};

/** Encodes a string to for database and URL, URI compliant string
 * @param  {string} s encoded string
 */
const getEncodedString = (s: string) => {
  return encodeData(encodeData(s));
};

/** Encodes string to be URI complacement
 * @param  {string} s
 * @returns  {string} encoded string
 */
const encodeData = (s: string) => {
  return encodeURIComponent(s)
    .replace(/-/g, "%2D")
    .replace(/_/g, "%5F")
    .replace(/\./g, "%2E")
    .replace(/!/g, "%21")
    .replace(/~/g, "%7E")
    .replace(/\*/g, "%2A")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29");
};

/** Dncodes complacement URI string
 * @param  {string} s
 * @returns  {string} decoded string
 */
const decodeData = (s: string) => {
  try {
    return decodeURIComponent(
      s
        .replace(/%2D/g, "-")
        .replace(/%5F/g, "_")
        .replace(/%2E/g, ".")
        .replace(/%21/g, "!")
        .replace(/%7E/g, "~")
        .replace(/%2A/g, "*")
        .replace(/%27/g, "'")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
    );
  } catch (e) {
    // this happens when the string is tottally decoded, so we return the
    // original, for example. An original string containing "!" will throw an
    // error. And we now that "!" is the originally decoded string.

    return s;
  }
};

/** Sort users based on name
 * @param  {[string, PersonalInformation, boolean][]} sortableUsers array of
 * users to be sorted
 * @returns   {sortableUsers} sorted users
 */
const sortUsers = (sortableUsers: [string, PersonalInformation, boolean][]) => {
  if (sortableUsers) {
    sortableUsers.sort(
      (
        a: [string, PersonalInformation, boolean],
        b: [string, PersonalInformation, boolean]
      ) => {
        if (a[1].name && b[1].name) {
          // Concatenate strings for sorting
          const nameA = a[1].name.replaceAll(" ", "");
          const nameB = b[1].name.replaceAll(" ", "");
          if (nameA > nameB) return 1;
          if (nameA < nameB) return -1;
          return 0;
        }
        return 0;
      }
    );
  }
  return sortableUsers;
};
/** Puts the users list in the select object manner
 * @param  {[string, PersonalInformation, boolean][]} sortableUsers array of
 * users to be sorted
 * @returns   extended string eg: "inTeam" -> "In Team"
 */
const buildUserSelectOptions = (
  sortableUsers: [string, PersonalInformation, boolean][]
) => {
  let selectUserOptions: selectOption[] = [];
  sortableUsers.forEach((user) => {
    let userKey = user[0];
    let userInfo = user[1];
    let userLabel = `${userInfo.name}, ${userInfo.department}`;
    let userOption = {
      value: userKey,
      label: userLabel,
    };
    selectUserOptions.push(userOption);
  });
  return selectUserOptions;
};

/** Gets users to build the select assignment
 * @param  {Function} setUserOptions update user options state
 * @param  {Function} setUsersMetadata update users metadata state
 */
const getUserAssignmentOptions = (
  setUserOptions: Function,
  setUsersMetadata: Function
) => {
  get(ref(db, "private/usersMetadata")).then((snapshot) => {
    const allUsers = snapshot.val();
    setUsersMetadata(allUsers);

    let sortableUsers: [string, PersonalInformation, boolean][] = [];
    snapshot.forEach((user) => {
      if (user.key) {
        sortableUsers.push([
          user.key,
          user.val().pinfo,
          user.val().pinfo.inTeam,
        ]);
      }
    });
    let sortedUsers = sortUsers(sortableUsers);

    let options = buildUserSelectOptions(sortedUsers);
    setUserOptions(options);
  });
};

/** Sets users to build the select assignment
 * @param  {Function} setUserOptions update user options state
 * @param  {Function} setUsersMetadata update users metadata state
 */
const setUserAssignmentOptions = (
  setUserOptions: Function,
  usersMetadata: UserMetadata,
  department?: Department
) => {
  let sortableUsersStart: [string, PersonalInformation, boolean][] = [];
  let sortableUsersEnd: [string, PersonalInformation, boolean][] = [];
  Object.entries(usersMetadata).forEach(([userId, user]) => {
    let inTeam = user.pinfo.inTeam ? true : false;
    if (userId) {
      if (department) {
        if (user.pinfo.department === department.description) {
          sortableUsersStart.push([userId, user.pinfo, inTeam]);
        } else {
          sortableUsersEnd.push([userId, user.pinfo, inTeam]);
        }
      } else {
        sortableUsersStart.push([userId, user.pinfo, inTeam]);
      }
    }
    let sortedUsersStart = sortUsers(sortableUsersStart);
    let sortedUsersEnd = sortUsers(sortableUsersEnd);

    let sortedUsers = [...sortedUsersStart, ...sortedUsersEnd];

    let options = buildUserSelectOptions(sortedUsers);
    setUserOptions(options);
  });
};

/**
 * Retrieves user profile URL
 * @param userId
 * @returns user url
 */
const getUserProfileLink = (userId: string) => {
  return `/profile/u/${userId}`;
};

/**
 * Retrieve user image URL stored in server
 * @param userId
 * @param compressed
 * @returns
 */
const getUserImg = (userId: string, compressed = false) => {
  if (!compressed) return `/db/users/${userId}/img/${userId}.png`;
  else return `/db/users/${userId}/img/${userId}_comp.png`;
};

/**
 * Sends a notification to the specified user
 * @param sendTo user id
 * @param sentBy user id
 * @param title title of the notification
 * @param description description of the notification
 * @param urlPath url path
 * @param urlObject optional url object to open modals etc, like in tasks and budget
 * @param notifType type of the notification, to choose icon basically
 * @param color color of the notification
 */
const sendNotification = (
  sendTo: string,
  sentBy: string,
  title: string,
  description: string,
  urlPath: string,
  urlObject: UrlObject | null,
  notifType: string,
  color: string
) => {
  if (sendTo !== sentBy) {
    let notification: Notification = {
      sentBy: sentBy,
      title: title,
      description: description,
      urlPath: urlPath,
      urlObject: urlObject ? urlObject : null,
      type: notifType,
      color: color,
      timestamp: new Date().getTime(),
    };
    push(ref(db, `private/usersNotifications/${sendTo}/all`), notification);
    push(ref(db, `private/usersNotifications/${sendTo}/new`), notification);
  }
};

/**
 * Transforms "thisIsAString" to "This Is A String"
 * @param str
 * @returns
 */
const pascalStringToTitleCase = (str: string) => {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Checks if the object has childs or not
 * @param obj
 * @returns
 */
const objectExists = (obj: {}) => {
  return obj && Object.keys(obj).length !== 0 && obj.constructor === Object;
};

/**
 * Checks if user has permissions
 * @param user
 * @returns
 */
const userHasPermission = (user: userContext | null, matchUserId?: string) => {
  if (!user) return false;
  if (matchUserId && user.id === matchUserId) return true;
  if (
    user.position === "Team Leader" ||
    user.position === "Technical Director" ||
    user.position === "Head of Department" ||
    user.position === "God"
  ) {
    return true;
  }
  return false;
};

/**
 * Checks if user has admin permissions
 * @param user
 * @returns
 */
const userHasAdminPermissions = (user: userContext | null) => {
  if (!user) return false;
  if (
    user.position === "Team Leader" ||
    user.position === "Head of Department" ||
    user.position === "Technical Director" ||
    user.position === "God"
  )
    return true;
  return false;
};

/**
 * Defines wheter a user can view a feature or not
 * @param featureName
 * @param applicationFeatures
 * @param isAdminUser
 * @param isGod
 * @returns
 */
const isFeatureVisible = (
  featureName: string,
  applicationFeatures: ApplicationFeatures,
  isAdminUser: boolean,
  isGod: boolean
) => {
  if (applicationFeatures.hasOwnProperty(featureName)) {
    if (applicationFeatures[featureName].public) return true;
    else if ((applicationFeatures[featureName].admin && isAdminUser) || isGod)
      return true;
  }
  return false;
};

export {
  inputToDate,
  dateToString,
  numberWithCommas,
  getUserImgUrl,
  getAllUsersMetadata,
  getAndSetAllUsersMetadata,
  setColumnText,
  dateComparator,
  remainingHours,
  extendDate,
  getHoursFromTimestamp,
  getMinutesFromTimestamp,
  getMinutesInStringFromTimestamp,
  getHoursInStringFromTimestamp,
  swalMessage,
  toastrMessage,
  isDateInPastWeek,
  encodeData,
  decodeData,
  getUserAssignmentOptions,
  setUserAssignmentOptions,
  sortUsers,
  buildUserSelectOptions,
  getDecodedString,
  getEncodedString,
  dateDifference,
  normalizedString,
  getUserProfileLink,
  getUserImg,
  sendNotification,
  objectExists,
  userHasPermission,
  userHasAdminPermissions,
  dateWithHoursComparator,
  pascalStringToTitleCase,
  isFeatureVisible,
};
