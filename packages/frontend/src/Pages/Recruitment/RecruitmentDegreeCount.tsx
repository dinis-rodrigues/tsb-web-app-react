import { useEffect, useState } from "react";
import { RecruitmentTable } from "../../interfaces";
import Chart from "react-apexcharts";
import {
  apexPolarOptions,
  buildRecruitmentPolarSeries,
} from "../Statistics/statisticsUtils";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  tableData: RecruitmentTable;
};
const RecruitmentDegreeCount = ({ tableData }: Props) => {
  const { isDarkMode } = useAuth();
  const [teamCount, setTeamCount] = useState(0);

  const [degreeLabels, setDegreeLabels] = useState<string[]>([]);
  const [degreeData, setDegreeData] = useState<number[]>([]);

  useEffect(() => {
    let totalCount = 0;
    Object.entries(tableData).forEach(([userId, user]) => {
      totalCount += 1;
    });
    setTeamCount(totalCount);
    buildRecruitmentPolarSeries(tableData, setDegreeData, setDegreeLabels);
  }, [tableData]);
  return (
    degreeLabels && (
      <div className="col-md">
        <div className="card-hover-shadow-2x mb-3 card">
          <div className="card-header">
            Degree Spread
            <div className="btn-actions-pane-right">
              <span className="badge badge-pill badge-dark">
                Applied: {teamCount}
              </span>
            </div>
          </div>
          {degreeLabels.length > 0 && (
            <Chart
              options={{
                ...apexPolarOptions,
                theme: { mode: isDarkMode ? "dark" : "light" },
                labels: degreeLabels,
              }}
              series={degreeData}
              type="polarArea"
              width="100%"
              height="350"
            />
          )}
        </div>
      </div>
    )
  );
};

export default RecruitmentDegreeCount;
