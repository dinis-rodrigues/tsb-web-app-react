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
import { CheckboxToggle } from "react-rainbow-components";

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

  const [filterTerm, setFilterTerm] = useState("");
  const [filterNoLogo, setFilterNoLogo] = useState(false);
  const [filterLowQualityLogo, setFilterLowQualityLogo] = useState(false);
  const [filterOutdatedValues, setFilterOutdatedValues] = useState(false);

  useEffect(() => {
    setInventorySponsors(sponsors);
  }, [sponsors]);

  // useEffect(() => {
  //   filterSponsors(
  //     "",
  //     filterOutdatedValues,
  //     filterNoLogo,
  //     filterLowQualityLogo,
  //     sponsors,
  //     setInventorySponsors
  //   );
  // }, [sponsors, filterNoLogo, filterLowQualityLogo, filterOutdatedValues]);

  return (
    <Fragment>
      <Input
        className="rainbow-p-around_medium"
        value={filterTerm}
        placeholder="Filter..."
        icon={<i className="fa fa-search"></i>}
        onChange={(e) => {
          setFilterTerm(e.target.value);
          filterSponsors(
            e.target.value,
            filterOutdatedValues,
            filterNoLogo,
            filterLowQualityLogo,
            sponsors,
            setInventorySponsors
          );
        }}
      />
      <div className="row">
        <CheckboxToggle
          label="Outdated Values:"
          labelAlignment="left"
          value={filterOutdatedValues}
          onChange={() => {
            setFilterOutdatedValues(!filterOutdatedValues);
            filterSponsors(
              filterTerm,
              !filterOutdatedValues,
              filterNoLogo,
              filterLowQualityLogo,
              sponsors,
              setInventorySponsors
            );
          }}
        />
        <CheckboxToggle
          label="Without Logo:"
          labelAlignment="left"
          value={filterNoLogo}
          onChange={() => {
            setFilterNoLogo(!filterNoLogo);
            filterSponsors(
              filterTerm,
              filterOutdatedValues,
              !filterNoLogo,
              filterLowQualityLogo,
              sponsors,
              setInventorySponsors
            );
          }}
        />
        <CheckboxToggle
          label="Low quality Logo:"
          labelAlignment="left"
          value={filterLowQualityLogo}
          onChange={() => {
            setFilterLowQualityLogo(!filterLowQualityLogo);
            filterSponsors(
              filterTerm,
              filterOutdatedValues,
              filterNoLogo,
              !filterLowQualityLogo,
              sponsors,
              setInventorySponsors
            );
          }}
        />
      </div>
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
