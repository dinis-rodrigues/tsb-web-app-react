import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
// Calendar Plugins
import FullCalendar from "@fullcalendar/react";
import rrule from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

import { off, ref } from "firebase/database";
import { EventDatabase, EventInformation, calendarEvent } from "../../interfaces";
import EventListItem from "./EventListItem";
// Import event modal, interfaces and eventListItem
import EventModal from "./EventModal";
// Calendar setup variables and functions
import {
  calendarEventClickHandler,
  calendarEventDragHandler,
  calendarEventResizeHandler,
  checkEventPeriodicity,
  closeModal,
  defaultEventInfo,
  deleteEvent,
  eventListClickHandler,
  eventListDeleteHandler,
  filteredEvents,
  getAndSetEvents,
  openClearModal,
  saveEvent,
  switchFilter,
} from "./eventsUtils";

const Events = () => {
  const { USER, departmentsWDesc } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // open or close the modal
  const [modalTitle, setModalTitle] = useState<string>("Add Event"); // modal title lol
  const [eventFilter, setEventFilter] = useState<string>("ALL");
  const [disabledInput, setDisabledInput] = useState<boolean>(false); // not in use
  const [showDeleteEvent, setShowDeleteEvent] = useState<boolean>(false); // show delete button
  // Event Related States
  const [eventsDatabase, setEventsDatabase] = useState<EventDatabase>({}); // straight from the database
  const [eventsSorted, setEventsSorted] = useState<[string, EventInformation][]>([]); // sorted events, for the final list
  const [currEventKey, setCurrEventKey] = useState<string>("");
  const [currEventInfo, setCurrEventInfo] = useState<EventInformation>(defaultEventInfo);
  const [calendarEvents, setCalendarEvents] = useState<calendarEvent[]>([]);

  useEffect(() => {
    setIsModalOpen(false);
    getAndSetEvents(setEventsDatabase, setEventsSorted, setCalendarEvents, departmentsWDesc);
    // getAndSetHistoryEvents(setEventsDatabase, setCalendarEvents);
    checkEventPeriodicity();

    return () => {
      off(ref(db, "private/events"));
    };
  }, [departmentsWDesc]);
  return (
    <>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="main-card mb-3 card">
            <div className="card-body">
              {/* Calendar configuration */}
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, rrule, interactionPlugin]}
                editable={true}
                events={filteredEvents(eventFilter, calendarEvents, eventsDatabase)}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "filter addEvent timeGridDay,timeGridWeek,dayGridMonth",
                }}
                views={{
                  timeGridWeek: {
                    slotLabelFormat: [
                      { hour: "numeric", minute: "numeric", hour12: false }, // lower level of text
                    ],
                    scrollTime: "12:00:00",
                    eventDurationEditable: true,
                    eventDragMinDistance: 10,
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
                }}
                aspectRatio={2}
                snapDuration={"01:00:00"}
                fixedWeekCount={false}
                eventDisplay={"block"}
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                customButtons={{
                  // Style of this button is in base.css
                  addEvent: {
                    text: "Add Event",
                    click: () =>
                      openClearModal(
                        setModalTitle,
                        setCurrEventInfo,
                        setIsModalOpen,
                        setCurrEventKey,
                        setShowDeleteEvent,
                        setDisabledInput,
                      ),
                  },
                  filter: {
                    text: eventFilter,
                    click: () => switchFilter(setEventFilter, eventFilter),
                  },
                }}
                eventClick={(eventInfoFC) =>
                  calendarEventClickHandler(
                    eventInfoFC,
                    eventsDatabase,
                    setModalTitle,
                    setCurrEventInfo,
                    setIsModalOpen,
                    setCurrEventKey,
                    setShowDeleteEvent,
                  )
                }
                eventResize={(eventInfoFC) =>
                  calendarEventResizeHandler(eventInfoFC, eventsDatabase)
                }
                eventDrop={(eventInfoFC) => calendarEventDragHandler(eventInfoFC, eventsDatabase)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="main-card mb-3 card">
                <ul id="eventList" className="list-group list-group-flush">
                  {eventsSorted.length > 0 &&
                    eventsSorted.map(([eventId, event]) => {
                      return (
                        <EventListItem
                          eventId={eventId}
                          eventTitle={event.title}
                          eventDate={event.date}
                          eventHours={event.hours}
                          eventMinutes={event.minutes}
                          eventLink={event.link}
                          eventDescription={event.description}
                          eventPeriodic={event.weeks}
                          eventType={event.type}
                          eventListClickHandler={() =>
                            eventListClickHandler(
                              eventId,
                              eventsDatabase,
                              setModalTitle,
                              setCurrEventInfo,
                              setIsModalOpen,
                              setCurrEventKey,
                              setShowDeleteEvent,
                            )
                          }
                          eventListDeleteHandler={() => eventListDeleteHandler(eventId)}
                          key={eventId}
                        ></EventListItem>
                      );
                    })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Event Modal */}
        <EventModal
          isModalOpen={isModalOpen}
          modalTitle={modalTitle}
          closeModal={() =>
            closeModal(setCurrEventInfo, setIsModalOpen, setCurrEventKey, setShowDeleteEvent)
          }
          saveEvent={() =>
            saveEvent(
              USER,
              currEventKey,
              currEventInfo,
              setIsModalOpen,
              setCurrEventInfo,
              setCurrEventKey,
            )
          }
          deleteEvent={() => deleteEvent(currEventInfo, currEventKey, setIsModalOpen)}
          currEventInfo={currEventInfo}
          showDeleteEvent={showDeleteEvent}
          disabledInput={disabledInput}
          setCurrEventInfo={setCurrEventInfo}
        />
      </div>
    </>
  );
};

export default Events;
