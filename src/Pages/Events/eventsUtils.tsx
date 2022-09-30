import { EventResizeDoneArg } from "@fullcalendar/interaction";
import { EventClickArg, EventDropArg } from "@fullcalendar/react";
import {
  child,
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { db } from "../../config/firebase";
import {
  calendarEvent,
  Departments,
  DepartmentsWithDesc,
  EventColors,
  EventDatabase,
  EventInformation,
  userContext,
} from "../../interfaces";
import {
  dateToString,
  inputToDate,
  toastrMessage,
} from "../../utils/generalFunctions";
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
const date = `${day}-${month}-${year}`;

// Default event information
const defaultEventInfo: EventInformation = {
  createdBy: "",
  date: date,
  allDay: false,
  description: "",
  duration: "1h30",
  hours: "12",
  link: "",
  minutes: "00",
  title: "",
  type: "Other",
  weeks: 0,
};

// Auxiliary functions
const msToTime = (duration: number) => {
  let minutes = Math.round(Math.floor((duration / (1000 * 60)) % 60));
  let hours = Math.round(Math.floor((duration / (1000 * 60 * 60)) % 24));

  let shours = hours < 10 ? "0" + String(hours) : String(hours);
  let sminutes = minutes < 10 ? "0" + String(minutes) : String(minutes);

  return [shours, sminutes];
};

var meetingCalendarColors: { [key: string]: string } = {
  "General Meeting": `red`,
  "Electrical Systems Meeting": `gold`,
  "Management and Marketing Meeting": `#0ba360`,
  "Mechanical Systems Meeting": `#00D1BB`,
  "Design and Composites Meeting": `#0052D1`,
  "Hydrogen Fuel Cell Meeting": `#c471f5`,
  Other: `brown`,
  Competition: `red`,
  "Sponsor Meeting": `black`,
};

const defaultCalendarColors: { [key: string]: { color: string } } = {
  General: { color: `red` },
  Leaders: { color: `red` },
  Other: { color: `brown` },
  Competition: { color: `red` },
  Sponsor: { color: `black` },
};

const defaultTitlesAndColors: EventColors = {
  General: {
    description: "General Meeting",
    icon: "fa-globe-europe",
    gradientColor: "bg-night-fade",
  },
  Leaders: {
    description: "Leaders Meeting",
    icon: "fa-globe-europe",
    gradientColor: "bg-night-fade",
  },
  Other: {
    description: "Other",
    icon: "fa-globe-europe",
    gradientColor: "bg-night-fade",
  },
  Sponsor: {
    description: "Sponsor Meeting",
    icon: "fa-globe-europe",
    gradientColor: "bg-night-fade",
  },
  Competition: {
    description: "Competition Meeting",
    icon: "fa-globe-europe",
    gradientColor: "bg-night-fade",
  },
};

/**
 * Event titles and colors based on departments from database and default meetings
 * @param departmentsWDesc
 * @returns
 */
const getEventTitlesAndColors = (
  departmentsWDesc: DepartmentsWithDesc
): EventColors => {
  return { ...departmentsWDesc, ...defaultTitlesAndColors };
};
/**
 * Retrieves calendar colors based on default events and departments from database
 * @param departmentsWDesc
 * @returns
 */
const getCalendarColors = (departmentsWDesc: DepartmentsWithDesc) => {
  return { ...departmentsWDesc, ...defaultCalendarColors };
};

const departmentFilter: { [name: string]: string[] } = {
  ALL: ["ALL"],
  DC: ["Design and Composites Meeting", "General Meeting"],
  ES: ["Electrical Systems Meeting", "General Meeting"],
  HP: ["Hydrogen Fuel Cell Meeting", "General Meeting"],
  MM: ["Management and Marketing Meeting", "General Meeting"],
  MS: ["Mechanical Systems Meeting", "General Meeting"],
};

const departmentFilterList = ["ALL", "DC", "ES", "HP", "MM", "MS"];

const eventOptions: {
  value:
    | "General Meeting"
    | "Leaders Meeting"
    | "Electrical Systems Meeting"
    | "Mechanical Systems Meeting"
    | "Design and Composites Meeting"
    | "Management and Marketing Meeting"
    | "Hydrogen Fuel Cell Meeting"
    | "Sponsor Meeting"
    | "Competition"
    | "Other";
  label:
    | "General Meeting"
    | "Leaders Meeting"
    | "Electrical Systems Meeting"
    | "Mechanical Systems Meeting"
    | "Design and Composites Meeting"
    | "Management and Marketing Meeting"
    | "Hydrogen Fuel Cell Meeting"
    | "Sponsor Meeting"
    | "Competition"
    | "Other";
}[] = [
  {
    value: "General Meeting",
    label: "General Meeting",
  },
  {
    value: "Leaders Meeting",
    label: "Leaders Meeting",
  },
  {
    value: "Electrical Systems Meeting",
    label: "Electrical Systems Meeting",
  },
  {
    value: "Mechanical Systems Meeting",
    label: "Mechanical Systems Meeting",
  },
  {
    value: "Design and Composites Meeting",
    label: "Design and Composites Meeting",
  },
  {
    value: "Management and Marketing Meeting",
    label: "Management and Marketing Meeting",
  },
  {
    value: "Hydrogen Fuel Cell Meeting",
    label: "Hydrogen Fuel Cell Meeting",
  },
  {
    value: "Sponsor Meeting",
    label: "Sponsor Meeting",
  },
  {
    value: "Competition",
    label: "Competition",
  },
  {
    value: "Other",
    label: "Other",
  },
];

const defaultEventTypes = [
  {
    value: "General Meeting",
    label: "General Meeting",
  },
  {
    value: "Leaders Meeting",
    label: "Leaders Meeting",
  },
  {
    value: "Sponsor Meeting",
    label: "Sponsor Meeting",
  },
  {
    value: "Competition",
    label: "Competition",
  },
  {
    value: "Other",
    label: "Other",
  },
];

// Calendar configuration variables
const headerToolbar = {
  left: "prev,next today",
  center: "title",
  right: "timeGridDay,timeGridWeek,dayGridMonth",
};
const calendarViews = {
  timeGridWeek: {
    slotLabelFormat: [
      { hour: "numeric", minute: "numeric", hour12: false }, // lower level of text
    ],
    scrollTime: "12:00:00",
    eventDurationEditable: true,
    slotMinutes: "01:00:00",
    eventDragMinDistance: 10,
    // slotDuration: "01:00:00",
  },
  timeGridDay: {
    slotLabelFormat: [
      { hour: "numeric", minute: "numeric", hour12: false }, // lower level of text
    ],
    scrollTime: "12:00:00",
    eventDurationEditable: true,
  },
  dayGridMonth: {
    eventStartEditable: true,
    eventDurationEditable: false,
    eventBorderColor: "none",
  },
};

const eventTimeFormat = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

// Select Input Theme
const selectStyles = (theme: any, isDisabled: boolean) => {
  return {
    ...theme,
    borderRadius: "0.2rem",
    colors: {
      ...theme.colors,
      neutral5: isDisabled && "#e9ecef", //I'm changing the predefined variable of the disabled color
      neutral40: "#495057",
      neutral10: "#ced4da",
    },
  };
};

/**
 * Check if any of the current events it's passed due. Update periodic ones and
 * remove old ones
 */
const checkEventPeriodicity = () => {
  let hoursOffset = 2;
  // Loop through all events
  get(ref(db, "private/events/current")).then((snapshot) => {
    // Collection of nodes from the tree
    const allEvents: EventDatabase = snapshot.val();
    if (!allEvents) return;

    // Get the objects in a new list
    Object.entries(allEvents).forEach(([eventId, event]) => {
      // Current Event Date
      var toChange = inputToDate(event.date);
      toChange.setHours(parseInt(event.hours));
      toChange.setMinutes(parseInt(event.minutes));

      // Only change event if it passes 2 hours from start, allows for late
      // arrivals at meetings
      var today = new Date();
      var todaysHours = today.getHours();
      today.setHours(todaysHours - hoursOffset);

      try {
        if (event.weeks && today.getTime() > toChange.getTime()) {
          // change the date, add more days if periodic
          toChange.setDate(toChange.getDate() + event.weeks * 7);
          var newDate = dateToString(toChange);

          // Send the event to history
          set(child(ref(db, "private/events/history"), eventId), event);
          // Remove the old event from "current events" (which was added to history)
          remove(child(ref(db, "private/events/current"), eventId));
          // Update the new event with the new date (based on peridiocity)
          let newEvent = { ...event, date: newDate };
          // Create new event in current events
          push(ref(db, "private/events/current/"), newEvent);
        } else if (today.getTime() > toChange.getTime() && !event.weeks) {
          // move event if it's not periodic
          remove(child(ref(db, "private/events/current"), eventId));
          set(child(ref(db, "private/events/history"), eventId), event);
        }
      } catch (error) {}
    });
  });
};

/**
 * Sort events by date
 * @param eventsToSort
 * @returns
 */
const sortEvents = (eventsToSort: [string, EventInformation][]) => {
  return eventsToSort.sort((a, b) => {
    const eventA = a[1];
    const eventB = b[1];
    let dateA = inputToDate(eventA.date);
    dateA.setHours(parseInt(eventA.hours));
    dateA.setMinutes(parseInt(eventA.minutes));

    let dateB = inputToDate(eventB.date);
    dateB.setHours(parseInt(eventB.hours));
    dateB.setMinutes(parseInt(eventB.minutes));
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  });
};

/**
 * Creates an array of full calendar events object
 * @param sortedEvents
 * @returns
 */
const getEventsInFullCalendarType = (
  sortedEvents: [string, EventInformation][],
  departmentsWDesc: DepartmentsWithDesc
) => {
  const calendarEventsArray: calendarEvent[] = [];
  const calendarColors = getCalendarColors(departmentsWDesc);
  sortedEvents.forEach(([eventId, event]) => {
    let currMeeting = event.type.replace(" Meeting", "");
    // Start date
    let newD = inputToDate(event.date);
    let day = ("0" + newD.getDate()).slice(-2);
    let month = ("0" + String(newD.getMonth() + 1)).slice(-2);
    let year = newD.getFullYear().toString();
    let date = `${year}-${month}-${day}`;
    // Repetition rules
    let eventCount = 1;
    let eventInterval = event.weeks;
    if (event.weeks > 0 && !event.isHistory) eventCount = 100; // replicate the event
    if (event.weeks === 0) eventInterval = 1; // replicate the event
    let calendarColor = calendarColors[currMeeting].color;

    // periodic definition and start time
    const periodicRule = {
      freq: "weekly",
      dtstart: `${date} ${event.hours}:${event.minutes}:00`,
      interval: eventInterval,
      count: eventCount,
    };

    // Full calendar Object
    let calendarEvent = {
      id: `${eventId}-fullcalendar`,
      title: event.title,
      allDay: event.allDay,
      duration: event.allDay ? "0" : `${event.duration.replace("h", ":")}`,
      color: calendarColor,
      rrule: periodicRule,
    };
    calendarEventsArray.push(calendarEvent);
  });
  return calendarEventsArray;
};

/**
 * Adds an history marker to each event of the history
 * @param events events from the database
 * @returns
 */
const addHistoryKeyToEachEvent = (events: EventDatabase) => {
  let historyEvents = {};
  Object.entries(events).forEach(([eventId, event]) => {
    historyEvents = {
      ...historyEvents,
      [eventId]: { ...event, isHistory: true },
    };
  });
  return historyEvents;
};
/**
 * Gets the events from history to show in the calendar as well
 * @param setEventsDatabase
 * @param setCalendarEvents
 */
const getAndSetHistoryEvents = (
  setEventsDatabase: Function,
  setCalendarEvents: Function,
  departmentsWDesc: DepartmentsWithDesc
) => {
  onValue(ref(db, "private/events/history"), (snapshot) => {
    if (!snapshot.val()) return false;
    const events: EventDatabase = snapshot.val();
    const historyEvents = addHistoryKeyToEachEvent(events);
    // store the sorted events in state
    setEventsDatabase((currEvents: EventDatabase) => ({
      ...currEvents,
      ...historyEvents,
    }));
    // Sort events by date
    let eventsList: [string, EventInformation][] =
      Object.entries(historyEvents);
    // Add an history marker to the history events
    eventsList = eventsList.map(([eventId, event]) => [
      eventId,
      { ...event, isHistory: true },
    ]);
    let sortedEvents = sortEvents(eventsList);

    // Create the Event objects for the calendar
    // https://fullcalendar.io/docs/event-object
    let calendarEvents = getEventsInFullCalendarType(
      sortedEvents,
      departmentsWDesc
    );

    setCalendarEvents((fcEvents: calendarEvent[]) => [
      ...fcEvents,
      ...calendarEvents,
    ]);
  });
};

const getAndSetEvents = (
  setEventsDatabase: Function,
  setEventsSorted: Function,
  setCalendarEvents: Function,
  departmentsWDesc: DepartmentsWithDesc
) => {
  onValue(ref(db, "private/events"), (snapshot) => {
    if (!snapshot.val()) return false;
    const events = snapshot.val();
    let currEvents = {};
    let historyEvents = {};
    // Get current events
    try {
      currEvents = events["current"];
    } catch (error) {
      currEvents = {};
    }
    // Get history events
    try {
      historyEvents = events["history"];
    } catch (error) {
      historyEvents = {};
    }

    // Process current events
    // events in database
    setEventsDatabase({ ...currEvents, ...historyEvents });

    // Sort events by date
    let eventsList: [string, EventInformation][] = [];
    try {
      eventsList = Object.entries(currEvents);
    } catch (error) {
      eventsList = [];
    }
    let sortedEvents = sortEvents(eventsList);
    // Save in state
    setEventsSorted(sortedEvents);

    // Create the Event objects for the calendar
    // https://fullcalendar.io/docs/event-object
    let calendarEvents = getEventsInFullCalendarType(
      sortedEvents,
      departmentsWDesc
    );
    setCalendarEvents(calendarEvents);

    // Process history events
    const historyWithKeyEvents = addHistoryKeyToEachEvent(historyEvents);
    // store the sorted events in state
    setEventsDatabase((currEvents: EventDatabase) => ({
      ...currEvents,
      ...historyWithKeyEvents,
    }));

    let historyList: [string, EventInformation][] = [];
    try {
      historyList = Object.entries(historyWithKeyEvents);
    } catch (error) {
      historyList = [];
    }

    let sortedHistory = sortEvents(historyList);

    // Create the Event objects for the calendar
    // https://fullcalendar.io/docs/event-object
    let calendarHistory = getEventsInFullCalendarType(
      sortedHistory,
      departmentsWDesc
    );

    setCalendarEvents([...calendarEvents, ...calendarHistory]);
  });
};

/**
 * Displays the event information in the modal
 * @param eventInfo
 * @param eventsDatabase
 * @param setModalTitle
 * @param setCurrEventInfo
 * @param setIsModalOpen
 * @param setCurrEventKey
 * @param setShowDeleteEvent
 */
const calendarEventClickHandler = (
  eventInfo: EventClickArg,
  eventsDatabase: EventDatabase,
  setModalTitle: Function,
  setCurrEventInfo: Function,
  setIsModalOpen: Function,
  setCurrEventKey: Function,
  setShowDeleteEvent: Function
) => {
  // get the event that was clicked
  const eventId = eventInfo.event.id.replace("-fullcalendar", "");
  const event = eventsDatabase[eventId];
  // open the modal with the event information, save the event key ID
  setModalTitle("Edit Event");
  setCurrEventInfo(event);
  setIsModalOpen(true);
  setCurrEventKey(eventId);
  setShowDeleteEvent(true);
};

/**
 * filters events based on current selection
 * @param currentFilter
 * @param eventList
 * @param eventsDatabase
 */
const filteredEvents = (
  currentFilter: string,
  eventList: calendarEvent[],
  eventsDatabase: EventDatabase
) => {
  if (currentFilter === "ALL") {
    return eventList;
  }
  return eventList.filter((event) =>
    departmentFilter[currentFilter].includes(
      eventsDatabase[event.id.replace("-fullcalendar", "")].type
    )
  );
};

/**
 * Changes the event duration on event resizing
 * @param eventInfo
 */
const calendarEventResizeHandler = (
  eventInfoFC: EventResizeDoneArg,
  eventsDatabase: EventDatabase
) => {
  if (!eventInfoFC.oldEvent._def.recurringDef) return;
  if (!eventInfoFC.oldEvent._def.recurringDef.duration) return;
  // Update duration of the event
  // Get the event that was resized
  const eventId = eventInfoFC.event.id.replace("-fullcalendar", "");
  // Get the new time delta
  const milliDelta = eventInfoFC.endDelta.milliseconds;
  const oldDuration =
    eventInfoFC.oldEvent._def.recurringDef.duration.milliseconds;
  const [newHours, newMinutes] = msToTime(oldDuration + milliDelta);

  // Get event from the database, to check if it's history or not
  let dbEvent = eventsDatabase[eventId];
  if (!dbEvent.isHistory) {
    // Update the duration in the database
    update(child(ref(db, "private/events/current"), eventId), {
      duration: `${newHours}h${newMinutes}`,
    });
  } else {
    update(child(ref(db, "private/events/history"), eventId), {
      duration: `${newHours}h${newMinutes}`,
    });
  }
};

/**
 * Update date of the event on dragging
 * @param eventInfo
 * @returns
 */
const calendarEventDragHandler = (
  eventInfo: EventDropArg,
  eventsDatabase: EventDatabase
) => {
  // info.event.id, info.event.start, info;
  // Update the start time/date of the event
  const newDate = eventInfo.event.start;
  if (!newDate) return;

  // Get the event that was resized
  const eventId = eventInfo.event.id.replace("-fullcalendar", "");
  // Get the new time delta
  const hours = ("0" + String(newDate.getHours())).slice(-2);
  const minutes = ("0" + String(newDate.getMinutes())).slice(-2);
  const date = dateToString(newDate);

  // Get event from the database, to check if it's history or not
  let dbEvent = eventsDatabase[eventId];
  let updatedEvent = {
    ...dbEvent,
    date: date,
    hours: hours,
    minutes: minutes,
  };
  const today = new Date();
  // if we are moving a "current" event
  if (!dbEvent.isHistory) {
    // check if the event was moved to the past
    if (newDate < today) {
      // add history marker
      updatedEvent = { ...updatedEvent, isHistory: true };
      // if true, remove the event from current, and move it to history
      remove(ref(db, `private/events/current/${eventId}`));
      set(ref(db, `private/events/history/${eventId}`), updatedEvent);
    } else {
      updatedEvent = { ...updatedEvent, isHistory: false };
      // Update the duration in the database
      update(ref(db, `private/events/current/${eventId}`), updatedEvent);
    }
  } else {
    // if we are moving a "history" event
    // check if the event was moved to the future
    if (newDate > today) {
      updatedEvent = { ...updatedEvent, isHistory: false };
      // if true, remove the event from history, and move it to current
      remove(ref(db, `private/events/history/${eventId}`));
      set(ref(db, `private/events/current/${eventId}`), updatedEvent);
    } else {
      updatedEvent = { ...updatedEvent, isHistory: true };
      // Update the duration in the database
      update(ref(db, `private/events/history/${eventId}`), updatedEvent);
    }
  }

  toastrMessage("The event was successfully updated", "info");
};

/**
 * Opens the event modal with clear event information, ready to edit
 * @param setModalTitle
 * @param setCurrEventInfo
 * @param setIsModalOpen
 * @param setCurrEventKey
 * @param setShowDeleteEvent
 */
const openClearModal = (
  setModalTitle: Function,
  setCurrEventInfo: Function,
  setIsModalOpen: Function,
  setCurrEventKey: Function,
  setShowDeleteEvent: Function,
  setDisabledInput: Function
) => {
  setModalTitle("Add Event");
  toggleDisabledInputs(false, setDisabledInput);
  setCurrEventInfo(defaultEventInfo);
  setIsModalOpen(true);
  setCurrEventKey("");
  setShowDeleteEvent(false);
};

/**
 * Switch filter applied
 * @param seteventFilter
 * @param eventFilter
 */

const switchFilter = (seteventFilter: Function, eventFilter: string) => {
  seteventFilter(
    departmentFilterList[
      (departmentFilterList.indexOf(eventFilter) + 1) %
        departmentFilterList.length
    ]
  );
};

/**
 * Closes the modal
 * @param setCurrEventInfo
 * @param setIsModalOpen
 * @param setCurrEventKey
 * @param setShowDeleteEvent
 */
const closeModal = (
  setCurrEventInfo: Function,
  setIsModalOpen: Function,
  setCurrEventKey: Function,
  setShowDeleteEvent: Function
) => {
  setIsModalOpen(false);
  setCurrEventInfo(defaultEventInfo);
  setCurrEventKey("");
  setShowDeleteEvent(false);
};
/**Toggles the modal inputs
 *
 * @param isDisabled
 */
const toggleDisabledInputs = (
  isDisabled: boolean,
  setDisabledInput: Function
) => {
  setDisabledInput(isDisabled);
};

/**
 * Saves the event information in DB
 * @param user
 * @param currEventKey
 * @param currEventInfo
 * @param setIsModalOpen
 * @param setCurrEventInfo
 * @param setCurrEventKey
 * @returns null if no user
 */
const saveEvent = (
  user: userContext | null,
  currEventKey: string,
  currEventInfo: EventInformation,
  setIsModalOpen: Function,
  setCurrEventInfo: Function,
  setCurrEventKey: Function
) => {
  if (!user) return;
  // update the event in the database
  if (currEventKey) {
    if (isEventInPast(currEventInfo)) {
      let historyEvent: EventInformation = {
        ...currEventInfo,
        isHistory: true,
      };
      update(ref(db, `private/events/history/${currEventKey}`), historyEvent);
    } else {
      update(ref(db, `private/events/current/${currEventKey}`), currEventInfo);
    }

    toastrMessage("You successfully updated the event", "info");
  } else {
    // If we are creating a new event
    currEventInfo.createdBy = user.id;
    if (isEventInPast(currEventInfo)) {
      let historyEvent: EventInformation = {
        ...currEventInfo,
        isHistory: true,
      };
      push(ref(db, `private/events/history`), historyEvent);
    } else {
      currEventInfo = { ...currEventInfo, isHistory: false };
      push(ref(db, `private/events/current`), currEventInfo);
    }

    toastrMessage("You created a brand new event", "success");
  }

  setIsModalOpen(false);
  setCurrEventInfo(defaultEventInfo);
  setCurrEventKey("");
};

/**
 * Check if the event is currently in the past
 * @param event
 * @returns
 */
const isEventInPast = (event: EventInformation) => {
  let hoursOffset = 2;
  // Current Event Date
  var toChange = inputToDate(event.date);
  toChange.setHours(parseInt(event.hours));
  toChange.setMinutes(parseInt(event.minutes));

  // Only change event if it passes 2 hours from start, allows for late
  // arrivals at meetings
  var today = new Date();
  var todaysHours = today.getHours();
  today.setHours(todaysHours - hoursOffset);

  try {
    if (event.weeks && today.getTime() > toChange.getTime()) {
      return true;
    } else {
      return false;
    }
  } catch {
    return false;
  }
};

/**
 * Deletes event from the database
 * @param currEventKey
 * @param setIsModalOpen
 */
const deleteEvent = (
  event: EventInformation,
  currEventKey: string,
  setIsModalOpen: Function
) => {
  if (event.isHistory) {
    remove(ref(db, `private/events/history/${currEventKey}`));
  } else {
    remove(ref(db, `private/events/current/${currEventKey}`));
  }
  setIsModalOpen(false);
  toastrMessage("The event is gone now!", "success");
};

/**
 * Modal input state handler
 * @param e
 * @param key
 * @param currEventInfo
 * @param setCurrEventInfo
 */
const inputHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  key: string,
  currEventInfo: EventInformation,
  setCurrEventInfo: Function
) => {
  const value = e.target.value;
  setCurrEventInfo({ ...currEventInfo, [key]: value });
};

/**
 * Modal select state handler
 * @param option
 * @param key
 * @param currEventInfo
 * @param setCurrEventInfo
 */
const selectHandler = (
  option: any,
  key: string,
  currEventInfo: EventInformation,
  setCurrEventInfo: Function
) => {
  setCurrEventInfo({ ...currEventInfo, [key]: option.value });
};

/**
 * Modal counter state handler
 * @param value
 * @param key
 * @param currEventInfo
 * @param setCurrEventInfo
 * @returns
 */
const counterHandler = (
  value: number,
  key: string,
  currEventInfo: EventInformation,
  setCurrEventInfo: Function
) => {
  if (value < 0) {
    return false;
  }
  setCurrEventInfo({ ...currEventInfo, [key]: value });
};
/**
 * Modal date state handler
 * @param date
 * @param key
 * @param currEventInfo
 * @param setCurrEventInfo
 */
const dateHandler = (
  date: Date,
  key: string,
  currEventInfo: EventInformation,
  setCurrEventInfo: Function
) => {
  // saves the date as a portuguese format string
  let dateString = dateToString(date);
  setCurrEventInfo({ ...currEventInfo, [key]: dateString });
};
/**
 * Modal time state handler
 * @param value
 * @param currEventInfo
 * @param setCurrEventInfo
 */
const timeHandler = (
  value: string,
  currEventInfo: EventInformation,
  setCurrEventInfo: Function
) => {
  const [hours, minutes] = value.split(":");
  setCurrEventInfo({ ...currEventInfo, hours: hours, minutes: minutes });
};
/**
 * Modal duration state handler
 * @param value
 * @param currEventInfo
 * @param setCurrEventInfo
 */
const durationHandler = (
  value: string,
  currEventInfo: EventInformation,
  setCurrEventInfo: Function
) => {
  const duration = value.replace(":", "h");
  setCurrEventInfo({ ...currEventInfo, duration: duration });
};

/**
 * Opens modal with event information when an event is clicked from the list
 * @param eventId
 * @param eventsDatabase
 * @param setModalTitle
 * @param setCurrEventInfo
 * @param setIsModalOpen
 * @param setCurrEventKey
 * @param setShowDeleteEvent
 */
const eventListClickHandler = (
  eventId: string,
  eventsDatabase: EventDatabase,
  setModalTitle: Function,
  setCurrEventInfo: Function,
  setIsModalOpen: Function,
  setCurrEventKey: Function,
  setShowDeleteEvent: Function
) => {
  // get the event that was clicked
  const event = eventsDatabase[eventId];
  // open the modal with the event information, save the event key ID
  setModalTitle("Edit Event");
  setCurrEventInfo(event);
  setIsModalOpen(true);
  setCurrEventKey(eventId);
  setShowDeleteEvent(true);
};
/**
 * Deletes the event when action is performed on the list
 * @param eventId
 */
const eventListDeleteHandler = (eventId: string) => {
  remove(ref(db, `private/events/current/${eventId}`));
  toastrMessage("The event is gone now!", "success");
};

/**
 * Auxiliary function to retrieve hours and minutes from input
 * @param hours
 * @param minutes
 * @returns
 */
const timeForTimePicker = (hours: string, minutes: string) => {
  return `${hours}:${minutes}`;
};

/**
 * Replaces the hour marker in the middle
 * @param duration
 * @returns
 */
const durationForTimePicker = (duration: string) => {
  return duration.replace("h", ":");
};

/**
 * Retrieves possible event options type based on the departments on the database
 * @param departments
 */
const getEventTypeOptions = (departments: Departments) => {
  let eventTypes = Object.entries(departments).map(([acronym, department]) => ({
    value: department.description + " Meeting",
    label: department.description + " Meeting",
  }));
  // Add default event types to the array
  return [...eventTypes, ...defaultEventTypes];
};

export {
  headerToolbar,
  calendarViews,
  eventTimeFormat,
  defaultEventInfo,
  eventOptions,
  departmentFilterList,
  departmentFilter,
  selectStyles,
  meetingCalendarColors,
  msToTime,
  checkEventPeriodicity,
  getAndSetEvents,
  calendarEventClickHandler,
  filteredEvents,
  calendarEventResizeHandler,
  calendarEventDragHandler,
  openClearModal,
  switchFilter,
  closeModal,
  saveEvent,
  deleteEvent,
  inputHandler,
  timeHandler,
  dateHandler,
  counterHandler,
  selectHandler,
  durationHandler,
  eventListDeleteHandler,
  eventListClickHandler,
  toggleDisabledInputs,
  getAndSetHistoryEvents,
  getEventTypeOptions,
  timeForTimePicker,
  durationForTimePicker,
  getEventTitlesAndColors,
};
