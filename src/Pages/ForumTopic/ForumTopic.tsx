import { off, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ThreadCreation, ThreadMetadata } from "../../interfaces";
import {
  getDecodedString,
  getEncodedString,
  userHasPermission,
} from "../../utils/generalFunctions";
import ForumCreateThreadModal from "./ForumCreateThreadModal";
import ForumThreadRow from "./ForumThreadRow";
import {
  checkIfThreadExists,
  deleteTopic,
  getEncodedForumTopicPaths,
  getForumTopicMetadata,
  swalDeleteTopicMessage,
} from "./forumTopicUtils";

const ForumTopic = (props: any) => {
  const { USER, usersMetadata } = useAuth();
  // Retrieve forum topic information from url
  // let { encodedSectionName, encodedTopicName }: routeForumTopic =
  //   props.match.params;

  // don't trust url parameters from react router, it auto encodes/decodes stuff
  // get it directly from url path
  let [encodedSectionName, encodedTopicName] = getEncodedForumTopicPaths();
  // Encode and Decode from scratch
  const decodedSectionName = getDecodedString(encodedSectionName);
  const decodedTopicName = getDecodedString(encodedTopicName);
  encodedSectionName = getEncodedString(decodedSectionName);
  encodedTopicName = getEncodedString(decodedTopicName);

  const [forumTopicMetadata, setForumTopicMetadata] = useState<[string, ThreadMetadata][]>([]);
  const [isCreateThreadModalOpen, setIsCreateThreadModalOpen] = useState(false);
  const [newThreadInfo, setNewThreadInfo] = useState<ThreadCreation>({
    title: "",
    label: { value: "None", label: "None" },
    description: "",
  });
  const [redirectTo, setRedirectTo] = useState(false);

  useEffect(() => {
    // check if topic exists, send the user to forum otherwise
    checkIfThreadExists(encodedSectionName, encodedTopicName).then((snapshot) => {
      if (!snapshot.val()) setRedirectTo(true);
      // Get user metadata for pictures, names etc
      // Now retrieve topic metadata with threads information of the topic if any
      getForumTopicMetadata(encodedSectionName, encodedTopicName, setForumTopicMetadata);
    });

    return () => {
      off(ref(db, `private/forumTopicMetadata/${encodedSectionName}/${encodedTopicName}`));
    };
  }, [encodedTopicName, encodedSectionName]);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="d-flex flex-wrap justify-content-between">
          <div className="page-title-subheading opacity-10">
            {/* BreadCrumbs */}
            <ol id="FTopicLocation" className="breadcrumb bg-transparent mb-0">
              <li className="breadcrumb-item">
                <Link to="/forum" className={"bread-link"}>
                  <i aria-hidden="true" className="fa fa-home"></i>
                </Link>
              </li>
              <li>
                <div className="breadcrumb-separator">/</div>
              </li>
              <li className="breadcrumb-item">
                <Link to="/forum" className={"bread-link"}>
                  {decodedSectionName}
                </Link>
              </li>
              <li>
                <div className="breadcrumb-separator">/</div>
              </li>
              <li className="active breadcrumb-item text-dark font-weight-bold">
                {decodedTopicName}
              </li>
            </ol>
          </div>
          <div className="col-md-3 p-0" style={{ marginBottom: "auto", marginTop: "auto" }}>
            <button
              type="button"
              className="float-right mr-1 btn btn-shadow btn-wide btn-primary"
              onClick={() => setIsCreateThreadModalOpen(true)}
            >
              <span className="btn-icon-wrapper pr-2 opacity-7">
                <i className="fa fa-plus fa-w-20"></i>
              </span>
              New thread
            </button>
            {userHasPermission(USER) && (
              <button
                type="button"
                className="float-right mr-1 btn btn-shadow  btn-danger"
                onClick={() =>
                  swalDeleteTopicMessage(() =>
                    deleteTopic(
                      USER,
                      forumTopicMetadata,
                      encodedSectionName,
                      encodedTopicName,
                      setRedirectTo,
                    ),
                  )
                }
              >
                <span className="btn-icon-wrapper pr-2 opacity-7">
                  <i className="fa fa-minus fa-w-20"></i>
                </span>
                Delete
              </button>
            )}
          </div>
        </div>
        <div className="card mb-3">
          <div className="card-header pr-0 pl-0">
            <div className="row no-gutters align-items-center w-100">
              <div className="col font-weight-bold pl-3"> {getDecodedString(encodedTopicName)}</div>
              <div className="col-4 text-muted">
                <div className="row no-gutters align-items-center">
                  <div className="col-4">Replies</div>
                  <div className="col-8">Last Update</div>
                </div>
              </div>
            </div>
          </div>
          {/* Insert threads */}
          {usersMetadata &&
            USER &&
            forumTopicMetadata.map(([encodedThreadName, threadInformation], idx) => (
              <ForumThreadRow
                key={idx}
                user={USER}
                usersMetadata={usersMetadata}
                encodedSectionName={encodedSectionName}
                encodedTopicName={encodedTopicName}
                encodedThreadName={encodedThreadName}
                threadInformation={threadInformation}
              />
            ))}
        </div>
        <ForumCreateThreadModal
          isCreateThreadModalOpen={isCreateThreadModalOpen}
          setIsCreateThreadModalOpen={setIsCreateThreadModalOpen}
          newThreadInfo={newThreadInfo}
          setNewThreadInfo={setNewThreadInfo}
          forumTopicMetadata={forumTopicMetadata}
          encodedSectionName={encodedSectionName}
          encodedTopicName={encodedTopicName}
          user={USER}
        />
      </div>
      {redirectTo && <Redirect to="/forum" />}
    </div>
  );
};

export default ForumTopic;
