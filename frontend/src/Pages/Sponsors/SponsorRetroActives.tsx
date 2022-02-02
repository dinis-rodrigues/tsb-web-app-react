import { Fragment, useEffect, useState } from "react";

import Select from "react-select";
import Chart from "react-apexcharts";
import NumberFormat from "react-number-format";
import { useAuth } from "../../contexts/AuthContext";
import { SponsorRetroactives } from "../../interfaces";
import { selectStyles } from "../Profile/profileUtils";
import {
  addRetroYear,
  deleteRetroYear,
  editRetroValueHandler,
  retroChartOptions,
  retroSelectHandler,
  retroThresholdHandler,
  saveRetroActives,
} from "./sponsorsUtils";

type Props = {
  retroActives: SponsorRetroactives;
  setRetroActives: Function;
};

const SponsorRetroActives = ({ retroActives, setRetroActives }: Props) => {
  const { isDarkMode, isMarketingOrAdmin } = useAuth();

  const [chartSeries, setChartSeries] = useState([
    { name: "Values", data: retroActives.values },
  ]);

  useEffect(() => {
    setChartSeries([{ name: "Values", data: retroActives.values }]);
  }, [retroActives]);

  return (
    <div>
      <Chart
        options={{
          ...retroChartOptions,
          theme: { mode: isDarkMode ? "dark" : "light" },
        }}
        series={chartSeries}
        type="area"
        width="100%"
        height="300"
      />

      <div className="card card-body">
        <div className="row">
          <div className="col text-center font-size-md">
            <p>
              Sponsor retro-actives depend on the current year value. If the
              value is below the threshold, then no retro-actives will be
              calculated.
            </p>
            <p>
              In other words, the sponsor needs to give at least the value of
              the threshold to have retro-actives.
            </p>
          </div>
        </div>
        <hr className="divider" />
        <div className="row mt-3">
          <div className="col-1"></div>
          <div className="col-5 text-dark text-center small text-uppercase">
            <span className="text-dark text-uppercase">
              <strong>Threshold</strong>
            </span>
          </div>

          <div className="col-5 text-dark text-center small text-uppercase">
            <span className="text-dark text-uppercase">
              <strong>Apply Retro-Actives ?</strong>
            </span>
          </div>
          <div className="col-1"></div>

          <div className="col-1"></div>
          <div className="col-5">
            <NumberFormat
              value={retroActives.threshold}
              className="form-control text-center"
              allowEmptyFormatting
              onValueChange={(val) =>
                retroThresholdHandler(
                  val.floatValue ? val.floatValue : 0,
                  retroActives,
                  setRetroActives
                )
              }
            />
          </div>
          <div className="col-5">
            <Select
              classNamePrefix="react-select-container"
              onChange={(e) =>
                retroSelectHandler(e!.value, retroActives, setRetroActives)
              }
              value={{
                value: retroActives.isActive ? "Yes" : "No",
                label: retroActives.isActive ? "Yes" : "No",
              }}
              options={[
                { value: "Yes", label: "Yes" },
                { value: "No", label: "No" },
              ]}
              theme={(theme) => selectStyles(theme, false, isDarkMode)}
              styles={{
                // Fixes the overlapping problem of the component with the datepicker
                menu: (provided) => ({ ...provided, zIndex: 9999 }),
              }}
            />
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-1"></div>
          <div className="col-5 text-dark text-center small text-uppercase">
            <span className="text-dark text-uppercase">
              <strong>Year</strong>
            </span>
          </div>
          <div className="col-5 text-dark text-center small text-uppercase">
            <span className="text-dark text-uppercase">
              <strong> Multiplier</strong>
            </span>
          </div>
          <div className="col-1"></div>

          {retroActives &&
            retroActives.values.map((value, idx) => {
              return (
                <Fragment key={idx}>
                  <div className="col-1"></div>
                  <div className="col-5">
                    <NumberFormat
                      value={idx + 1}
                      readOnly
                      className="form-control text-center"
                      allowEmptyFormatting
                      mask="_"
                    />
                  </div>
                  <div className="col-5">
                    <NumberFormat
                      value={value}
                      readOnly={isMarketingOrAdmin ? false : true}
                      onValueChange={(val) =>
                        editRetroValueHandler(
                          val.floatValue ? val.floatValue : 0,
                          idx,
                          retroActives,
                          setRetroActives
                        )
                      }
                      className="form-control text-center"
                    />
                  </div>

                  <div className="justify-content-center d-flex align-items-center">
                    {isMarketingOrAdmin && (
                      <span
                        className={"cursor-pointer text-danger"}
                        onClick={() =>
                          deleteRetroYear(idx, retroActives, setRetroActives)
                        }
                      >
                        <i className="fa fa-times"></i>
                      </span>
                    )}
                  </div>
                </Fragment>
              );
            })}
        </div>
        <div className="row mt-4">
          <div className="col-4"></div>
          <div className="col d-flex justify-content-center">
            <button
              className="btn btn-outline-info"
              onClick={() => addRetroYear(retroActives, setRetroActives)}
            >
              Add Year
            </button>
            <button
              className="btn btn-outline-success ml-2"
              onClick={() => saveRetroActives(retroActives)}
            >
              Save
            </button>
          </div>
          <div className="col-4"></div>
        </div>
      </div>
    </div>
  );
};

export default SponsorRetroActives;
