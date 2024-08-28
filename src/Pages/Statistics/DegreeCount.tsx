import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { useAuth } from "../../contexts/AuthContext";
import { UserMetadata } from "../../interfaces";
import { apexPolarOptions, buildDepartmentPolarSeries } from "./statisticsUtils";

type Props = {
  usersMetadata: UserMetadata;
};
const DegreeCount = ({ usersMetadata }: Props) => {
  const { isDarkMode } = useAuth();
  const [degreeLabels, setDegreeLabels] = useState<string[]>([]);
  const [degreeData, setDegreeData] = useState<number[]>([]);
  useEffect(() => {
    buildDepartmentPolarSeries(usersMetadata, setDegreeData, setDegreeLabels);
  }, [usersMetadata]);
  apexPolarOptions.labels = degreeLabels;
  return (
    <>
      {degreeLabels.length > 0 && (
        <Chart
          // theme={{ mode: isDarkMode ? "dark" : "light" }}
          options={{
            ...apexPolarOptions,
            theme: { mode: isDarkMode ? "dark" : "light" },
          }}
          series={degreeData}
          labels={degreeLabels}
          type="polarArea"
          width="100%"
          height="350"
        />
      )}
    </>
  );
};

export default DegreeCount;
