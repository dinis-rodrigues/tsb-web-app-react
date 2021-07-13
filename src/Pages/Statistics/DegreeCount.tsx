import { Fragment, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { UserMetadata } from "../../interfaces";
import {
  apexPolarOptions,
  buildDepartmentPolarSeries,
} from "./statisticsUtils";

type Props = {
  usersMetadata: UserMetadata;
};
const DegreeCount = ({ usersMetadata }: Props) => {
  const [degreeLabels, setDegreeLabels] = useState<string[]>([]);
  const [degreeData, setDegreeData] = useState<number[]>([]);
  useEffect(() => {
    buildDepartmentPolarSeries(usersMetadata, setDegreeData, setDegreeLabels);
  }, [usersMetadata]);
  // console.log(degreeLabels);
  apexPolarOptions.labels = degreeLabels;
  return (
    <Fragment>
      {degreeLabels.length > 0 && (
        <Chart
          options={apexPolarOptions}
          series={degreeData}
          labels={degreeLabels}
          type="polarArea"
          width="100%"
          height="350"
        />
      )}
    </Fragment>
  );
};

export default DegreeCount;
