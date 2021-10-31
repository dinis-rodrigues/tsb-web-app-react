import { Fragment, useState } from "react";
import { Sponsor, SponsorBracketsListDB } from "../../interfaces";
import InventorySponsorCard from "./InventorySponsorCard";
import SponsorModal from "./SponsorModal";

type Props = {
  retroActives: number[];
  sponsors: [string, Sponsor][];
  existingBrackets: SponsorBracketsListDB | undefined;
};
const Inventory = ({ retroActives, sponsors, existingBrackets }: Props) => {
  const [sponsorInfo, setSponsorInfo] = useState<Sponsor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sponsorId, setSponsorId] = useState("");
  const [currBracketId, setCurrBracketId] = useState();

  return (
    <Fragment>
      <div className="row">
        {sponsors &&
          sponsors.map(([sponsordUId, sponsor]) => {
            return (
              <div className="col-3" key={sponsordUId}>
                <InventorySponsorCard
                  sponsor={sponsor}
                  sponsorId={sponsordUId}
                  setSponsorInfo={setSponsorInfo}
                  setModalOpen={setModalOpen}
                  setSponsorId={setSponsorId}
                  existingBrackets={existingBrackets}
                  setCurrBracketId={setCurrBracketId}
                />
              </div>
            );
          })}
      </div>
      <SponsorModal
        retroActives={retroActives}
        bracketId={currBracketId}
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        sponsorInfo={sponsorInfo}
        setSponsorInfo={setSponsorInfo}
        sponsorId={sponsorId}
      />
    </Fragment>
  );
};

export default Inventory;
