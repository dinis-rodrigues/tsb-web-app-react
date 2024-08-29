import { useAuth } from "../../contexts/AuthContext";
import { EventColors } from "../../interfaces";
import { extendDate } from "../../utils/generalFunctions";
import { getEventTitlesAndColors } from "./eventsUtils";

type Props = {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventHours: string;
  eventMinutes: string;
  eventLink: string;
  eventDescription: string;
  eventPeriodic: number;
  eventType: string;

  eventListClickHandler: Function;
  eventListDeleteHandler: Function;
};

const EventListItem = ({
  eventId,
  eventTitle,
  eventDate,
  eventHours,
  eventMinutes,
  eventLink,
  eventDescription,
  eventPeriodic,
  eventType,
  eventListClickHandler,
  eventListDeleteHandler,
}: Props) => {
  const { departmentsWDesc } = useAuth();
  const currMeeting = eventType.replace(" Meeting", "");

  const eventTitleIconColor: EventColors = getEventTitlesAndColors(departmentsWDesc);
  const eventColorGradient = eventTitleIconColor[currMeeting].gradientColor;
  return (
    <>
      <li className="list-group-item">
        <div className="widget-content p-0">
          <div className="widget-content-wrapper">
            <div className="widget-content-left mr-3">
              <span
                className="td-n p-20 peers fxw-nw mR-20 peer-greed c-grey-900"
                onClick={() => eventListClickHandler()}
              >
                <span className="icon-wrapper icon-wrapper-alt ">
                  <i className={`fa fa-calendar icon-gradient ${eventColorGradient}`}> </i>
                </span>
              </span>
            </div>
            <span
              className="td-n p-20 peers fxw-nw mR-20 peer-greed c-grey-900"
              onClick={() => eventListClickHandler()}
            >
              <div className="widget-content-left">
                <div className="widget-heading">
                  {eventTitle}
                  <span className="widget-subheading">
                    {" "}
                    {`${eventHours}:${eventMinutes} on ${extendDate(eventDate)}`}
                    {/* Singular periodicity -> "Week" */}
                    {eventPeriodic > 0 &&
                      eventPeriodic < 2 &&
                      `- repeats every ${eventPeriodic} week`}
                    {/* Above 1 periodicity -> "Weeks" */}
                    {eventPeriodic > 1 && `- repeats every ${eventPeriodic} weeks`}
                  </span>
                </div>
                <div className="widget-subheading">{eventDescription}</div>
              </div>
            </span>
            <div className="widget-content-right widget-content-actions">
              <button
                type="button"
                className="border-0 btn-transition btn btn-outline-primary"
                onClick={() => eventListClickHandler()}
              >
                <i className="fa fa-edit"></i>
              </button>
              <button
                type="button"
                className="border-0 btn-transition btn btn-outline-danger"
                onClick={() => eventListDeleteHandler()}
              >
                <i className="fa fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </li>
    </>
  );
};

export default EventListItem;
