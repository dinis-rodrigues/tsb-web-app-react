import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import DegreeCount from "../Statistics/DegreeCount";

const DashBoardDegreeCount = () => {
  const { usersMetadata } = useAuth();
  const [teamCount, setTeamCount] = useState(0);
  useEffect(() => {
    let totalCount = 0;
    Object.entries(usersMetadata).forEach(([userId, user]) => {
      if (user.pinfo.inTeam) totalCount += 1;
    });
    setTeamCount(totalCount);
  }, [usersMetadata]);
  return (
    <div className="col-md">
      <div className="card-hover-shadow-2x mb-3 card">
        <div className="card-header">
          Degree Spread
          <div className="btn-actions-pane-right">
            <span className="badge badge-pill badge-dark">Members: {teamCount}</span>
          </div>
        </div>
        <DegreeCount usersMetadata={usersMetadata} />
      </div>
    </div>
  );
};

export default DashBoardDegreeCount;
