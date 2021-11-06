import { Fragment, useEffect, useState } from "react";
import { db } from "../../config/firebase";
import {
  Sponsor,
  SponsorBracketsListDB,
  SponsorBracketListItem,
} from "../../interfaces";
import SponsorBracket from "./SponsorBracket";
import {
  bracketSkeleton,
  getAllSponsorBrackets,
  getInventorySponsors,
  getLastEditionDate,
  getRetroActives,
  publishSponsorsToWebsite,
  sponsorSkeleton,
} from "./sponsorsUtils";
import { Nav, NavItem, NavLink } from "reactstrap";
import cx from "classnames";
import Inventory from "./Inventory";
import SponsorModal from "./SponsorModal";
import BracketModal from "./BracketModal";

const Sponsors = () => {
  const [brackets, setBrackets] =
    useState<[string, SponsorBracketListItem][]>();
  const [retroActives, setRetroActives] = useState([]);
  const [activeTab, setactiveTab] = useState("Sponsors");

  const [newSponsorInfo, setNewSponsorInfo] = useState(sponsorSkeleton);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newBracketInfo, setNewBracketInfo] = useState(bracketSkeleton);
  const [createBracketModalOpen, setCreateBracketModalOpen] = useState(false);

  const [existingBrackets, setExistingBrackets] =
    useState<SponsorBracketsListDB>();
  const [sponsors, setSponsors] = useState<[string, Sponsor][]>([]);

  const [lastEditionDate, setLastEditionDate] = useState<string>("");

  useEffect(() => {
    getAllSponsorBrackets(setBrackets);
    getRetroActives(setRetroActives);
    getInventorySponsors(setSponsors, setExistingBrackets);
    getLastEditionDate(setLastEditionDate);
    return () => {
      db.ref("private/sponsors/brackets").off("value");
      db.ref("private/sponsors/retroActives").off("value");
      db.ref("private/sponsors/inventory").off("value");
      db.ref("private/sponsors/bracketsList").off("value");
    };
  }, []);
  return (
    <Fragment>
      <div className="app-main__outer">
        <div className="app-main__inner">
          <div className="row">
            <div className="col">
              <Nav
                className={
                  "body-tabs body-tabs-layout tabs-animated body-tabs-animated pt-0"
                }
              >
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
              </Nav>
            </div>
            <div className="col d-flex justify-content-right align-items-center">
              <span
                className={"badge"}
              >{`Last publish: ${lastEditionDate}`}</span>
              <button
                className="btn btn-primary mr-2"
                onClick={() => {
                  publishSponsorsToWebsite(existingBrackets);
                }}
              >
                Publish to Website
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setCreateModalOpen(true);
                  setNewSponsorInfo(sponsorSkeleton);
                }}
              >
                Create Sponsor
              </button>
            </div>
          </div>

          {activeTab === "Sponsors" ? (
            <Fragment>
              {brackets?.map(([bracketId, bracket]) => (
                <SponsorBracket
                  key={bracket.name}
                  bracketId={bracketId}
                  bracket={bracket}
                  retroActives={retroActives}
                  sponsors={sponsors}
                />
              ))}
              <div className="row">
                <div className="col">
                  <button
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
            </Fragment>
          ) : (
            <Inventory
              retroActives={retroActives}
              existingBrackets={existingBrackets}
              sponsors={sponsors}
            />
          )}
        </div>
      </div>
      <SponsorModal
        retroActives={retroActives}
        bracketId={undefined}
        isModalOpen={createModalOpen}
        setIsModalOpen={setCreateModalOpen}
        sponsorInfo={newSponsorInfo}
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
    </Fragment>
  );
};

export default Sponsors;
