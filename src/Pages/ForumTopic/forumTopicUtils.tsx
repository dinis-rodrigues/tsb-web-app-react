import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import {
  ForumTopicMetadata,
  Thread,
  ThreadCreation,
  ThreadMetadata,
  userContext,
  UserMetadata,
} from "../../interfaces";
import {
  getDecodedString,
  getEncodedString,
  sendNotification,
  toastrMessage,
  userHasPermission,
} from "../../utils/generalFunctions";
import { removePinnedThreadIfEqual } from "../ForumThread/forumThreadUtils";

/** Retrieves encoded topic strings from url
 * @return  [encodedSectionName, encodedTopicName]
 */
const getEncodedForumTopicPaths = () => {
  const pathName = window.location.pathname;
  // thread pathName
  // /forum/s/encodedSectionName/topic/encodedTopicName/thread/encodedThreadName
  let splitted = pathName.split("/");
  let encodedSectionName = splitted[3];
  let encodedTopicName = splitted[5];
  // decode everything and encode everything (our encoding is different from
  // browsers url)
  encodedSectionName = getEncodedString(getDecodedString(encodedSectionName));
  encodedTopicName = getEncodedString(getDecodedString(encodedTopicName));
  return [encodedSectionName, encodedTopicName];
};

/** On success toastr message
 * @param  {string} msg message to display
 */
const successCreatingThreadMessage = (msg: string) => {
  toastrMessage("Wow!", msg, "success");
};

/** Error toastr message
 * @param  {string} msg message to display
 */
const errorCreatingThreadMessage = (msg: string) => {
  toastrMessage("Error creating thread.", msg, "error");
};

/** Retrieves the corresponding badge class color if any
 * @param  {string} label corresponding thread label
 */
const getThreadBadgeColor = (label: string) => {
  var bcolor = "";
  if (label === "None") {
    return "";
  } else if (label === "Important") {
    return "badge-danger";
  } else if (label === "Solved") {
    return "badge-success";
  } else if (label === "Issue" || label === "Bug") {
    return "badge-warning";
  } else if (label === "Closed") {
    return "badge-dark";
  } else if (label === "Question") {
    return "badge-info";
  }
  return `<div class="mb-2 mr-2 ml-2 align-items-center badge ${bcolor}">${label.toUpperCase()}</div>`;
};
/** Updates forum metadata, with the latest thread creation
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {string} encodedSectionName encoded section name
 * @param  {string} encodedTopicName encoded topic name
 * @param  {userContext} user user object
 */
const updateForumMetadata = (
  newThreadInfo: ThreadCreation,
  encodedSectionName: string,
  encodedTopicName: string,
  user: userContext
) => {
  let createdAtTimestamp = new Date().getTime();
  let dataToUpdate = {
    latestUpdate: newThreadInfo.title,
    latestUpdateUrl: `/forum/s/${encodedSectionName}/topic/${encodedTopicName}/thread/${getEncodedString(
      newThreadInfo.title
    )}`,
    latestUserUpdate: user.id,
    latestUserNameUpdate: user.name,
    latestUpdateTimestamp: createdAtTimestamp,
  };
  // update metadata
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .update(dataToUpdate);
  // Increment number of threads
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child("numberThreads")
    .transaction((num) => {
      return (num || 0) + 1;
    });
  // Increment number of replies
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child("numberReplies")
    .transaction((num) => {
      return (num || 0) + 1;
    });
};

/** Updates forum topic metadata, with the latest thread creation
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {string} encodedSectionName encoded section name
 * @param  {string} encodedTopicName encoded topic name
 * @param  {userContext} user user object
 */
const updateForumTopicMetadata = (
  newThreadInfo: ThreadCreation,
  encodedSectionName: string,
  encodedTopicName: string,
  user: userContext
) => {
  let sectionName = getDecodedString(encodedSectionName);
  let topicName = getDecodedString(encodedTopicName);
  let encodedThreadName = getEncodedString(newThreadInfo.title);
  let createdAtTimestamp = new Date().getTime();
  let threadInTopicMetadata: ThreadMetadata = {
    sectionName: sectionName,
    topicName: topicName,
    threadTitle: newThreadInfo.title,
    threadLabel: newThreadInfo.label.value,
    createdBy: user.id,
    createdByName: user.name,
    createdAt: createdAtTimestamp,
    latestUpdateTimestamp: createdAtTimestamp,
    latestUserUpdate: user.id,
    latestUserNameUpdate: user.name,
    watchList: { [user.id]: user.name },
    likedBy: {},
    likedByName: {},
    viewedBy: { [user.id]: user.name },
    numberReplies: 1,
    recentUpdateViewedBy: { [user.id]: user.name },
  };
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .set(threadInTopicMetadata);
};

/** Creates a new thread entry in the database, and updates all forum metadata
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {string} encodedSectionName encoded section name
 * @param  {string} encodedTopicName encoded topic name
 * @param  {[string, ThreadMetadata][]} forumTopicMetadata forum topic metadata
 * containing all threads metadata
 * @param  {Function} setNewThreadInfo new thread info update state function
 */
const createNewThread = (
  newThreadInfo: ThreadCreation,
  encodedSectionName: string,
  encodedTopicName: string,
  user: userContext | null,
  forumTopicMetadata: [string, ThreadMetadata][],
  usersMetadata: UserMetadata,
  setNewThreadInfo: Function,
  setIsCreateThreadModalOpen: Function
) => {
  // Check if thread to create is not null
  if (
    !newThreadInfo.title ||
    !newThreadInfo.description ||
    !newThreadInfo.label ||
    !user
  ) {
    errorCreatingThreadMessage("Please fill all the fields");
    setIsCreateThreadModalOpen(false);
    return;
  }
  let sectionName = getDecodedString(encodedSectionName);
  let topicName = getDecodedString(encodedTopicName);
  let encodedThreadName = getEncodedString(newThreadInfo.title);

  // check if thread title is unique
  var isThreadTitleUnique = true;
  forumTopicMetadata.forEach(([existingEncodedThName, threadData]) => {
    if (encodedThreadName === existingEncodedThName)
      isThreadTitleUnique = false;
  });
  if (!isThreadTitleUnique) {
    errorCreatingThreadMessage(
      "Thread title already exists. Please choose another."
    );
    setIsCreateThreadModalOpen(false);
    return;
  }

  // Create Thread entry
  let createdAtTimestamp = new Date().getTime();
  let newThreadTemplate: Thread = {
    sectionName: sectionName,
    topicName: topicName,
    htmlContent: newThreadInfo.description,
    threadTitle: newThreadInfo.title,
    threadLabel: newThreadInfo.label.value,
    createdBy: user.id,
    createdByName: user.name,
    createdAt: createdAtTimestamp,
    latestUpdateTimestamp: createdAtTimestamp,
    latestUserUpdate: user.id,
    latestUserNameUpdate: user.name,
    watchList: { [user.id]: user.name },
    likedBy: {},
    likedByName: [],
    viewedBy: { [user.id]: user.name },
    recentUpdateViewedBy: { [user.id]: user.name },
  };
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .set(newThreadTemplate, (error) => {
      if (error) {
        errorCreatingThreadMessage(
          "Error creating the thread. Contact the admin."
        );
        setIsCreateThreadModalOpen(false);
        return;
      }
      // update forum metadata
      updateForumMetadata(
        newThreadInfo,
        encodedSectionName,
        encodedTopicName,
        user
      );
      // update forum topic metadata
      updateForumTopicMetadata(
        newThreadInfo,
        encodedSectionName,
        encodedTopicName,
        user
      );
      successCreatingThreadMessage("You created a new thread!");

      // clear modal
      setNewThreadInfo({ title: "", label: {}, description: "" });
      setIsCreateThreadModalOpen(false);
      // Send notifications to all users in application
      let threadUrl = `forum/s/${encodedSectionName}/topic/${encodedTopicName}/thread/${encodedThreadName}`;
      Object.entries(usersMetadata).forEach(([userId, userInfo]) => {
        sendNotification(
          userId,
          user.id,
          newThreadInfo.title,
          "A new thread was created, check it out",
          threadUrl,
          null,
          "generalThread",
          "info"
        );
      });
    });
};

/** Handles the on change event of the select label input
 * @param  {any} selected select option of the select input
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {Function} setNewThreadInfo new thread info update state function
 */
const newThreadLabelHandler = (
  selected: any,
  newThreadInfo: ThreadCreation,
  setNewThreadInfo: Function
) => {
  setNewThreadInfo({ ...newThreadInfo, label: selected });
};

/** Handles the on change input of the title text
 * @param  {event} e input onchange event
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {Function} setNewThreadInfo new thread info update state function
 */
const newThreadTitleHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  newThreadInfo: ThreadCreation,
  setNewThreadInfo: Function
) => {
  const value = e.target.value;
  setNewThreadInfo({ ...newThreadInfo, title: value });
};

/** Handles the on change input of the description
 * @param  {string} value html string of the description
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {Function} setNewThreadInfo new thread info update state function
 */
const newThreadDescriptionHandler = (
  value: string,
  newThreadInfo: ThreadCreation,
  setNewThreadInfo: Function
) => {
  setNewThreadInfo({ ...newThreadInfo, description: value });
};

/** Checks if the user has seen the thread, in the viewedBy array
 * @param  {string[]} viewedBy html string of the description
 * @param  {userContext} user new thread info to create
 */
const hasUserSeenThread = (
  viewedBy: { [key: string]: string },
  user: userContext | null
) => {
  if (!user) return false;
  if (viewedBy[user.id]) return true;
  return false;
};

/** Sorts topic threads by latest update timestamp
 * @param  {ForumTopicMetadata} topicsMetadata topic metadata, containing all
 * the threads
 */
const sortThreadsByDate = (topicsMetadata: ForumTopicMetadata) => {
  return Object.entries(topicsMetadata).sort((a, b) => {
    let topicA = a[1];
    let topicB = b[1];
    if (topicA.latestUpdateTimestamp > topicB.latestUpdateTimestamp) return -1;
    if (topicA.latestUpdateTimestamp < topicB.latestUpdateTimestamp) return 1;
    return 0;
  });
};

/** Returns a pomise to check if the topic exists in the forum metadata
 * @param  {string} encodedSectionName encoded section name, db and url ready string
 * @param  {string} encodedTopicName encoded topic name, db and url ready string
 */
const checkIfThreadExists = (
  encodedSectionName: string,
  encodedTopicName: string
) => {
  return db
    .ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .once("value");
};
/** Retrieves topic metadata containing all the threadsHandles the on change input of the description
 * @param  {string} encodedSectionName encoded section name, db and url ready string
 * @param  {string} encodedTopicName encoded topic name, db and url ready string
 * @param  {Function} setForumTopicMetadata forum topic metadata update state function
 * @param  {Function} setRedirectTo redirect to string update state function
 */
const getForumTopicMetadata = (
  encodedSectionName: string,
  encodedTopicName: string,
  setForumTopicMetadata: Function
) => {
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .on("value", (snapshot) => {
      let topicMetadata: ForumTopicMetadata = snapshot.val();
      if (!topicMetadata) {
        // console.log("returning");
        return;
      }

      let sortedThreads = sortThreadsByDate(topicMetadata);
      setForumTopicMetadata(sortedThreads);
    });
};

/**
 * Deletes the entire topic and threads from the database
 * @param user
 * @param forumTopicMetadata
 * @param encodedSectionName
 * @param encodedTopicName
 */
const deleteTopic = (
  user: userContext | null,
  forumTopicMetadata: [string, ThreadMetadata][],
  encodedSectionName: string,
  encodedTopicName: string,
  setRedirectTo: Function
) => {
  if (!user || !userHasPermission(user)) return;

  forumTopicMetadata.forEach(([encodedThreadName, threadMetadata]) => {
    //Remove Pinned Thread if equal
    removePinnedThreadIfEqual(
      encodedSectionName,
      encodedTopicName,
      encodedThreadName
    );
  });
  // subtract number of replies to the forum metadata
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .remove();

  // remove from topic
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .remove();
  setRedirectTo("/forum");
};

/** Show a confirmation message to delete the topic
 * @param  {Function} deleteFunction function to delete the board
 */
const swalDeleteTopicMessage = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete everything!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this topic, and all its content.</p> <p><h4>Are you sure?</h4></p>`,

      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
      },
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      } else if (result.isDenied) {
        // console.log("deleting");
        deleteFunction();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

export {
  getForumTopicMetadata,
  hasUserSeenThread,
  newThreadDescriptionHandler,
  newThreadTitleHandler,
  newThreadLabelHandler,
  createNewThread,
  getThreadBadgeColor,
  checkIfThreadExists,
  getEncodedForumTopicPaths,
  deleteTopic,
  swalDeleteTopicMessage,
};
