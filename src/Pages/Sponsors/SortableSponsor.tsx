import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Sponsor, SponsorRetroactives } from "../../interfaces";
import { SponsorCard } from "./SponsorCard";

type Props = {
  sponsor: Sponsor;
  sponsorId: string;
  bracketid: string;
  setCurrBracketId: Function;
  setSponsorId: Function;
  index: number;
  faded: boolean;
  style?: any;
  retroActives: SponsorRetroactives;
  setModalIsOpen: Function;
  setSponsorInfo: Function;
};

export const SortableSponsor = ({
  sponsor,
  sponsorId,
  bracketid,
  setCurrBracketId,
  setSponsorId,
  index,
  faded,
  style,
  setModalIsOpen,
  retroActives,
  setSponsorInfo,
  ...props
}: Props) => {
  const sortable = useSortable({ id: sponsorId });
  const { attributes, listeners, setNodeRef, transform, transition } = sortable;

  const nstyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SponsorCard
      retroActives={retroActives}
      setCurrBracketId={setCurrBracketId}
      bracketid={bracketid}
      ref={setNodeRef}
      sponsorId={sponsorId}
      style={nstyle}
      sponsor={sponsor}
      faded={faded}
      index={index}
      setModalIsOpen={setModalIsOpen}
      setSponsorInfo={setSponsorInfo}
      setSponsorId={setSponsorId}
      {...props}
      {...attributes}
      {...listeners}
    />
  );
};
