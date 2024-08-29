import { ApexOptions } from "apexcharts";
import { RecruitmentTable, UserMetadata } from "../../interfaces";

const apexBarOptions: ApexOptions = {
  chart: {
    height: 350,
    type: "bar",
  },
  fill: {
    colors: ["#03A9F4"],
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: "top", // top, center, bottom
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number, opts) => {
      const data: number[] = opts.w.config.series[0].data;
      const sum = data.reduce((a, b) => a + b, 0);
      const percent = (val / sum) * 100;
      return `${percent.toFixed(0)}%`;
    },
    offsetY: 10,
    style: {
      fontSize: "12px",
      colors: ["#fff", "#03A9F4", "#4CAF50", "#F9CE1D", "#FF9800"],
    },
  },

  xaxis: {
    position: "top",
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    crosshairs: {
      fill: {
        type: "gradient",
        gradient: {
          colorFrom: "#D8E3F0",
          colorTo: "#BED1E6",
          stops: [0, 100],
          opacityFrom: 0.4,
          opacityTo: 0.5,
        },
      },
    },
    tooltip: {
      enabled: true,
    },
  },
  yaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: true,
    },
    labels: {
      show: true,
      formatter: (val) => val.toString(),
    },
  },
};

const apexPolarOptions: ApexOptions = {
  chart: {
    id: "polar",
    height: 500,
    zoom: {
      autoScaleYaxis: true,
    },
    toolbar: {
      show: true,
      offsetX: 0,
      offsetY: 0,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        customIcons: [],
      },
    },
  },
  yaxis: {
    labels: {
      formatter: (value: number) => {
        return Math.round(value).toString();
      },
    },
  },
  stroke: {
    show: true,
    width: 2,
  },
  dataLabels: {
    enabled: true,
    // @ts-ignore
    formatter: (value: number, { seriesIndex, dataPointIndex, w }) => {
      const degree = w.config.labels[seriesIndex];
      return [degree, `${Number(value).toFixed(1).toString()} %`];
    },
  },
  markers: {
    size: 0,
  },
  plotOptions: {
    polarArea: {
      rings: {
        strokeColor: "#e0e0e0",
      },
      spokes: {
        strokeWidth: 0,
      },
    },
  },
};

/**
 * Builds the data for the degree count
 * @param usersMetadata
 * @param setChartSeries
 * @param setChartLables
 */
const buildDepartmentPolarSeries = (
  usersMetadata: UserMetadata,
  setChartSeries: Function,
  setChartLables: Function,
) => {
  const degreeCounts: { [key: string]: number } = {};
  const degreeNames: string[] = [];
  Object.entries(usersMetadata).forEach(([userId, user]) => {
    if (user.pinfo.inTeam) {
      const degree = user.pinfo.degree;
      if (degree && Object.hasOwn(degreeCounts, degree)) {
        degreeCounts[degree] += 1;
      } else if (degree && !Object.hasOwn(degreeCounts, degree)) {
        degreeCounts[degree] = 1;
        degreeNames.push(degree);
      }
    }
  });
  // build degree count array
  const degreeCountArray: number[] = [];
  degreeNames.forEach((degreeName) => {
    degreeCountArray.push(degreeCounts[degreeName]);
  });
  setChartSeries(degreeCountArray);
  setChartLables(degreeNames);
};

/**
 * Builds the data for the degree count
 * @param usersMetadata
 * @param setChartSeries
 * @param setChartLables
 */
const buildRecruitmentPolarSeries = (
  tableData: RecruitmentTable,
  setChartSeries: Function,
  setChartLables: Function,
) => {
  const degreeCounts: { [key: string]: number } = {};
  let degreeNames: string[] = [];
  Object.entries(tableData).forEach(([userId, user]) => {
    const degree = user.degree;
    if (degree && Object.hasOwn(degreeCounts, degree)) {
      degreeCounts[degree] += 1;
    } else if (degree && !Object.hasOwn(degreeCounts, degree)) {
      degreeCounts[degree] = 1;
      degreeNames.push(degree);
    }
  });
  // build degree count array
  const degreeCountArray: number[] = [];
  degreeNames.forEach((degreeName) => {
    degreeCountArray.push(degreeCounts[degreeName]);
  });
  degreeNames = degreeNames.map((degree) => {
    return degree.length > 6 ? degree.substring(0, 7) : degree;
  });
  setChartSeries(degreeCountArray);
  setChartLables(degreeNames);
};

/**
 * Builds the data for the year count
 * @param usersMetadata
 * @param setChartSeries
 * @param setChartLables
 */
const buildRecruitmentBarSeries = (
  tableData: RecruitmentTable,
  setChartSeries: Function,
  setChartLables: Function,
) => {
  const yearCounts: { [key: string]: number } = {};
  const yearNames: string[] = [];
  Object.entries(tableData).forEach(([userId, user]) => {
    const year = user.year;
    if (year && Object.hasOwn(yearCounts, year)) {
      yearCounts[year] += 1;
    } else if (year && !Object.hasOwn(yearCounts, year)) {
      yearCounts[year] = 1;
      yearNames.push(year);
    }
  });
  // build degree count array
  const degreeCountArray: number[] = [];
  yearNames.sort();
  yearNames.forEach((degreeName) => {
    degreeCountArray.push(yearCounts[degreeName]);
  });
  setChartSeries([{ name: "Count", data: degreeCountArray }]);
  setChartLables(yearNames);
};

/**
 * Builds the data for the year count
 * @param usersMetadata
 * @param setChartSeries
 * @param setChartLables
 */
const buildRecruitmentBarDepartmentSeries = (
  tableData: RecruitmentTable,
  setChartSeries: Function,
  setChartLables: Function,
) => {
  const departments: string[] = [];
  if (!tableData) return;
  Object.entries(tableData).forEach(([key, user]) => {
    user.departments.forEach((dep) => {
      if (!departments.includes(dep)) departments.push(dep);
    });
  });
  departments.sort();

  const departmentCounts: { [key: string]: number } = {};
  const departmentNames: string[] = [];
  Object.entries(tableData).forEach(([userId, user]) => {
    const userDepartments = user.departments;
    userDepartments &&
      userDepartments.forEach((dep) => {
        if (dep && Object.hasOwn(departmentCounts, dep)) {
          departmentCounts[dep] += 1;
        } else if (dep) {
          departmentCounts[dep] = 1;
          departmentNames.push(dep);
        }
      });
  });
  // build degree count array
  const degreeCountArray: number[] = [];
  departmentNames.sort();
  departmentNames.forEach((degreeName) => {
    degreeCountArray.push(departmentCounts[degreeName]);
  });
  setChartSeries([{ name: "Count", data: degreeCountArray }]);
  setChartLables(departmentNames);
};

export {
  apexBarOptions,
  apexPolarOptions,
  buildDepartmentPolarSeries,
  buildRecruitmentBarDepartmentSeries,
  buildRecruitmentBarSeries,
  buildRecruitmentPolarSeries,
};
