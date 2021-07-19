import { useEffect, useState } from "react";
import cx from "classnames";
import { useAuth } from "../../contexts/AuthContext";
import { EventInformation } from "../../interfaces";
import { extendDate } from "../../utils/generalFunctions";
import { getSpecifiedEvent, setMeetingTimeout } from "./dashboardUtils";
import { UncontrolledTooltip } from "reactstrap";

type Props = {
  meetingType: string;
  tooltipTarget: string;
  bgColor?: string;
};

const DashEvent = ({
  meetingType,
  tooltipTarget,
  bgColor = "bg-grad",
}: Props) => {
  const { USER } = useAuth();
  const [event, setEvent] = useState<EventInformation>();
  const [timeLeft, setTimeLeft] = useState<string>("-");
  useEffect(() => {
    getSpecifiedEvent(USER, meetingType, event, setEvent);
    let timer: ReturnType<typeof setTimeout> | undefined = setMeetingTimeout(
      event,
      setTimeLeft
    );
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [USER, event, meetingType]);
  return event ? (
    <div className="col-md event-parent">
      <div
        className={cx(
          "card widget-chart widget-chart2 text-left event-widget mb-3",
          bgColor
        )}
      >
        <div className="widget-chart-content text-white">
          <div className="widget-chart-flex">
            <div className="widget-title">
              {event && event.type === "Competition" ? event.title : event.type}
            </div>
          </div>
          <div className="text-muted">
            {extendDate(event.date)}, at {event.hours}:{event.minutes}
          </div>

          <div className="widget-chart-flex">
            <div className="widget-numbers text-warning">{timeLeft}</div>
            <div className="text-warning float-right">
              <button
                id={tooltipTarget}
                className="btn-icon btn-icon-only btn btn-info"
                onClick={() =>
                  event.link ? window.open(event.link, "_blank") : null
                }
              >
                <i
                  className={cx("fas btn-icon-wrapper", {
                    "fa-map-marker-alt": !event.link,
                    "fa-video": event.link,
                  })}
                ></i>
              </button>
              <UncontrolledTooltip target={tooltipTarget} placement="top">
                {event.link
                  ? "Conference Meeting"
                  : event.description
                  ? event.description
                  : "No info"}
              </UncontrolledTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default DashEvent;
