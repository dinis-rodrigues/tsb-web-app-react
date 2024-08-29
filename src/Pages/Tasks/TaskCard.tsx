import cx from "classnames";
import {
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
} from "react-beautiful-dnd";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { UserMetadata, taskShape } from "../../interfaces";

type Props = {
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | undefined;
  taskOnClick: Function;
  innerRef: any;
  task: taskShape;
  usersMetadata: UserMetadata;
};

const TaskCard = ({
  draggableProps,
  dragHandleProps,
  taskOnClick,
  innerRef,
  task,
  usersMetadata,
}: Props) => {
  const assignedUsers = task.assignedTo
    ? task.assignedTo.map((option, idx) => {
        return option.value;
      })
    : [];
  return (
    <div
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => taskOnClick()}
      ref={innerRef}
      style={{
        userSelect: "none",
        ...draggableProps.style,
      }}
      className={cx("task-up-high kanban-item card-btm-border", {
        "border-danger": task.priority === "High",
        "border-warning": task.priority === "Medium",
        "border-info": task.priority === "Low",
      })}
    >
      <div className="row" style={{ padding: "0 10px" }}>
        <span className="pr-2 opacity-6">
          <i className="fa fa-business-time"></i>
          <span className={"ml-1"}>{task.date}</span>
        </span>
        <div className="btn-actions-pane-right">
          {assignedUsers && usersMetadata ? (
            <AvatarOverlap
              users={assignedUsers}
              usersMetadata={usersMetadata}
              size={"xs2"}
              withTooltip={true}
              rounded={false}
            />
          ) : (
            ""
          )}
        </div>
      </div>
      <div className="row">
        <div className="col text-center task-title">{task.title}</div>
      </div>
      <div className="row" style={{ padding: "0 10px" }}>
        <span className="pr-2 opacity-6">
          <i className="fas fa-comment-alt"></i> <span> {task.numComments}</span>
        </span>
        <div className="btn-actions-pane-right">
          <span className="pr-2 opacity-6">
            <i className="fas fa-tasks"></i>{" "}
            <span> {!task.totalObj ? `0` : `${task.completedObj}/${task.totalObj}`}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
