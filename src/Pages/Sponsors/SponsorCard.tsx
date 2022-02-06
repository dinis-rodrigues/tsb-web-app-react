import { forwardRef } from "react";
import { Sponsor, SponsorHistory, SponsorRetroactives } from "../../interfaces";
import SponsorImage from "./SponsorImage";
import { UncontrolledTooltip } from "reactstrap";
import {
  calculateRetroActives,
  removeSponsorFromBracket,
  getCurrentSeasonYear,
} from "./sponsorsUtils";
import { useAuth } from "../../contexts/AuthContext";

type Props = {
  sponsor: Sponsor;
  sponsorId: string;
  bracketid: string;
  setCurrBracketId: Function;
  setModalIsOpen: Function;
  setSponsorInfo: Function;
  setSponsorId: Function;
  index: number;
  faded?: boolean;
  style?: any;
  retroActives: SponsorRetroactives;
};

const missingBadge = (history: SponsorHistory | undefined) => {
  const currSeason = getCurrentSeasonYear();

  if (!history)
    return <span className="badge badge-pill badge-danger">Missing</span>;
  if (!history[currSeason])
    return <span className="badge badge-pill badge-warning">Outdated</span>;
  return null;
};

const badQualityBadge = (sponsor: Sponsor) => {
  if (sponsor.isBadQualityLogo)
    return <span className="badge badge-pill badge-danger">Bad Logo</span>;

  return null;
};

const formatNumber = (num: number | string) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const returnTotalVal = (totalVal: number) => {
  return formatNumber(totalVal ? Number(totalVal).toFixed(0) : 0);
};

const returnRetroVal = (retroVal: number, totalVal: number) => {
  return formatNumber(
    retroVal + totalVal ? Number(retroVal + totalVal).toFixed(0) : 0
  );
};

const SponsorCard = forwardRef<HTMLInputElement, Props>(
  (
    {
      sponsor,
      sponsorId,
      bracketid,
      setCurrBracketId,
      index,
      faded,
      style,
      setSponsorInfo,
      setModalIsOpen,
      setSponsorId,
      retroActives,
      ...props
    },
    ref
  ) => {
    const { isMarketingOrAdmin } = useAuth();
    const { simpleValues, retroValues } = calculateRetroActives(
      sponsor?.history,
      retroActives
    );
    let [totalVal, retroVal] = [0, 0];
    if (simpleValues) {
      totalVal = simpleValues[simpleValues.length - 1];
      retroVal = retroValues[retroValues.length - 1];
    }
    return (
      <div
        ref={ref}
        className="sponsor-card"
        style={{ ...style, position: "relative" }}
        {...props}
      >
        <span style={{ position: "absolute", top: 0 }}>
          {returnTotalVal(totalVal)}{" "}
          {(sponsor.isRetroActive === undefined || sponsor.isRetroActive) &&
            `/ ${returnRetroVal(retroVal, totalVal)}`}
        </span>
        <button
          style={{ position: "absolute", top: -2, left: -2 }}
          className="btn border-0 btn-transition btn-outline-info"
          onClick={() => {
            setCurrBracketId(bracketid);
            setSponsorInfo({ ...sponsor });
            setSponsorId(sponsorId);
            setModalIsOpen(true);
          }}
        >
          <i className="fa fa-edit "></i>
        </button>

        <SponsorImage svgPath={sponsor?.svgPath} />
        {isMarketingOrAdmin && (
          <>
            <button
              id={`${sponsorId}-del`}
              style={{ position: "absolute", top: -2, right: -2 }}
              className="btn border-0 btn-transition btn-outline-danger"
              onClick={() => {
                removeSponsorFromBracket(sponsorId, bracketid);
              }}
            >
              <i className="fa fa-times "></i>
            </button>
            <UncontrolledTooltip placement="top" target={`${sponsorId}-del`}>
              Remove from bracket
            </UncontrolledTooltip>
          </>
        )}
        <span
          className="d-flex justify-content-center flex-column text-center mb-1"
          style={{ position: "absolute", bottom: 0 }}
        >
          <div>
            {missingBadge(sponsor?.history)} {badQualityBadge(sponsor)}
          </div>
          <div>{sponsor?.name}</div>
        </span>
      </div>
    );
  }
);

export { SponsorCard };
