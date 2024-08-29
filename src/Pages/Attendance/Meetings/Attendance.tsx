import { off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { EventDatabase, EventInformation, UsersDB } from "../../../interfaces";
import { remainingHours } from "../../../utils/generalFunctions";
import { allowedMeetingType, isCorrectType } from "../attendanceUtils";
import AttendanceSection from "./AttendanceSection";

const Attendance = () => {
  const { usersMetadata } = useAuth();

  const hourThreshold = 1;
  const [ongoingEvents, setOngoingEvents] = useState<[string, EventInformation][]>([]);
  const [usersDb, setUsersDb] = useState<UsersDB>({});

  useEffect(() => {
    // Retrieve current events

    onValue(ref(db, "private/events/current"), (snapshot) => {
      if (!snapshot.val()) return false;
      const events: EventDatabase = snapshot.val();
      const eventsToStore: [string, EventInformation][] = [];
      // store the current events in state
      Object.entries(events).forEach(([key, event]) => {
        // if it is between threshold
        const diff = remainingHours(event.date, event.hours, event.minutes);
        if (diff <= hourThreshold && diff >= -hourThreshold && isCorrectType(event.type)) {
          if (allowedMeetingType(event.type)) eventsToStore.push([key, event]);
        }
      });
      if (eventsToStore) setOngoingEvents(eventsToStore);
    });
    // Retrieve Users metadata
    setUsersDb(usersMetadata);
    return () => {
      off(ref(db, "private/events/current"));
    };
  }, [usersMetadata]);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        {/* Display only ongoing meetings and corresponding users */}
        {ongoingEvents.length > 0 ? (
          Object.keys(usersDb).length !== 0 &&
          ongoingEvents.map(([eventId, event], idx) => (
            <AttendanceSection key={uuid()} eventId={eventId} event={event} usersDb={usersDb} />
          ))
        ) : (
          <div>No ongoing events to display</div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
