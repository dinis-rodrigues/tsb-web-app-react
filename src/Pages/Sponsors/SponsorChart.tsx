import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useAuth } from "../../contexts/AuthContext";
import { SponsorChartData, SponsorHistory, SponsorRetroactives } from "../../interfaces";
import { buildSponsorGraph, sponsorChartOptions } from "./sponsorsUtils";

type Props = {
  values: SponsorHistory | undefined;
  retroActives: SponsorRetroactives;
  refreshChart: boolean;
  addRetroActives: boolean | undefined;
};
const SponsorChart = React.memo(
  ({ values, retroActives, refreshChart, addRetroActives }: Props) => {
    const { isDarkMode } = useAuth();
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [chartSeries, setChartSeries] = useState<SponsorChartData[]>([]);

    useEffect(() => {
      buildSponsorGraph(
        values ? values : {},
        retroActives,
        addRetroActives,
        setChartSeries,
        setChartLabels,
      );
    }, [values, retroActives, refreshChart, addRetroActives]);
    return (
      <div>
        <Chart
          options={{
            ...sponsorChartOptions,
            theme: { mode: isDarkMode ? "dark" : "light" },
            labels: chartLabels,
          }}
          series={chartSeries}
          type={"bar"}
          width="100%"
          height="300"
        />
      </div>
    );
  },
);

export default SponsorChart;
