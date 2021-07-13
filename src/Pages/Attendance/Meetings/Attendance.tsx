import { useEffect, useState } from "react";
import { EventDatabase, EventInformation, UsersDB } from "../../../interfaces";
import { v4 as uuid } from "uuid";
import { db } from "../../../config/firebase";
import { remainingHours } from "../../../utils/generalFunctions";
import { allowedMeetingType, isCorrectType } from "../attendanceUtils";
import AttendanceSection from "./AttendanceSection";

const Attendance = () => {
  // const [activeTab, setActiveTab] = useState("1");
  const hourThreshold = 1;
  const [ongoingEvents, setOngoingEvents] = useState<
    [string, EventInformation][]
  >([]);
  const [usersDb, setUsersDb] = useState<UsersDB>({});

  useEffect(() => {
    // Retrieve current events
    // console.log("rendering tab");

    db.ref("private/events/current").on("value", (snapshot) => {
      if (!snapshot.val()) return false;
      const events: EventDatabase = snapshot.val();
      // // console.log("Events to store", events);
      const eventsToStore: [string, EventInformation][] = [];
      // store the current events in state
      Object.entries(events).forEach(([key, event]) => {
        // if it is between threshold
        let diff = remainingHours(event.date, event.hours, event.minutes);
        if (
          diff <= hourThreshold &&
          diff >= -hourThreshold &&
          isCorrectType(event.type)
        ) {
          if (allowedMeetingType(event.type)) eventsToStore.push([key, event]);
        }
      });
      if (eventsToStore) setOngoingEvents(eventsToStore);
    });
    // Retrieve Users metadata
    db.ref(`private/users`)
      .once("value")
      .then((snapshot) => {
        let retrievedUsers = snapshot.val();
        if (retrievedUsers) setUsersDb(retrievedUsers);
      });
    return () => {
      db.ref("private/events/current").off("value");
      db.ref(`private/users`).off("value");
      // console.log("unmounting");
    };
  }, []);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {/* Display only ongoing meetings and corresponding users */}
        {ongoingEvents.length > 0 ? (
          Object.keys(usersDb).length !== 0 &&
          ongoingEvents.map(([eventId, event], idx) => (
            <AttendanceSection
              key={uuid()}
              eventId={eventId}
              event={event}
              usersDb={usersDb}
            />
          ))
        ) : (
          <div>No ongoing events to display</div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
