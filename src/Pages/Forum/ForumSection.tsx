import { useAuth } from "../../contexts/AuthContext";
import { TopicsMetadata } from "../../interfaces";
import { getDecodedString, userHasPermission } from "../../utils/generalFunctions";
import ForumTopicRow from "./ForumTopicRow";
import {
  deleteSection,
  moveSectionDown,
  moveSectionUp,
  swalDeleteSectionMessage,
} from "./forumUtils";

type Props = {
  encodedSectionName: string;
  topicsFromSection: TopicsMetadata;
  sectionOrder: string[];
};

const ForumSection = ({ encodedSectionName, topicsFromSection, sectionOrder }: Props) => {
  const { USER } = useAuth();
  const userWithPermissions = userHasPermission(USER);
  const sectionIdx = sectionOrder.indexOf(encodedSectionName);
  const isLast = sectionIdx === sectionOrder.length - 1;
  const isFirst = sectionIdx === 0;
  return (
    <div className="card mb-3">
      <div className="card-header pr-0 pl-0">
        <div className="row no-gutters align-items-center w-100">
          <div className="col font-weight-bold pl-3">
            {" "}
            {getDecodedString(encodedSectionName)}
            {!isFirst && userWithPermissions && (
              <span className={"ml-2 section-arrow cursor-pointer"}>
                <i
                  className="lnr-arrow-up text-muted fsize-1 section-move"
                  onClick={() => moveSectionUp(encodedSectionName, sectionOrder)}
                ></i>
              </span>
            )}
            {!isLast && userWithPermissions && (
              <span
                className={"section-arrow cursor-pointer ml-2"}
                onClick={() => moveSectionDown(encodedSectionName, sectionOrder)}
              >
                <i className="lnr-arrow-down text-muted fsize-1 section-move"></i>
              </span>
            )}
          </div>
          <div className="d-md-block col-6 text-muted">
            <div className="row no-gutters align-items-center">
              <div className="col-3">Threads</div>
              <div className="col-3">Replies</div>
              <div className="col-5">Last update</div>
              <div className="col-1">
                {userWithPermissions && (
                  <button
                    type="button"
                    id={"deleteSeason"}
                    onClick={() =>
                      swalDeleteSectionMessage(() =>
                        deleteSection(encodedSectionName, sectionOrder, topicsFromSection),
                      )
                    }
                    className="btn-icon btn-icon-only btn btn-shadow  btn-danger"
                  >
                    <i className="fas fa-trash btn-icon-wrapper fsize-1"> </i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Insert topics of section */}
      {topicsFromSection &&
        Object.entries(topicsFromSection).map(([encodedTopicName, topicInformation], idx) => (
          <ForumTopicRow
            key={encodedTopicName}
            encodedTopicName={encodedTopicName}
            topicInformation={topicInformation}
            encodedSectionName={encodedSectionName}
          />
        ))}
    </div>
  );
};

export default ForumSection;
