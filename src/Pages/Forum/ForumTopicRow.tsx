import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { TopicInformation } from "../../interfaces";
import { dateDifference, getDecodedString, getUserProfileLink } from "../../utils/generalFunctions";

type Props = {
  encodedTopicName: string;
  encodedSectionName: string;
  topicInformation: TopicInformation;
};

const ForumTopicRow = ({ encodedSectionName, encodedTopicName, topicInformation }: Props) => {
  const { usersMetadata } = useAuth();
  return (
    <div className="card-body py-3">
      <div className="row no-gutters align-items-center">
        <div className="col">
          <Link
            to={`/forum/s/${encodedSectionName}/topic/${encodedTopicName}`}
            className="d-block text-truncate"
          >
            {getDecodedString(encodedTopicName)}
          </Link>
        </div>
        <div className=" d-md-block col-6">
          <div className="row no-gutters align-items-center">
            <div className="col-3">{topicInformation.numberThreads}</div>
            <div className="col-3">{topicInformation.numberReplies}</div>
            <div className="media col-6 align-items-center">
              <div className="media-body flex-truncate ml-2">
                <Link
                  to={`/forum/s/${encodedSectionName}/topic/${encodedTopicName}`}
                  className="d-block text-truncate"
                >
                  {topicInformation.latestUpdate}
                </Link>
                <div className="text-muted small text-truncate">
                  {dateDifference(topicInformation.latestUpdateTimestamp)} &nbsp;·&nbsp;
                  <Link
                    to={getUserProfileLink(topicInformation.latestUserUpdate)}
                    className="text-muted"
                  >
                    {usersMetadata[topicInformation.latestUserUpdate].pinfo.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumTopicRow;
