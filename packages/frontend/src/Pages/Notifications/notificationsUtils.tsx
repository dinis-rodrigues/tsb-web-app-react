import {
  endAt,
  get,
  limitToLast,
  onValue,
  orderByKey,
  query,
  ref,
  remove,
} from "firebase/database";
import { db } from "../../config/firebase";
import { Notification, Notifications, userContext } from "../../interfaces";

/**
 * A database listener to retrieve the new notifications
 * @param user current authenticated user
 * @param setNewNotifications new notifications state update function
 * @returns null if no user
 */
const fetchBatchNotifications = (
  user: userContext | null,
  setNotifications: Function,
  setReferenceToOldestKey: Function
) => {
  let notificationBatch = 10;
  if (!user) return;
  get(
    query(
      ref(db, `private/usersNotifications/${user.id}/all`),
      orderByKey(),
      limitToLast(notificationBatch)
    )
  ).then((snapshot) => {
    if (snapshot.val()) {
      let allNotifs = Object.entries(snapshot.val()).sort().reverse();
      setNotifications(allNotifs);
      let lastNotifKey = allNotifs[allNotifs.length - 1][0];
      setReferenceToOldestKey(lastNotifKey);
    }
  });
};

const notificationsOnScroll = (
  user: userContext | null,
  referenceToOldestKey: string,
  notificationsRef: React.RefObject<HTMLDivElement>,
  setReferenceToOldestKey: Function,
  setNotifications: Function
) => {
  let notificationBatch = 10;

  if (!user) return;
  if (notificationsRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = notificationsRef.current;

    if (scrollTop + clientHeight === scrollHeight && referenceToOldestKey) {
      get(
        query(
          ref(db, `private/usersNotifications/${user.id}/all`),
          orderByKey(),
          endAt(referenceToOldestKey),
          limitToLast(notificationBatch + 1)
        )
      )
        .then((snapshot) => {
          let moreNotifications: Notifications = snapshot.val();
          let arrayOfNotifications = Object.entries(moreNotifications)
            .sort()
            .reverse()
            .slice(1); // remove the first element (duplicate)
          //   let notificationsReversed = arrayOfKeys.map(
          //     (key) => snapshot.val()[key]
          //   );
          setNotifications((notifications: [string, Notification][]) => [
            ...notifications,
            ...arrayOfNotifications,
          ]);
          let lastKey =
            arrayOfNotifications[arrayOfNotifications.length - 1][0];
          setReferenceToOldestKey(lastKey);
        })
        .catch((error) => {});
    }
  } else {
    return;
  }
};

/**
 * A database listener to retrieve the new notifications
 * @param user current authenticated user
 * @param setNewNotifications new notifications state update function
 * @returns null if no user
 */
const newNotificationsListener = (
  user: userContext | null,
  notificationsMask: Notifications,
  setNotificationsMask: Function,
  setUnreadNotifications: Function
) => {
  if (!user) return;
  onValue(ref(db, `private/usersNotifications/${user.id}/new`), (snapshot) => {
    let notifications = snapshot.val();
    if (notifications) {
      setNotificationsMask({ ...notificationsMask, ...notifications });
    }
    if (notifications) {
      // Notification icon animation and color
      setUnreadNotifications(true);
    } else {
      setUnreadNotifications(false);
    }
  });
};

/**
 * Removes new notifications from user
 * @param user current authenticated user
 * @returns
 */
const removeNewNotifications = (
  user: userContext | null,
  unreadNotifications: boolean
) => {
  if (!user || unreadNotifications) return;
  remove(ref(db, `private/usersNotifications/${user.id}/new`));
};
/**
 * Get the color of the notification
 * @param notification
 * @returns
 */
const getNotificationBorderColor = (notification: Notification) => {
  let color = notification.color;
  if (color === "info") {
    return "border-info"; // "lnr-layers";
  } else if (color === "warning") {
    return "border-warning";
  } else if (color === "danger") {
    return "border-danger";
  } else if (color === "success") {
    return "border-success";
  } else {
    return "";
  }
};

/**
 * Get notification icon color class name
 * @param notification
 * @returns
 */
const getNotificationIconColor = (notification: Notification) => {
  let color = notification.color;
  if (color === "info") {
    return "bg-happy-fisher"; // "lnr-layers";
  } else if (color === "warning") {
    return "bg-sunny-morning";
  } else if (color === "danger") {
    return "bg-love-kiss";
  } else if (color === "success") {
    return "bg-happy-itmeo";
  } else {
    return "";
  }
};

/**
 * Get notification icon
 * @param notification
 * @returns
 */
const getNotificationIcon = (notification: Notification) => {
  let type = notification.type;
  if (type === "task") {
    // task icon
    return "lnr-layers";
  } else if (type === "taskComment") {
    // Material icon
    return "fas fa-comments";
  } else if (type === "material") {
    // Material icon
    return "fas fa-hammer";
  } else if (type === "attendedEvent") {
    // missed Event icon
    return "fas fa-check-circle";
  } else if (type === "missedEvent") {
    // missed Event icon
    return "fas fa-exclamation-triangle";
  } else if (type === "generalThread") {
    // a new thread in the general topic
    return "fas fa-bullhorn";
  } else if (type === "forumReply") {
    // a new reply in a thread you are following
    return "fas fa-comment-dots";
  }
};
export {
  newNotificationsListener,
  getNotificationBorderColor,
  getNotificationIconColor,
  getNotificationIcon,
  removeNewNotifications,
  fetchBatchNotifications,
  notificationsOnScroll,
};
