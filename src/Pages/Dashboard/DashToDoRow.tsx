import { Fragment } from "react";
import cx from "classnames";
import { useAuth } from "../../contexts/AuthContext";
import { BomMaterial, taskShape, userContext } from "../../interfaces";
import {
  getAssignedByString,
  getLinkTo,
  getStatusBadge,
  getToDoTitle,
} from "./dashboardUtils";
import { Link } from "react-router-dom";

type Props = {
  toDoId: string;
  toDo: taskShape & BomMaterial;
  user: userContext | null;
};
const DashToDoRow = ({ toDoId, toDo, user }: Props) => {
  const { usersMetadata } = useAuth();
  let isTask = true;
  if (toDo.hasOwnProperty("toDepartment")) isTask = false;
  // Task status badge if exists
  let [leftColor, badgeColor] = getStatusBadge(toDo, isTask);
  // Assigned by string
  let assignedByString = getAssignedByString(
    user,
    usersMetadata,
    toDo.assignedBy
  );
  // title
  let toDoTitle = getToDoTitle(toDo, isTask);
  // Link
  const linkTo = getLinkTo(toDoId, toDo, isTask);

  return (
    <Fragment>
      <li className="list-group-item todo-list">
        <Link to={linkTo} className="todo-link">
          <div className={cx("todo-indicator", { [leftColor]: leftColor })} />
          <div className="widget-content p-0">
            <div className="widget-content-wrapper">
              <div className="widget-content-left">
                <div className="widget-heading">
                  {toDoTitle}
                  {badgeColor && (
                    <div
                      className={cx("badge ml-2", { [badgeColor]: badgeColor })}
                    >
                      {toDo.status}
                    </div>
                  )}
                  <div className="badge badge-danger ml-2">{toDo.date}</div>
                </div>
                <div className="widget-subheading">{assignedByString}</div>
              </div>
            </div>
          </div>
        </Link>
      </li>
    </Fragment>
  );
};

export default DashToDoRow;
