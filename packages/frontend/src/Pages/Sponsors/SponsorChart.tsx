import { buildSponsorGraph, sponsorChartOptions } from "./sponsorsUtils";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import {
  SponsorChartData,
  SponsorHistory,
  SponsorRetroactives,
} from "../../interfaces";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  values: SponsorHistory | undefined;
  retroActives: SponsorRetroactives;
};
const SponsorChart = ({ values, retroActives }: Props) => {
  const { isDarkMode } = useAuth();
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<SponsorChartData[]>([]);

  useEffect(() => {
    buildSponsorGraph(values, retroActives, setChartSeries, setChartLabels);
  }, [values, retroActives]);
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
};

export default SponsorChart;
