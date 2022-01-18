import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import {
  ForumMetadata,
  ForumTopicMetadata,
  selectOption,
  TopicsMetadata,
  userContext,
} from "../../interfaces";
import { getEncodedString } from "../../utils/generalFunctions";
import { removePinnedThreadIfEqual } from "../ForumThread/forumThreadUtils";

/** Creates a new Forum Section and Topic
 * @param  {string} radioOption "AddTo" | "Create "option to create or to add section
 * @param  {selectOption | null} sectionValue Existing selected section to create topic in
 * @param  {string} newSectionValue New section to create
 * @param  {string} topicInputValue Topic to create
 * @param  {userContext} user current signed in user
 * @param  {Function} setTopicInputValue topic name state update function
 * @param  {Function} setIsSectionModalOpen model open update state function
 */
const createNewForumSection = (
  radioOption: string,
  sectionValue: selectOption | null,
  newSectionValue: string,
  topicInputValue: string,
  forumMetadata: ForumMetadata,
  forumSectionOrder: string[],
  user: userContext | null,
  setTopicInputValue: Function,
  setIsSectionModalOpen: Function
) => {
  if (!user || !topicInputValue || !radioOption) return;
  let sectionName = newSectionValue;
  let topicName = topicInputValue;
  let createNewSection = false;
  // Get existing section name
  if (radioOption === "AddTo" && sectionValue && sectionValue.label) {
    sectionName = sectionValue.label; // decoded string
  } else {
    createNewSection = true;
  }
  // encode the strings, ready for the database and URL
  let encodedSectionName = getEncodedString(sectionName);
  let encodedTopicName = getEncodedString(topicName);

  if (!encodedSectionName || !encodedTopicName) return;

  // check if section and topic already exist, don't allow creation of equals
  if (forumMetadata.hasOwnProperty(encodedSectionName) && createNewSection)
    return;
  if (
    forumMetadata.hasOwnProperty(encodedSectionName) &&
    forumMetadata[encodedSectionName].hasOwnProperty(encodedTopicName)
  )
    return;
  let now = new Date().getTime();
  let topicToCreate = {
    sectionName: sectionName,
    topicName: topicInputValue,
    numberThreads: 0,
    numberReplies: 0,
    createdBy: user.id,
    createdByName: user.name,
    createdAt: now,
    latestUpdate: "-",
    latestUpdateUrl: "-",
    latestUserUpdate: user.id,
    latestUserNameUpdate: user.name,
    latestUpdateTimestamp: now,
  };
  // Create the topic in the database
  db.ref("private/forumMetadata")
    .child(encodedSectionName)
    .child(encodedTopicName)
    .set(topicToCreate);

  // Push new section into the forumOrder
  if (createNewSection) {
    let newForumOrder = [...forumSectionOrder, encodedSectionName];
    db.ref("private/forumOrder").set(newForumOrder);
  }
  // Push
  setIsSectionModalOpen(false);
  setTopicInputValue("");
};

/** Handler for the radio group
 * @param  {Function} setRadioOption radio input update state function
 * @param  {Function} setNewSectionValue topic text update state function
 */
const radioHandler = (
  e: React.ChangeEvent<HTMLInputElement>,
  setRadioOption: Function,
  setNewSectionValue: Function
) => {
  setRadioOption(e.target.value);
  if (e.target.value === "AddTo") {
    setNewSectionValue("");
  } else {
  }
};

/** Retrieves forum metadata, containing section and topic information
 * @param  {Function} setForumMetadata forum metadata update state function
 */
const getForumMetadata = async (
  setForumMetadata: Function,
  setForumSectionOrder: Function
) => {
  // Get order of the sections to display
  db.ref("private/forumOrder").on("value", (sectionOrder) => {
    let forumOrder = sectionOrder.val() ? sectionOrder.val() : [];

    setForumSectionOrder(forumOrder);
    // Get forum metadata
    db.ref("private/forumMetadata").on("value", (snapshot) => {
      let forumMetadata: ForumMetadata = snapshot.val();
      if (!forumMetadata) return;
      // sort by timestamp creation
      setForumMetadata(forumMetadata);
    });
  });
};

// const getForumSectionOrder = () => {
//   return db.ref("private/forumOrder").once("value");
// };

/**
 * Delete the section and all of its topics and threads
 * @param encodedSectionName
 * @param sectionOrder
 * @param topicsFromSection
 */
const deleteSection = (
  encodedSectionName: string,
  sectionOrder: string[],
  topicsFromSection: TopicsMetadata
) => {
  // Remove section from the section order list
  let newSectionOrder = sectionOrder.filter(
    (item) => item !== encodedSectionName
  );

  // For each topic of the section, check if any of the threads is pinned.
  // Remove it
  topicsFromSection &&
    Object.entries(topicsFromSection).forEach(
      ([encodedTopicName, topicMetadata]) => {
        db.ref("private/forumTopicMetadata")
          .child(encodedTopicName)
          .once("value")
          .then((snapshot) => {
            let allThreads: ForumTopicMetadata = snapshot.val();
            if (allThreads) {
              Object.entries(allThreads).forEach(
                ([encodedThreadName, threadData]) => {
                  //Remove Pinned Thread if equal
                  removePinnedThreadIfEqual(
                    encodedSectionName,
                    encodedTopicName,
                    encodedThreadName
                  );
                }
              );
            }
          });
      }
    );

  // Now, remove section from forum metadata
  db.ref("private/forumMetadata").child(encodedSectionName).remove();
  // Remove from forum topic metadata
  db.ref("private/forumTopicMetadata").child(encodedSectionName).remove();
  // Remove all threads
  db.ref("private/forumThreads").child(encodedSectionName).remove();

  // Update new forum order
  db.ref("private/forumOrder").set(newSectionOrder);
};

/** Show a confirmation message to delete the topic
 * @param  {Function} deleteFunction function to delete the board
 */
const swalDeleteSectionMessage = (deleteFunction: Function) => {
  swalDeleteAlert
    .fire({
      reverseButtons: true,
      title: "Beware",
      showDenyButton: true,
      denyButtonText: "Yes, delete everything!",
      confirmButtonText: `Cancel`,
      icon: "warning",
      html: `<p>You are about to delete this section, and all its content.</p> <p><h4>Are you sure?</h4></p>`,

      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
      },
    })
    .then((result) => {
      if (result.isConfirmed) {
        return;
      } else if (result.isDenied) {
        deleteFunction();
      }
    });
};
const swalDeleteAlert = withReactContent(Swal);

const moveElementTo = (arr: string[], fromIndex: number, toIndex: number) => {
  let newArr = [...arr];
  var element = newArr[fromIndex];
  newArr.splice(fromIndex, 1);
  newArr.splice(toIndex, 0, element);
  return newArr;
};

/**
 * Moves the section visually down (right of the array)
 * @param encodedSectionName
 * @param sectionOrder
 */
const moveSectionDown = (
  encodedSectionName: string,
  sectionOrder: string[]
) => {
  let sectionIdx = sectionOrder.indexOf(encodedSectionName);
  let newSectionIdx = sectionIdx + 1;
  if (newSectionIdx > sectionOrder.length - 1) return;
  let newSectionOrder = moveElementTo(sectionOrder, sectionIdx, sectionIdx + 1);
  db.ref("private/forumOrder").set(newSectionOrder);
};

/**
 * Moves the section visually up (left of the array)
 * @param encodedSectionName
 * @param sectionOrder
 */
const moveSectionUp = (encodedSectionName: string, sectionOrder: string[]) => {
  let sectionIdx = sectionOrder.indexOf(encodedSectionName);
  let newSectionIdx = sectionIdx + 1;
  if (newSectionIdx < 0) return;
  let newSectionOrder = moveElementTo(sectionOrder, sectionIdx, sectionIdx - 1);
  db.ref("private/forumOrder").set(newSectionOrder);
};

export {
  getForumMetadata,
  createNewForumSection,
  radioHandler,
  deleteSection,
  swalDeleteSectionMessage,
  moveSectionDown,
  moveSectionUp,
};
