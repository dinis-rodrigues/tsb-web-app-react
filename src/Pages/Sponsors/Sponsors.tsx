import cx from "classnames";
import { off, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  Sponsor,
  SponsorBracketListItem,
  SponsorBracketsListDB,
  SponsorRetroactives,
} from "../../interfaces";
import BracketModal from "./BracketModal";
import Inventory from "./Inventory";
import SponsorBracket from "./SponsorBracket";
import SponsorModal from "./SponsorModal";
import SponsorRetroActives from "./SponsorRetroActives";
import {
  bracketSkeleton,
  getAllSponsorBrackets,
  getInventorySponsors,
  getLastEditionDate,
  getRetroActives,
  publishSponsorsToWebsite,
  retroActivesSkeleton,
  sponsorSkeleton,
} from "./sponsorsUtils";

const Sponsors = () => {
  const { isMarketingOrAdmin } = useAuth();
  const [brackets, setBrackets] = useState<[string, SponsorBracketListItem][]>();
  const [retroActives, setRetroActives] = useState<SponsorRetroactives>(retroActivesSkeleton);
  const [activeTab, setactiveTab] = useState("Sponsors");

  const [newSponsorInfo, setNewSponsorInfo] = useState(sponsorSkeleton);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newBracketInfo, setNewBracketInfo] = useState(bracketSkeleton);
  const [createBracketModalOpen, setCreateBracketModalOpen] = useState(false);

  const [existingBrackets, setExistingBrackets] = useState<SponsorBracketsListDB>();
  const [sponsors, setSponsors] = useState<[string, Sponsor][]>([]);

  const [lastEditionDate, setLastEditionDate] = useState<string>("");

  useEffect(() => {
    getAllSponsorBrackets(setBrackets);
    getRetroActives(setRetroActives);
    getInventorySponsors(setSponsors, setExistingBrackets);
    getLastEditionDate(setLastEditionDate);
    return () => {
      off(ref(db, "private/sponsors/brackets"));
      off(ref(db, "private/sponsors/retroActives"));
      off(ref(db, "private/sponsors/inventory"));
      off(ref(db, "private/sponsors/bracketsList"));
    };
  }, []);
  return (
    <>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="row">
            <div className="col">
              <Nav className={"body-tabs body-tabs-layout tabs-animated body-tabs-animated pt-0"}>
                <NavItem key={"Sponsors"}>
                  <NavLink
                    className={cx({ active: activeTab === "Sponsors" })}
                    onClick={() => {
                      setactiveTab("Sponsors");
                    }}
                  >
                    <span>Sponsors</span>
                  </NavLink>
                </NavItem>
                <NavItem key={"Inventory"}>
                  <NavLink
                    className={cx({ active: activeTab === "Inventory" })}
                    onClick={() => {
                      setactiveTab("Inventory");
                    }}
                  >
                    <span>Inventory</span>
                  </NavLink>
                </NavItem>
                <NavItem key={"Retro-Actives"}>
                  <NavLink
                    className={cx({ active: activeTab === "Retro-Actives" })}
                    onClick={() => {
                      setactiveTab("Retro-Actives");
                    }}
                  >
                    <span>Retro-Actives</span>
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
            {isMarketingOrAdmin && (
              <div className="col d-flex justify-content-right align-items-center">
                <span className={"badge"}>{`Last publish: ${lastEditionDate}`}</span>
                <button
                  type="button"
                  className="btn btn-primary mr-2"
                  onClick={() => {
                    publishSponsorsToWebsite(existingBrackets);
                  }}
                >
                  Publish to Website
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setCreateModalOpen(true);
                    setNewSponsorInfo({ ...sponsorSkeleton });
                  }}
                >
                  Create Sponsor
                </button>
              </div>
            )}
          </div>

          {activeTab === "Sponsors" ? (
            <>
              {brackets?.map(([bracketId, bracket]) => (
                <SponsorBracket
                  key={bracketId}
                  bracketId={bracketId}
                  bracket={bracket}
                  retroActives={retroActives}
                  sponsors={sponsors}
                />
              ))}
              {isMarketingOrAdmin && (
                <div className="row">
                  <div className="col">
                    <button
                      type="button"
                      className="btn-icon btn-icon-only btn btn-outline-success w-100"
                      onClick={() => {
                        setCreateBracketModalOpen(true);
                        setNewBracketInfo(bracketSkeleton);
                      }}
                    >
                      Create a new Bracket
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === "Inventory" ? (
            <Inventory
              retroActives={retroActives}
              existingBrackets={existingBrackets}
              sponsors={sponsors}
            />
          ) : activeTab === "Retro-Actives" ? (
            <SponsorRetroActives retroActives={retroActives} setRetroActives={setRetroActives} />
          ) : null}
        </div>
      </div>
      <SponsorModal
        retroActives={retroActives}
        bracketId={undefined}
        isModalOpen={createModalOpen}
        setIsModalOpen={setCreateModalOpen}
        mockSponsorInfo={newSponsorInfo}
        setSponsorInfo={setNewSponsorInfo}
        sponsorId={"createNew"}
      />
      <BracketModal
        isModalOpen={createBracketModalOpen}
        setIsModalOpen={setCreateBracketModalOpen}
        bracketInfo={newBracketInfo}
        setBracketInfo={setNewBracketInfo}
        bracketId={""}
        sponsorsItems={[]}
      />
    </>
  );
};

export default Sponsors;
