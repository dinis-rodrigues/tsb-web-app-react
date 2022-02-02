import React from "react";
import { Fragment } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Sponsor } from "../../interfaces";
import { sponsorInputHandler } from "./sponsorsUtils";
import NumberFormat from "react-number-format";

type Props = {
  sponsorInfo: Sponsor | null;
  setSponsorInfo: Function;
};

const SponsorModalInfo = ({ sponsorInfo, setSponsorInfo }: Props) => {
  const { isMarketingOrAdmin } = useAuth();
  let sponsorValue = 0;
  if (sponsorInfo?.history) {
    let vals = Object.entries(sponsorInfo.history).map(([_, val]) => val);
    sponsorValue = vals[vals.length - 1];
  }
  return (
    <Fragment>
      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Name</strong>
            </span>
          </label>

          <input
            value={sponsorInfo ? sponsorInfo.name : ""}
            readOnly={isMarketingOrAdmin ? false : true}
            onChange={(e) =>
              sponsorInputHandler(e.target.value, "name", setSponsorInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-quote-right"></i>
              <strong> Bracket</strong>
            </span>
          </label>

          <input
            value={sponsorInfo ? sponsorInfo.level : ""}
            readOnly
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-euro-sign"></i>
              <strong> Value</strong>
            </span>
          </label>

          <NumberFormat
            value={sponsorValue}
            readOnly
            onValueChange={(value) =>
              sponsorInputHandler(
                value.floatValue ? value.floatValue : 0,
                "value",
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
      </div>
      <div className="form-group row text-center">
        <div className="col">
          <label>
            <span className="text-dark small text-uppercase">
              <i className="fas fa-link"></i>
              <strong> Website</strong>
            </span>
          </label>

          <input
            value={sponsorInfo ? sponsorInfo.url : ""}
            readOnly={isMarketingOrAdmin ? false : true}
            onChange={(e) =>
              sponsorInputHandler(e.target.value, "url", setSponsorInfo)
            }
            type="text"
            className="form-control m-0 text-center"
            placeholder=""
          />
        </div>
      </div>
    </Fragment>
  );
};

export default SponsorModalInfo;
