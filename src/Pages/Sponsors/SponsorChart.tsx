import { buildSponsorGraph, sponsorChartOptions } from "./sponsorsUtils";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import { Sponsor, SponsorChartData, SponsorHistory } from "../../interfaces";

type Props = {
  sponsorInfo: Sponsor | null;
  retroActives: number[];
};
const SponsorChart = ({ sponsorInfo, retroActives }: Props) => {
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [chartSeries, setChartSeries] = useState<SponsorChartData[]>([]);

  useEffect(() => {
    buildSponsorGraph(
      sponsorInfo?.history,
      retroActives,
      setChartSeries,
      setChartLabels
    );
  }, [sponsorInfo, retroActives]);
  return (
    <div>
      <Chart
        options={{ ...sponsorChartOptions, labels: chartLabels }}
        series={chartSeries}
        type={"bar"}
        width="100%"
        height="300"
      />
    </div>
  );
};

export default SponsorChart;
