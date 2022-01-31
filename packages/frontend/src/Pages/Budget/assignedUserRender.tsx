import { ICellRendererParams } from "ag-grid-community";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { UserMetadata } from "../../interfaces";

type Props = {
  props: ICellRendererParams;
  usersMetadata: UserMetadata;
};
const AssignedUserRender = ({ props, usersMetadata }: Props) => {
  const userId: string = props ? props.data.assignedTo.value : null;

  return (
    <AvatarOverlap
      users={[userId]}
      usersMetadata={usersMetadata}
      size={"sm"}
      withTooltip={true}
      rounded={false}
    />
  );
};

export default AssignedUserRender;
