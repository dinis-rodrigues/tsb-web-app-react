import { Fragment, useEffect, useState } from "react";
import { Input } from "react-rainbow-components";
import {
  Sponsor,
  SponsorBracketsListDB,
  SponsorRetroactives,
} from "../../interfaces";
import InventorySponsorCard from "./InventorySponsorCard";
import SponsorModal from "./SponsorModal";
import { filterSponsors } from "./sponsorsUtils";

type Props = {
  retroActives: SponsorRetroactives;
  sponsors: [string, Sponsor][];
  existingBrackets: SponsorBracketsListDB | undefined;
};
const Inventory = ({ retroActives, sponsors, existingBrackets }: Props) => {
  const [sponsorInfo, setSponsorInfo] = useState<Sponsor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sponsorId, setSponsorId] = useState("");
  const [currBracketId, setCurrBracketId] = useState();

  const [inventorySponsors, setInventorySponsors] =
    useState<[string, Sponsor][]>(sponsors);

  useEffect(() => {
    setInventorySponsors(sponsors);
  }, [sponsors]);

  return (
    <Fragment>
      <Input
        className="rainbow-p-around_medium"
        placeholder="Filter..."
        icon={<i className="fa fa-search"></i>}
        onChange={(e) =>
          filterSponsors(e.target.value, sponsors, setInventorySponsors)
        }
      />
      <div className="row">
        {inventorySponsors &&
          inventorySponsors.map(([sponsordUId, sponsor]) => {
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
        mockSponsorInfo={sponsorInfo}
        setSponsorInfo={setSponsorInfo}
        sponsorId={sponsorId}
      />
    </Fragment>
  );
};

export default Inventory;
