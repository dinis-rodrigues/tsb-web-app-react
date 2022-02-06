import React, { Fragment, useState } from "react";
import { Sponsor } from "../../interfaces";
import NumberFormat from "react-number-format";
import { useAuth } from "../../contexts/AuthContext";
import { ButtonGroup, Button } from "react-rainbow-components";
import {
  addNewSeason,
  deleteSeason,
  editSeasonHandler,
  editSeasonValueHandler,
  updateSponsorStatus,
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
      <div className="row form-group text-center justify-content-center">
        <div className="col-3 text-dark small text-uppercase">Season</div>
        <div className="col-3 text-dark small text-uppercase">Value</div>
        <div className="col-4 text-dark small text-uppercase">Details</div>
        <div className="col-1 text-dark small text-uppercase">Remove</div>
      </div>

      {sponsorInfo?.history &&
        Object.entries(sponsorInfo?.history).map(([season, seasonValue]) => {
          return (
            <div
              className="row mt-2 justify-content-center text-center"
              key={season}
            >
              <div className="col-3">
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
              <div className="col-3">
                <NumberFormat
                  value={
                    seasonValue.value === 0 ||
                    seasonValue.status === 0 ||
                    seasonValue.status === 1
                      ? ""
                      : seasonValue.value
                  }
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
                  placeholder="0.00 €"
                />
              </div>
              <div className="col-4">
                <ButtonGroup>
                  <Button
                    label="Denied"
                    variant={
                      seasonValue.status === 0 ? "destructive" : "neutral"
                    }
                    onClick={() =>
                      updateSponsorStatus(
                        0,
                        season,
                        sponsorInfo,
                        setSponsorInfo
                      )
                    }
                  />
                  <Button
                    label="Skip"
                    variant={seasonValue.status === 1 ? "brand" : "neutral"}
                    onClick={() =>
                      updateSponsorStatus(
                        1,
                        season,
                        sponsorInfo,
                        setSponsorInfo
                      )
                    }
                  />
                  <Button
                    label="Rounded"
                    variant={seasonValue.status === 2 ? "brand" : "neutral"}
                    onClick={() =>
                      updateSponsorStatus(
                        2,
                        season,
                        sponsorInfo,
                        setSponsorInfo
                      )
                    }
                  />
                </ButtonGroup>
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
            </div>
          );
        })}

      {isMarketingOrAdmin && (
        <div className="row mt-3">
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
