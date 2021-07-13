import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import { v4 as uuid } from "uuid";
import {
  Thread,
  ThreadCreation,
  ThreadEdited,
  ThreadReplyInfo,
  userContext,
} from "../../interfaces";
import {
  getDecodedString,
  getEncodedString,
  sendNotification,
} from "../../utils/generalFunctions";

/** Show a confirmation message to delete the thread
 * @param  {Function} deleteFunction function to delete the board
 */
const swalDeleteThreadMessage = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete everything!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this thread, and all its content.</p> <p><h4>Are you sure?</h4></p>`,

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

/** Checks if the user is watching the thread or not
 * @param  {userContext} user select option of the select input
 * @param  {Thread} threadInformation new thread info to create
 */
const userWatchesThread = (
  user: userContext | null,
  threadInformation: Thread | undefined
) => {
  if (!user || !threadInformation) return false;
  if (threadInformation.hasOwnProperty("watchList")) {
    if (
      threadInformation.watchList &&
      threadInformation.watchList.hasOwnProperty(user.id)
    )
      return true;
    return false;
  }
  return false;
};

/** Checks if the user is likes the thread or not
 * @param  {userContext} user select option of the select input
 * @param  {Thread} threadInformation new thread info to create
 */
const userLikesThread = (
  user: userContext | null,
  threadInformation: Thread | undefined
) => {
  if (!user || !threadInformation) return false;
  if (threadInformation.hasOwnProperty("likedBy")) {
    if (threadInformation.likedBy!.hasOwnProperty(user.id)) return true;
    return false;
  }
  return false;
};

/** A listener to check if the current thread is pinned or not
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const isThreadPinnedListener = (
  setIsPinned: Function,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  db.ref("private/forumPinned")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .on("value", (snapshot) => {
      if (snapshot.val()) {
        setIsPinned(true);
        return;
      }
      setIsPinned(false);
    });
};
/** Checks if the current thread is pinned or not
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const isThreadPinned = (
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  return new Promise((resolve) => {
    db.ref("private/forumPinned")
      .child(encodedSectionName)
      .child(encodedTopicName)
      .child(encodedThreadName)
      .once("value")
      .then((snapshot) => {
        if (snapshot.val()) resolve(true);
        resolve(false);
      });
  });
};

/** Adds a watch entry to the thread and topic metadata
 * @param  {userContext} user select option of the select input
 * @param  {Thread} threadInformation new thread info to create
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const toggleWatchList = (
  user: userContext | null,
  threadInformation: Thread | undefined,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  if (!user || !threadInformation) return;
  let watchList = { ...threadInformation.watchList };

  // check if user has liked or disliked the thread
  if (!userWatchesThread(user, threadInformation)) {
    // Like Action -> add it to the object
    watchList[user.id] = user.name;
  } else if (!threadInformation.hasOwnProperty("watchList")) {
    // First like in the thread, create it
    watchList = { [user.id]: user.name };
  } else {
    // Dislike action -> remove it from the object and decrement number of
    // likes
    delete watchList[user.id];
  }
  // Update thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("watchList")
    .set(watchList);
  // Update topic metadata
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("watchList")
    .set(watchList);
  // }

  // Update who watches the thread on the pinned db as well
  isThreadPinned(encodedSectionName, encodedTopicName, encodedThreadName).then(
    (isPinned) => {
      if (isPinned) {
        // Update pinned thread as well
        db.ref("private/forumPinned")
          .child(encodedSectionName)
          .child(encodedTopicName)
          .child(encodedThreadName)
          .child("watchList")
          .set(watchList);
      }
    }
  );
};

/** Toggles the current thread as pinned or not
 * @param  {Thread} threadInformation Thread information
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const togglePinnedThread = (
  threadInformation: Thread | undefined,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  if (!threadInformation) return;
  isThreadPinned(encodedSectionName, encodedTopicName, encodedThreadName).then(
    (isPinned) => {
      if (isPinned) {
        // remove pinned thread
        db.ref("private/forumPinned")
          .child(encodedSectionName)
          .child(encodedTopicName)
          .child(encodedThreadName)
          .remove();
      } else {
        // thread is not pinned, so remove existing one, and add it
        db.ref("private/forumPinned")
          .remove()
          .then(() => {
            db.ref("private/forumPinned")
              .child(encodedSectionName)
              .child(encodedTopicName)
              .child(encodedThreadName)
              .set(threadInformation);
          });
      }
    }
  );
};

/** If the pinned thread is the one we are deleting, remove it
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const removePinnedThreadIfEqual = (
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  isThreadPinned(encodedSectionName, encodedTopicName, encodedThreadName).then(
    (isPinned) => {
      if (isPinned) {
        db.ref("private/forumPinned")
          .child(encodedSectionName)
          .child(encodedTopicName)
          .child(encodedThreadName)
          .remove();
      }
    }
  );
};

/** Deletes the thread and all envolved metadatas
 * @param  {userContext} user select option of the select input
 * @param  {Thread} threadInformation new thread info to create
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const deleteThread = (
  user: userContext | null,
  threadInformation: Thread | undefined,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  if (!threadInformation) return;
  if (!user || user.id !== threadInformation.createdBy) return;
  // console.log("deletign");
  let totalReplies = 1; // the original post is a reply
  if (threadInformation.replies) {
    let numReplies = Object.entries(threadInformation.replies).length;
    totalReplies = totalReplies + numReplies;
  }
  // subtract number of replies to the forum metadata
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child("numberReplies")
    .transaction((num) => {
      return (num || 0) - totalReplies;
    });
  // subtract number of threads to the forum metadata
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child("numberThreads")
    .transaction((num) => {
      return (num || 0) - 1;
    });

  // remove from topic metadata
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .remove();
  //Remove Pinned Thread if equal
  removePinnedThreadIfEqual(
    encodedSectionName,
    encodedTopicName,
    encodedThreadName
  );

  // Remove thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .remove()
    .then(
      function () {
        // // console.log(
        //   encodedSectionName,
        //   encodedTopicName,
        //   encodedThreadName,
        //   " deleted successfully! "
        // );
      },
      (err) => {
        // console.log(err);
      }
    );
};

/** Adds a like entry to the comment
 * @param  {userContext} user select option of the select input
 * @param  {string} replyId new thread info to create
 * @param  {ThreadReplyInfo} threadReply thread reply information
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const toggleCommentLikedBy = (
  user: userContext | null,
  replyId: string,
  threadReply: ThreadReplyInfo,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  if (!user) return;
  let likedBy = { ...threadReply.likedBy };

  // check if user has liked or disliked the thread
  if (likedBy && likedBy[user.id]) {
    // Dislike action -> remove it from the object and decrement number of
    // likes

    delete likedBy[user.id];
    // console.log("disliking", likedBy);
  } else if (likedBy && !likedBy[user.id]) {
    // Like Action -> add it to the object
    likedBy[user.id] = user.name;
  } else {
    // First like in the thread, create it
    likedBy = { [user.id]: user.name };
  }
  // Update thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("replies")
    .child(replyId)
    .child("likedBy")
    .set(likedBy);
};

/** Adds a like entry to the thread and topic metadata
 * @param  {userContext} user select option of the select input
 * @param  {Thread} threadInformation new thread info to create
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const toggleThreadLikedBy = (
  user: userContext | null,
  threadInformation: Thread,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  if (!user) return;
  let likedBy = { ...threadInformation.likedBy };

  // check if user has liked or disliked the thread
  if (!userLikesThread(user, threadInformation)) {
    // Like Action -> add it to the object
    likedBy[user.id] = user.name;
  } else if (!threadInformation.hasOwnProperty("likedBy")) {
    // First like in the thread, create it
    likedBy = { [user.id]: user.name };
  } else {
    // Dislike action -> remove it from the object and decrement number of
    // likes
    delete likedBy[user.id];
    // console.log("disliking", likedBy);
  }
  // Update thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("likedBy")
    .set(likedBy);
  // Update topic metadata
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("likedBy")
    .set(likedBy);

  // Update who liked the thread on the pinned db sa well
  isThreadPinned(encodedSectionName, encodedTopicName, encodedThreadName).then(
    (isPinned) => {
      if (isPinned) {
        // Update pinned thread as well
        db.ref("private/forumPinned")
          .child(encodedSectionName)
          .child(encodedTopicName)
          .child(encodedThreadName)
          .child("likedBy")
          .set(likedBy);
      }
    }
  );
};

/** Handles the on change event of the select label input
 * @param  {any} selected select option of the select input
 * @param  {ThreadCreation} newThreadInfo new thread info to create
 * @param  {Function} setNewThreadInfo new thread info update state function
 */
const editThreadLabelHandler = (
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
const editThreadTitleHandler = (
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
const editThreadDescriptionHandler = (
  value: string,
  newThreadInfo: ThreadCreation,
  setNewThreadInfo: Function
) => {
  setNewThreadInfo({ ...newThreadInfo, description: value });
};

/** Saves edited thread in the database
 * @param newThreadInfo new thread information
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const saveThread = (
  newThreadInfo: ThreadCreation,
  user: userContext | null,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  setIsEditThreadModalOpen: Function
) => {
  if (!user) {
    setIsEditThreadModalOpen(false);
    return;
  }
  var dataToUpdate: ThreadEdited = {
    threadTitle: newThreadInfo.title,
    htmlContent: newThreadInfo.description,
    threadLabel: newThreadInfo.label.value,
    latestUserNameUpdate: user.name,
    latestUserUpdate: user.id,
    latestUpdateTimestamp: new Date().getTime(),
  };
  // Update thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .update(dataToUpdate);

  //   Update forum topic metadata
  newReplyUpdateTopicMetadata(
    user,
    encodedSectionName,
    encodedTopicName,
    encodedThreadName,
    dataToUpdate,
    false
  );
  //   Update Forum metadata
  newReplyUpdateForumMetadata(
    user,
    encodedSectionName,
    encodedTopicName,
    encodedThreadName,
    false
  );
  // console.log("checking pinned");

  // save thread in pinned thread if exists
  isThreadPinned(encodedSectionName, encodedTopicName, encodedThreadName).then(
    (isPinned) => {
      if (isPinned) {
        // Update pinned thread as well
        db.ref("private/forumPinned")
          .child(encodedSectionName)
          .child(encodedTopicName)
          .child(encodedThreadName)
          .update(dataToUpdate);
      }
    }
  );

  setIsEditThreadModalOpen(false);
};

/** SAves the edited comment
 * @param threadId threadId from db
 * @param commentText comment html text
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const saveComment = (
  threadId: string,
  commentText: string,
  user: userContext | null,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  setIsCommentModalOpen: Function
) => {
  if (!user) {
    setIsCommentModalOpen(false);
    return;
  }
  let dataToUpdate = {
    replyHtml: commentText,
    latestUpdateTimestamp: new Date().getTime(),
  };

  // Update thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("replies")
    .child(threadId)
    .update(dataToUpdate);

  setIsCommentModalOpen(false);
};

/** Removes reply/comment from the thread
 * @param threadId threadId from db
 * @param threadComment thread comment information
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const deleteComment = (
  threadId: string,
  threadComment: ThreadReplyInfo,
  user: userContext | null,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  if (!user || user.id !== threadComment.replyBy) {
    return;
  }
  // Decrement number of replies in the forum getForumMetadata, and topic
  // metadata
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("numberReplies")
    .transaction((num) => {
      return (num || 0) - 1;
    });
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child("numberReplies")
    .transaction((num) => {
      return (num || 0) - 1;
    });
  // Update thread with the removed commment
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("replies")
    .child(threadId)
    .remove();
};

/** Pushes a new comment to the db and updates forum metadata after a reply has been submitted
 * @param replyText reply html string to be submitted
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 */
const submitThreadReply = (
  replyText: string,
  user: userContext | null,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  threadInfo: Thread,
  setIsForumThreadReplyModalOpen: Function
) => {
  if (!user) return;
  let reply: ThreadReplyInfo = {
    replyHtml: replyText,
    replyBy: user.id,
    replyTimestamp: new Date().getTime(),
    likedBy: {},
  };
  //   Add reply to thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child("replies")
    .push(reply);
  //   Update topic metadata
  newReplyUpdateTopicMetadata(
    user,
    encodedSectionName,
    encodedTopicName,
    encodedThreadName
  );

  // Update forum metadata
  newReplyUpdateForumMetadata(
    user,
    encodedSectionName,
    encodedTopicName,
    encodedThreadName
  );
  // clear who viewed the most recent update
  updateWhoViewedMostRecentUpdate(
    user,
    encodedSectionName,
    encodedTopicName,
    encodedThreadName,
    true,
    "recentUpdateViewedBy",
    null
  );
  setIsForumThreadReplyModalOpen(false);

  // send notification to watchlist of the thread
  Object.entries(threadInfo.watchList).forEach(([sendTo, userName]) => {
    sendThreadReplyNotification(
      threadInfo,
      encodedSectionName,
      encodedTopicName,
      encodedThreadName,
      user,
      sendTo
    );
  });
};

/**
 * Sends a notification of a forum reply type to a specified user
 * @param threadInfo thread information
 * @param encodedSectionName encoded section name
 * @param encodedTopicName encoded topic name
 * @param encodedThreadName encoded thread name
 * @param user current user
 * @param sendTo send to user id
 * @returns null if no authenticated user
 */
const sendThreadReplyNotification = (
  threadInfo: Thread,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  user: userContext,
  sendTo: string
) => {
  if (!user) return;
  let description = `${user.name} replied to this thread.`;
  let urlPath = `/forum/s/${encodedSectionName}/topic/${encodedTopicName}/thread/${encodedThreadName}`;
  sendNotification(
    sendTo,
    user.id,
    threadInfo.threadTitle,
    description,
    urlPath,
    null,
    "forumReply",
    "info"
  );
};

/** Updates forum metadata after a reply has been submitted
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 * @param  {boolean} onlyMe boolean if to reset the viewedBy object
 * @param  {string} viewedByKey viewedBy or recentUpdateViewedBy
 * @param  recentUpdateViewedBy object with the users list
 */
const updateWhoViewedMostRecentUpdate = (
  user: userContext | null,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  onlyMe = false,
  viewedByKey: string,
  viewedByObject: { [key: string]: string } | null = null
) => {
  if (!user) return;
  if (!viewedByObject) {
    // If the array dows not exist exists, create it
    viewedByObject = {};
  }
  if (onlyMe) {
    // Update only the current user, who has viewed the most recent Update
    // A reply was submitted by the user, so only the current user has viewed it
    viewedByObject = { [user.id]: user.name };
  } else {
    // Update the entire array
    // check if user is NOT there
    if (!viewedByObject[user.id]) {
      viewedByObject[user.id] = user.name;
    } else {
      // if the user is there, do not update the database
      return true;
    }
  }
  // console.log("updating", viewedByObject);
  // console.log(
  //   `${encodedSectionName}/${encodedTopicName}/${encodedThreadName}/${viewedByKey}`
  // );
  // Update thread
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child(viewedByKey)
    .set(viewedByObject);
  // Update topic thread Metadata
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .child(viewedByKey)
    .set(viewedByObject);
  // Update who viewed the thread on the pinned db as well
  isThreadPinned(encodedSectionName, encodedTopicName, encodedThreadName).then(
    (isPinned) => {
      if (isPinned) {
        // Update pinned thread as well
        db.ref("private/forumPinned")
          .child(encodedSectionName)
          .child(encodedTopicName)
          .child(encodedThreadName)
          .child(viewedByKey)
          .set(viewedByObject);
      }
    }
  );
};

/** Updates forum metadata after a reply has been submitted
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 * @param increment increment number of replies or not
 */
const newReplyUpdateForumMetadata = (
  user: userContext,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  increment = true
) => {
  var threadUrl = `/forum/s/${encodedSectionName}/topic/${encodedTopicName}/thread/${encodedThreadName}`;
  let threadName = getDecodedString(encodedThreadName);
  var dataToUpdate = {
    latestUpdate: threadName,
    latestUserNameUpdate: user.name,
    latestUserUpdate: user.id,
    latestUpdateTimestamp: new Date().getTime(),
    latestUpdateUrl: threadUrl,
    // numberOfReplies:
  };
  // Update metadata
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .update(dataToUpdate);
  // Increment number of replies
  if (increment) {
    db.ref("private/forumMetadata")
      .child(encodedSectionName)
      .child(encodedTopicName)
      .child("numberReplies")
      .transaction((num) => {
        return (num || 0) + 1;
      });
  }
};

/** Updates topic metadata after a reply has been submitted
 * @param user current authenticated user
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 * @param increment increment number of replies or not
 */
const newReplyUpdateTopicMetadata = (
  user: userContext,
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  extraInformation: ThreadEdited | null = null,
  increment = true
) => {
  let dataToUpdate = { ...extraInformation };
  delete dataToUpdate.htmlContent;
  if (!extraInformation) {
    dataToUpdate = {
      latestUserNameUpdate: user.name,
      latestUserUpdate: user.id,
      latestUpdateTimestamp: new Date().getTime(),
    };

    // numberOfReplies:
  }
  // Update metadata
  db.ref("private/forumTopicMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .update(dataToUpdate);
  // Increment number of replies
  if (increment) {
    db.ref("private/forumTopicMetadata")
      .child(encodedSectionName)
      .child(encodedTopicName)
      .child(encodedThreadName)
      .child("numberReplies")
      .transaction((num) => {
        return (num || 0) + 1;
      });
  }
};
/** Retrieves encoded thread strings from url
 * @return  [encodedSectionName, encodedTopicName, encodedThreadName]
 */
const getEncodedForumThreadPaths = () => {
  const pathName = window.location.pathname;
  // thread pathName
  // /forum/s/encodedSectionName/topic/encodedTopicName/thread/encodedThreadName
  let splitted = pathName.split("/");
  let encodedSectionName = splitted[3];
  let encodedTopicName = splitted[5];
  let encodedThreadName = splitted[7];
  // decode everything and encode everything (our encoding is different from
  // browsers url)
  encodedSectionName = getEncodedString(getDecodedString(encodedSectionName));
  encodedTopicName = getEncodedString(getDecodedString(encodedTopicName));
  encodedThreadName = getEncodedString(getDecodedString(encodedThreadName));

  return [encodedSectionName, encodedTopicName, encodedThreadName];
};

/** Retrieves decoded thread strings
 * @return  [decodedSectionName, decodedTopicName, decodedThreadName]
 */
const getDecodedForumThreadPaths = (
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string
) => {
  return [
    getDecodedString(encodedSectionName),
    getDecodedString(encodedTopicName),
    getDecodedString(encodedThreadName),
  ];
};

/** Retrieves decoded thread strings
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 * @param  {string} encodedThreadName encoded string of thread name
 * @param  {string} setThreadInformation thread information update state function
 * @param  {string} setThreadReplies thread replies update state function
 * @param  {string} setRedirectTo redirect to string update state function
 */
const getAndSetThreadInformation = (
  encodedSectionName: string,
  encodedTopicName: string,
  encodedThreadName: string,
  user: userContext | null,
  setThreadInformation: Function,
  setRedirectTo: Function
) => {
  // // console.log(encodedSectionName, encodedTopicName, encodedThreadName);
  db.ref("private/forumThreads")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .child(encodedThreadName)
    .on("value", (snapshot) => {
      if (!snapshot.val()) {
        setRedirectTo(
          `/forum/s/${encodedSectionName}/topic/${encodedTopicName}`
        );
        return;
      }
      let threadInfo: Thread = snapshot.val();
      setThreadInformation(threadInfo);
      // Update who viewed the recent update of thread on page entry
      updateWhoViewedMostRecentUpdate(
        user,
        encodedSectionName,
        encodedTopicName,
        encodedThreadName,
        false,
        "recentUpdateViewedBy",
        threadInfo.recentUpdateViewedBy
      );
      // Update who viewed the thread on page entry
      updateWhoViewedMostRecentUpdate(
        user,
        encodedSectionName,
        encodedTopicName,
        encodedThreadName,
        false,
        "viewedBy",
        threadInfo.viewedBy
      );
    });
};

/** Retrieves decoded thread strings
 * @param  {string} encodedSectionName encoded string of section name
 * @param  {string} encodedTopicName encoded string of topic name
 */
const openEditCommentModal = (
  threadComment: ThreadReplyInfo,
  threadId: string,
  setIsEditCommentModalOpen: Function,
  setEditComment: Function
) => {
  setEditComment({
    id: threadId,
    threadComment: threadComment,
  });
  setIsEditCommentModalOpen(true);
};

const usersWhoLikedOrWatchedTooltipList = (
  usersObject:
    | {
        [key: string]: string;
      }
    | undefined
) => {
  // Create a facebook like string array for the tooltip
  let tooltipStr = [
    <p key={uuid()} className="tooltip-break">
      Nobody
    </p>,
  ];
  if (!usersObject) return tooltipStr;
  let usersList = Object.entries(usersObject);
  let usersLength = usersList.length;

  // Limit to 19 users on the tooltip
  if (usersLength > 19) {
    tooltipStr = usersList.slice(0, 19).map(([userId, userName]) => (
      <p key={uuid()} className="tooltip-break">
        {userName}
      </p>
    ));
    return tooltipStr.push(
      <p key={uuid()} className="tooltip-break">
        And {usersLength - 19} more
      </p>
    );
  } else {
    return usersList.map(([userId, userName]) => (
      <p key={uuid()} className="tooltip-break">
        {userName}
      </p>
    ));
  }
};
export {
  getEncodedForumThreadPaths,
  getDecodedForumThreadPaths,
  getAndSetThreadInformation,
  submitThreadReply,
  editThreadDescriptionHandler,
  editThreadTitleHandler,
  editThreadLabelHandler,
  saveThread,
  toggleThreadLikedBy,
  toggleCommentLikedBy,
  swalDeleteThreadMessage,
  deleteThread,
  toggleWatchList,
  togglePinnedThread,
  isThreadPinnedListener,
  userWatchesThread,
  userLikesThread,
  saveComment,
  deleteComment,
  openEditCommentModal,
  usersWhoLikedOrWatchedTooltipList,
  updateWhoViewedMostRecentUpdate,
  removePinnedThreadIfEqual,
};
