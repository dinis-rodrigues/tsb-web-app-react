import { Sponsor, SponsorBracketsDB } from "../../interfaces";
import { getMatchingBracketId } from "./sponsorsUtils";

type Props = {
  sponsor: Sponsor;
  sponsorId: string;
  existingBrackets: SponsorBracketsDB | undefined;
  setCurrBracketId: Function;
  setSponsorInfo: Function;
  setModalOpen: Function;
  setSponsorId: Function;
};

const InventorySponsorCard = ({
  sponsor,
  sponsorId,
  existingBrackets,
  setCurrBracketId,
  setSponsorInfo,
  setModalOpen,
  setSponsorId,
}: Props) => {
  return (
    <div
      className="inventory-card kanban-item card-btm-border"
      onClick={() => {
        getMatchingBracketId(sponsor, existingBrackets, setCurrBracketId);
        setModalOpen(true);
        setSponsorInfo(sponsor);
        setSponsorId(sponsorId);
      }}
    >
      <div className="row">
        <div className="col text-center task-title">{sponsor.name}</div>
      </div>
    </div>
  );
};

export default InventorySponsorCard;
