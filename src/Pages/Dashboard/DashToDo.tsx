import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import { DashTasksAndMaterials, userContext } from "../../interfaces";
import { getTasksAndMaterials } from "./dashboardUtils";
import DashToDoRow from "./DashToDoRow";

type Props = {
  user: userContext | null;
};

const DashToDo = ({ user }: Props) => {
  const [toDos, setToDos] = useState<DashTasksAndMaterials>({});
  useEffect(() => {
    getTasksAndMaterials(user, setToDos);
    // return () => {
    //   cleanup;
    // };
  }, [user]);
  return (
    <div className="col">
      <div className="card-hover-shadow-2x mb-3 card">
        <div className="card-header">Your work</div>
        <div className="scroll-area-sm">
          <PerfectScrollbar>
            {toDos && (
              <div className="">
                <ul className="todo-list-wrapper list-group list-group-flush">
                  {Object.entries(toDos).map(([iD, toDo], idx) => {
                    return (
                      <DashToDoRow
                        key={idx}
                        toDoId={iD}
                        toDo={toDo}
                        user={user}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
          </PerfectScrollbar>
        </div>
      </div>
    </div>
  );
};

export default DashToDo;
