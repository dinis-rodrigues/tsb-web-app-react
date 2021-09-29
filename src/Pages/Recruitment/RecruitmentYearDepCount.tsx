import { useEffect, useState } from "react";
import { RecruitmentTable } from "../../interfaces";
import Chart from "react-apexcharts";
import { Nav, NavItem, NavLink } from "reactstrap";
import cx from "classnames";
import {
  apexBarOptions,
  buildRecruitmentBarDepartmentSeries,
  buildRecruitmentBarSeries,
} from "../Statistics/statisticsUtils";
import { switchBarChart } from "./recruitmentUtils";

type Props = {
  tableData: RecruitmentTable;
};
const RecruitmentDegreeCount = ({ tableData }: Props) => {
  const [teamCount, setTeamCount] = useState(0);

  const [activeTab, setActiveTab] = useState("0");

  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<number[]>([]);

  useEffect(() => {
    let totalCount = 0;
    Object.entries(tableData).forEach(([userId, user]) => {
      totalCount += 1;
    });
    setTeamCount(totalCount);
    // buildRecruitmentBarSeries(tableData, setChartSeries, setChartLabels);
    if (activeTab && activeTab === "0")
      buildRecruitmentBarDepartmentSeries(
        tableData,
        setChartSeries,
        setChartLabels
      );
    else if (activeTab)
      buildRecruitmentBarSeries(tableData, setChartSeries, setChartLabels);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableData]);
  return (
    chartLabels && (
      <div className="col-md">
        <div className="card-hover-shadow-2x mb-3 card">
          <div className="card-header">
            <Nav
              className={"body-tabs-shadow tabs-animated body-tabs-animated"}
            >
              <NavItem>
                <NavLink
                  className={cx({ active: activeTab === "0" }, "card-title")}
                  onClick={() =>
                    switchBarChart(
                      "0",
                      activeTab,
                      tableData,
                      setChartSeries,
                      setChartLabels,
                      setActiveTab
                    )
                  }
                >
                  Department Count
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={cx({ active: activeTab === "1" }, "card-title")}
                  onClick={() =>
                    switchBarChart(
                      "1",
                      activeTab,
                      tableData,
                      setChartSeries,
                      setChartLabels,
                      setActiveTab
                    )
                  }
                >
                  Year Count
                </NavLink>
              </NavItem>
            </Nav>
            {/* <span className={"btn btn-primary"}>Year Count</span>
            <span>Department Count</span> */}
            <div className="btn-actions-pane-right">
              <span className="badge badge-pill badge-dark">
                Applied: {teamCount}
              </span>
            </div>
          </div>
          {chartLabels.length > 0 && (
            <Chart
              options={{ ...apexBarOptions, labels: chartLabels }}
              series={chartSeries}
              type={"bar"}
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
