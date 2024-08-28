import { off, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ForumMetadata } from "../../interfaces";
import ForumCreateModal from "./ForumCreateModal";
import ForumSection from "./ForumSection";
import { getForumMetadata } from "./forumUtils";

const Forum = () => {
  const { USER } = useAuth();
  const [forumSectionOrder, setForumSectionOrder] = useState<string[]>([]);
  const [forumMetadata, setForumMetadata] = useState<ForumMetadata>({});
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  useEffect(() => {
    getForumMetadata(setForumMetadata, setForumSectionOrder);
    return () => {
      off(ref(db, "private/forumMetadata"));
      off(ref(db, "private/forumOrder"));
    };
  }, []);
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <h4 className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div>Forum</div>
          <div className="d-flex flex-wrap justify-content-between">
            <div>
              <button
                type="button"
                className="btn btn-shadow btn-wide btn-primary"
                onClick={() => setIsSectionModalOpen(true)}
              >
                <span className="btn-icon-wrapper pr-2 opacity-7">
                  <i className="fa fa-plus fa-w-20"></i>
                </span>
                New topic
              </button>
            </div>
          </div>
        </h4>
        {/* Existing Sections with Threads */}
        {Object.entries(forumMetadata).length > 0 &&
          forumSectionOrder.map((encodedSectionName) => (
            <ForumSection
              key={encodedSectionName}
              encodedSectionName={encodedSectionName}
              topicsFromSection={forumMetadata[encodedSectionName]}
              sectionOrder={forumSectionOrder}
            />
          ))}
      </div>
      <ForumCreateModal
        isSectionModalOpen={isSectionModalOpen}
        setIsSectionModalOpen={setIsSectionModalOpen}
        forumMetadata={forumMetadata}
        forumSectionOrder={forumSectionOrder}
        user={USER}
      />
    </div>
  );
};

export default withRouter(Forum);
