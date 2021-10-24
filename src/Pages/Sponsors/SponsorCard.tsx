import { forwardRef } from "react";
import { Sponsor } from "../../interfaces";
import SponsorImage from "./SponsorImage";
import { UncontrolledTooltip } from "reactstrap";
import {
  calculateRetroActives,
  removeSponsorFromBracket,
} from "./sponsorsUtils";

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
  retroActives: number[];
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
        <span style={{ position: "absolute", top: 0 }}>{`${totalVal} / ${
          retroVal + totalVal
        }`}</span>
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
        <span style={{ position: "absolute", bottom: 0 }}>{sponsor?.name}</span>
      </div>
    );
  }
);

export { SponsorCard };
