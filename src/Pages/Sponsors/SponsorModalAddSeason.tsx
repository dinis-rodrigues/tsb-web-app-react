import React, { Fragment, useState } from "react";
import { Sponsor } from "../../interfaces";
import NumberFormat from "react-number-format";
import { useAuth } from "../../contexts/AuthContext";
import {
  addNewSeason,
  deleteSeason,
  editSeasonHandler,
  editSeasonValueHandler,
} from "./sponsorsUtils";

type Props = {
  sponsorInfo: Sponsor | null;
  setSponsorInfo: Function;
  setRefreshChart: Function;
};

const SponsorModalAddSeason = ({
  sponsorInfo,
  setSponsorInfo,
  setRefreshChart,
}: Props) => {
  const { isMarketingOrAdmin } = useAuth();
  const [focusInput, setFocusInput] = useState("");
  return (
    <Fragment>
      <div className="row form-group text-center">
        <div className="col-1"></div>
        <div className="col-5 text-dark small text-uppercase">Season</div>
        <div className="col-5 text-dark small text-uppercase">Value</div>
        <div className="col-1"></div>
        {sponsorInfo?.history &&
          Object.entries(sponsorInfo?.history).map(([season, value]) => {
            return (
              <Fragment key={season}>
                <div className="col-1"></div>
                <div className="col-5">
                  <NumberFormat
                    value={season.replace("-", "/")}
                    readOnly={isMarketingOrAdmin ? false : true}
                    className="form-control text-center"
                    format={"####/####"}
                    allowEmptyFormatting
                    mask="_"
                    autoFocus={season === focusInput}
                    onValueChange={(val) =>
                      editSeasonHandler(
                        val.formattedValue,
                        season,
                        sponsorInfo,
                        setSponsorInfo,
                        setFocusInput
                      )
                    }
                  />
                </div>
                <div className="col-5">
                  <NumberFormat
                    value={value}
                    readOnly={isMarketingOrAdmin ? false : true}
                    onValueChange={(value) =>
                      editSeasonValueHandler(
                        value.floatValue ? value.floatValue : 0,
                        season,
                        sponsorInfo,
                        setSponsorInfo
                      )
                    }
                    decimalScale={2}
                    fixedDecimalScale={true}
                    suffix={" €"}
                    thousandSeparator={" "}
                    className="form-control text-center"
                    placeholder="  €"
                  />
                </div>

                <div className="col-1 justify-content-center d-flex align-items-center">
                  {isMarketingOrAdmin && (
                    <span
                      className={"float-right cursor-pointer text-danger"}
                      onClick={() => {
                        deleteSeason(season, sponsorInfo, setSponsorInfo);
                        setRefreshChart((state: boolean) => !state);
                      }}
                    >
                      <i className="fa fa-times"></i>
                    </span>
                  )}
                </div>
              </Fragment>
            );
          })}
      </div>

      {isMarketingOrAdmin && (
        <div className="row">
          <div className="col-4"></div>
          <div className="col d-flex justify-content-center">
            <button
              className="btn btn-outline-success"
              onClick={() => addNewSeason(sponsorInfo, setSponsorInfo)}
            >
              Add Season
            </button>
          </div>
          <div className="col-4"></div>
        </div>
      )}
    </Fragment>
  );
};

export default SponsorModalAddSeason;
