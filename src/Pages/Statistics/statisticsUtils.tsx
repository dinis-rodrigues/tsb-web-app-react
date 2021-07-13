import { ApexOptions } from "apexcharts";
import { UserMetadata } from "../../interfaces";

const apexPolarOptions: ApexOptions = {
  chart: {
    id: "polar",
    height: 350,
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
  stroke: {
    show: true,
    width: 2,
  },
  dataLabels: {
    enabled: true,
  },
  markers: {
    size: 0,
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
  setChartLables: Function
) => {
  let degreeCounts: { [key: string]: number } = {};
  let degreeNames: string[] = [];
  Object.entries(usersMetadata).forEach(([userId, user]) => {
    if (user.pinfo.inTeam) {
      let degree = user.pinfo.degree;
      if (degree && degreeCounts.hasOwnProperty(degree)) {
        degreeCounts[degree] += 1;
      } else if (degree && !degreeCounts.hasOwnProperty(degree)) {
        degreeCounts[degree] = 1;
        degreeNames.push(degree);
      }
    }
  });
  // build degree count array
  let degreeCountArray: number[] = [];
  degreeNames.forEach((degreeName) => {
    degreeCountArray.push(degreeCounts[degreeName]);
  });
  setChartSeries(degreeCountArray);
  setChartLables(degreeNames);
};

export { apexPolarOptions, buildDepartmentPolarSeries };
