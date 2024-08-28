import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Notification } from "../../interfaces";
import NotificationRow from "./NotificationRow";
import { fetchBatchNotifications, notificationsOnScroll } from "./notificationsUtils";

const NotificationsPage = () => {
  const { USER } = useAuth();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<[string, Notification][]>([]);
  const [referenceToOldestKey, setReferenceToOldestKey] = useState("");

  useEffect(() => {
    fetchBatchNotifications(USER, setNotifications, setReferenceToOldestKey);
    // return () => {
    //   cleanup;
    // };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="main-card mb-3 card">
          <div className="card-header">
            <i className="header-icon fas fa-bell icon-gradient bg-plum-plate"> </i>
            Notifications
          </div>
          <div className="card-body">
            <div
              className="scroll-area-lg"
              ref={notificationsRef}
              onScroll={() =>
                notificationsOnScroll(
                  USER,
                  referenceToOldestKey,
                  notificationsRef,
                  setReferenceToOldestKey,
                  setNotifications,
                )
              }
            >
              <div className="scrollbar-container">
                <div className="vertical-time-icons vertical-timeline vertical-timeline--animate vertical-timeline--one-column">
                  {notifications &&
                    notifications.map(([notifId, notification]) => (
                      <NotificationRow key={notifId} notification={notification} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
