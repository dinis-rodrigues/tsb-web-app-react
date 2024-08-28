import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { attendanceArrayRechart, graphColor } from "../../interfaces";
import { customTooltip } from "./attendanceUtils";

type Props = {
  chartOptions: graphColor;
  chartSeries: attendanceArrayRechart[];
};

const AttendanceChart = React.memo(({ chartOptions, chartSeries }: Props) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={160}
        height={50}
        data={chartSeries}
        margin={{
          top: 10,
          right: 20,
          left: 0,
          bottom: 10,
        }}
      >
        <defs>
          <linearGradient id={chartOptions.name} x1="0" y1="0" x2="0" y2="1">
            <stop stopOpacity="0.65" stopColor={chartOptions.gradient1} offset="0"></stop>
            <stop stopOpacity="0.5" stopColor={chartOptions.gradient2} offset="1"></stop>
            <stop stopOpacity="0.5" stopColor={chartOptions.gradient3} offset="1"></stop>
          </linearGradient>
        </defs>
        <Tooltip content={customTooltip} />
        <Area
          animationDuration={500}
          type="monotone"
          dataKey="y"
          stroke={chartOptions.strokeColor}
          strokeWidth={"2px"}
          fill={`url(#${chartOptions.name})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

export default AttendanceChart;
