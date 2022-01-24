import { Fragment, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

import { SortableSponsor } from "./SortableSponsor";
import { SponsorCard } from "./SponsorCard";
import { Grid } from "./Grid";
import {
  addSponsorToBracket,
  getSponsorsListFromBrackets,
  handleDragCancel,
  handleDragEnd,
  handleDragStart,
  updateSponsorDropdown,
} from "./sponsorsUtils";
import {
  Sponsor,
  SponsorBracketListItem,
  SponsorsOrder,
} from "../../interfaces";
import { db } from "../../config/firebase";
import SponsorModal from "./SponsorModal";
import BracketModal from "./BracketModal";
import { useAuth } from "../../contexts/AuthContext";
import { toastrMessage } from "../../utils/generalFunctions";

type Props = {
  bracket: SponsorBracketListItem;
  retroActives: number[];
  bracketId: string;
  sponsors: [string, Sponsor][];
};
const SponsorBracket = ({
  bracketId,
  bracket,
  retroActives,
  sponsors,
}: Props) => {
  const { isMarketingOrAdmin } = useAuth();
  const [sponsorsItems, setsSponsorsItems] = useState<string[]>([]);
  const [sponsorsObj, setSponsorsObj] = useState<SponsorsOrder>({});
  const [activeId, setActiveId] = useState<string>("");
  const [sponsorInfo, setSponsorInfo] = useState<Sponsor | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [bracketModalopen, setBracketModalopen] = useState(false);
  const [sponsorId, setSponsorId] = useState("");

  const [currBracketId, setCurrBracketId] = useState("");

  const [bracketInfo, setBracketInfo] =
    useState<SponsorBracketListItem>(bracket);
  const [filterSearch, setFilterSearch] = useState("");

  const [dropdownResults, setDropdownResults] = useState<[string, Sponsor][]>(
    []
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 100,
      },
    }),
    useSensor(TouchSensor)
  );

  const borderColor = bracketInfo.color
    ? bracketInfo.color?.hex
    : "rgba(26, 54, 126, 0.125)";

  useEffect(() => {
    getSponsorsListFromBrackets(bracketId, setsSponsorsItems, setSponsorsObj);
    updateSponsorDropdown("", sponsors, setDropdownResults);
    return () => {
      db.ref("private/sponsors/brackets").child(bracketId).off("value");
    };
  }, [sponsors, bracketId]);
  return (
    <Fragment>
      <div className="main-card card mb-4">
        <div
          className="card-header"
          style={{ borderBottom: `3px solid ${borderColor}` }}
        >
          {bracket.name}
          <div className="btn-actions-pane-right">
            <span className="badge badge-pill badge-secundary">
              {bracket.topMargin
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
              {" / "}
              {bracket.bottomMargin
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
            </span>
            {isMarketingOrAdmin && (
              <>
                <button
                  className="btn btn-outline-info"
                  onClick={() => {
                    setBracketModalopen(true);
                    setBracketInfo(bracket);
                  }}
                >
                  Edit
                </button>

                <UncontrolledButtonDropdown>
                  <DropdownToggle color="btn" className="p-0 mr-2">
                    <span className="btn-wide btn-outline-success btn dropdown-toggle">
                      Add
                    </span>
                  </DropdownToggle>
                  <DropdownMenu
                    right
                    className="rm-pointers dropdown-menu"
                    style={{ overflow: "hidden" }}
                  >
                    <input
                      type="text"
                      className="dropdown-search"
                      placeholder="Search..."
                      value={filterSearch}
                      onChange={(e) => {
                        updateSponsorDropdown(
                          e.target.value,
                          sponsors,
                          setDropdownResults
                        );
                        setFilterSearch(e.target.value);
                      }}
                    />
                    {dropdownResults.map(([sponId, sponsorVal]) => {
                      return (
                        <button
                          key={sponId}
                          type="button"
                          className="dropdown-item"
                          onClick={() =>
                            addSponsorToBracket(
                              sponId,
                              sponsorVal,
                              bracketId,
                              bracket.name
                            )
                          }
                        >
                          {sponsorVal.name}
                        </button>
                      );
                    })}
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
              </>
            )}
          </div>
        </div>
        {sponsorsItems && Object.entries(sponsorsObj).length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => handleDragStart(e, setActiveId)}
            onDragEnd={(e) =>
              isMarketingOrAdmin
                ? handleDragEnd(e, bracketId, setsSponsorsItems, setActiveId)
                : toastrMessage(
                    "You don't have permissions to do this",
                    "error"
                  )
            }
            onDragCancel={(e) => handleDragCancel(setActiveId)}
          >
            <SortableContext
              items={sponsorsItems}
              strategy={rectSortingStrategy}
            >
              <Grid columns={bracket.numColumns}>
                {sponsorsItems.map((sponsorId, index) => (
                  <SortableSponsor
                    retroActives={retroActives}
                    bracketid={bracketId}
                    setCurrBracketId={setCurrBracketId}
                    key={sponsorId}
                    sponsor={sponsorsObj[sponsorId]}
                    sponsorId={sponsorId}
                    setSponsorId={setSponsorId}
                    index={index}
                    faded={false}
                    setModalIsOpen={setModalIsOpen}
                    setSponsorInfo={setSponsorInfo}
                  />
                ))}
              </Grid>
            </SortableContext>
            <DragOverlay adjustScale={true}>
              {activeId ? (
                <SponsorCard
                  retroActives={retroActives}
                  bracketid={bracketId}
                  setCurrBracketId={setCurrBracketId}
                  sponsor={sponsorsObj[activeId]}
                  sponsorId={sponsorId}
                  setSponsorId={setSponsorId}
                  index={sponsorsItems.indexOf(activeId)}
                  setModalIsOpen={setModalIsOpen}
                  setSponsorInfo={setSponsorInfo}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
      <SponsorModal
        retroActives={retroActives}
        bracketId={currBracketId}
        isModalOpen={modalIsOpen}
        setIsModalOpen={setModalIsOpen}
        sponsorInfo={sponsorInfo}
        setSponsorInfo={setSponsorInfo}
        sponsorId={sponsorId}
      />
      <BracketModal
        isModalOpen={bracketModalopen}
        setIsModalOpen={setBracketModalopen}
        bracketInfo={bracketInfo}
        setBracketInfo={setBracketInfo}
        bracketId={bracketId}
        sponsorsItems={sponsorsItems}
      />
    </Fragment>
  );
};

export default SponsorBracket;
