import { Fragment, useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { Redirect } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import CreatableSelect from "react-select/creatable";
import { UncontrolledTooltip } from "reactstrap";

import cx from "classnames";

import {
  initialColumns,
  taskSkeleton,
  boardSkeleton,
  swalDeleteMessage,
  createNewBoard,
  updateExistingBoards,
  addTask,
  goToBoard,
  deleteBoard,
  onDragEnd,
  taskOnClick,
  drawerOpenHandler,
  openMatchingTaskId,
  getTaskBoardTitleAndColor,
  getEncodedBoardNames,
} from "./tasksUtils";
import {
  columnsShape,
  selectOption,
  taskShape,
  Department,
} from "../../interfaces";

import TaskInfo from "./TaskInfo";
import { useAuth } from "../../contexts/AuthContext";
import TaskCard from "./TaskCard";
import {
  getDecodedString,
  setUserAssignmentOptions,
} from "../../utils/generalFunctions";
import { off, onValue, ref } from "firebase/database";

const Tasks = (props: any) => {
  const { USER, usersMetadata, departments } = useAuth();
  const [columns, setColumns] = useState<columnsShape>(initialColumns);
  // Drawer states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<selectOption[] | []>([]);
  // const [usersMetadata, setUsersMetadata] = useState<UserMetadata>({});
  const [currTaskInfo, setCurrTaskInfo] = useState<taskShape>({
    ...taskSkeleton,
  }); // load task info in modal
  const [modalTask, setModalTask] = useState<taskShape>({ ...taskSkeleton }); // store task modifications
  const [openedFromUrl, setOpenedFromUrl] = useState(false);

  // Task states
  const [currTaskColumn, setCurrTaskColumn] = useState<string>(""); // column of the task
  const [currTaskNum, setCurrTaskNum] = useState<number>(0); // list item number of the task
  const [commentListener, setCommentListener] = useState<string | null>(null); // watch for new task comments
  const [department, setDepartment] = useState<Department>();

  // Retrieve board information from url
  // const { departmentBoard, encodedCurrBoard }: matchedRoute =
  //   props.match.params;
  const openTaskId = props.location.elId;
  const openColId = props.location.colId;
  // var currBoard = encodedCurrBoard;
  // // URL related stuff, sometimes it's encoded, sometimes it's not
  // if (getDecodedString(encodedCurrBoard) === currBoard) {
  //   currBoard = encodeData(encodedCurrBoard);
  // }
  const [departmentBoard, currBoard] = getEncodedBoardNames();

  // Add existing boards to select option
  const [existingBoards, setExistingBoards] = useState<selectOption[]>([]); // column of the task
  const [redirectToBoard, setRedirectToBoard] = useState<string | null>(null); // column of the task

  useEffect(() => {
    // Update board state on every change
    if (departmentBoard && currBoard) {
      onValue(
        ref(db, `private/${departmentBoard}/b/${currBoard}`),
        (snapshot) => {
          if (!snapshot.val()) setRedirectToBoard(`/dashboard`);
          setColumns(snapshot.val());
          if (openTaskId && !openedFromUrl) {
            openMatchingTaskId(
              openTaskId,
              openColId,
              snapshot.val(),
              departmentBoard,
              currBoard,
              setOpenedFromUrl,
              setCurrTaskInfo,
              setModalTask,
              setCurrTaskColumn,
              setCurrTaskNum,
              setDrawerOpen
            );
          }
          getTaskBoardTitleAndColor(
            departmentBoard,
            departments,
            setDepartment
          );
        }
      );
      // Update the list of existing boards in the department
      updateExistingBoards(departmentBoard, setExistingBoards);
    }
    return () => {
      off(ref(db, `private/${departmentBoard}/b/${currBoard}`));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentBoard, currBoard, openColId, openTaskId, usersMetadata]);

  useEffect(() => {
    if (department) {
      // Get users metadata and set the state of user options
      setUserAssignmentOptions(setUserOptions, usersMetadata, department);
    }
  }, [department]);

  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="card-header">
          <i
            className={cx(
              "header-icon icon-gradient fa",
              department?.icon,
              department?.gradientColor
            )}
          ></i>
          {department?.description}
          {/* Add Task, Select Board, Add New Board and Remove Board */}
          <div className="btn-actions-pane-right text-capitalize">
            <div className="row mr-1">
              {/* Add task to current board */}
              <button
                className="btn-wide btn-dark mr-md-2 btn btn-sm"
                onClick={() =>
                  addTask(
                    USER,
                    columns,
                    departmentBoard,
                    currBoard,
                    setCurrTaskInfo,
                    setModalTask,
                    setCurrTaskColumn,
                    setCurrTaskNum,
                    setCommentListener,
                    setDrawerOpen
                  )
                }
              >
                Add Task
              </button>
              {/* Select the board to view and edit tasks */}
              <CreatableSelect
                classNamePrefix="react-select-container"
                className="sel-width text-center"
                onChange={(option) => {
                  option &&
                    goToBoard(
                      option.value,
                      setRedirectToBoard,
                      departmentBoard,
                      currBoard,
                      setColumns
                    );
                }}
                value={{
                  value: getDecodedString(currBoard),
                  label: getDecodedString(currBoard),
                }}
                options={existingBoards && existingBoards}
                onCreateOption={(value) =>
                  createNewBoard(
                    value,
                    departmentBoard,
                    boardSkeleton,
                    setRedirectToBoard
                  )
                }
              />
              {currBoard !== "General" && (
                <Fragment>
                  {/* Delete board and all it's tasks */}
                  <button
                    id={"removeBoard"}
                    onClick={() =>
                      swalDeleteMessage(() =>
                        deleteBoard(
                          columns,
                          departmentBoard,
                          currBoard,
                          setRedirectToBoard
                        )
                      )
                    }
                    className="ml-md-2 btn-icon btn-icon-only btn btn-outline-danger"
                  >
                    <i className="pe-7s-trash btn-icon-wrapper"> </i>
                  </button>
                  <UncontrolledTooltip placement="left" target={"removeBoard"}>
                    {"Remove Board"}
                  </UncontrolledTooltip>
                </Fragment>
              )}
            </div>
          </div>
        </div>
        {/* Kanban Board Container */}
        <div
          className={"kanban-container"}
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          {/* Where we can drag and drop */}
          <DragDropContext
            onDragEnd={(result) =>
              onDragEnd(result, columns, departmentBoard, currBoard)
            }
          >
            {columns &&
              Object.entries(columns).map(([colId, column]) => {
                // This is our column
                return (
                  <div style={{ width: "31%", margin: "1%" }} key={colId}>
                    <div className={column.classNames}>{column.name}</div>
                    {/* This is our droppable column area */}
                    <Droppable droppableId={colId} key={colId}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            className={"kanban-drag"}
                            ref={provided.innerRef}
                            style={{
                              backgroundColor: snapshot.isDraggingOver
                                ? "lightblue"
                                : "",
                            }}
                          >
                            {/* For each column, we have our tasks */}
                            {columns &&
                              column.items &&
                              column.items.map((item, idx) => {
                                return (
                                  // Only render task card when the users metadata is set in state
                                  Object.keys(usersMetadata).length !== 0 && (
                                    <Draggable
                                      key={item.id}
                                      draggableId={item.id}
                                      index={idx}
                                    >
                                      {(provided, snapshot) => {
                                        return (
                                          <TaskCard
                                            draggableProps={
                                              provided.draggableProps
                                            }
                                            dragHandleProps={
                                              provided.dragHandleProps
                                            }
                                            innerRef={provided.innerRef}
                                            task={item}
                                            taskOnClick={() =>
                                              taskOnClick(
                                                setDrawerOpen,
                                                item,
                                                idx,
                                                colId,
                                                setCurrTaskInfo,
                                                setModalTask,
                                                setCurrTaskColumn,
                                                setCurrTaskNum,
                                                setCommentListener,
                                                departmentBoard,
                                                currBoard
                                              )
                                            }
                                            usersMetadata={usersMetadata}
                                          />
                                        );
                                      }}
                                    </Draggable>
                                  )
                                );
                              })}
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                );
              })}
          </DragDropContext>
        </div>
      </div>
      {/* Drawer Modal */}
      <TaskInfo
        isDrawerOpen={drawerOpen}
        drawerOpenHandler={() =>
          drawerOpenHandler(setDrawerOpen, commentListener, setCommentListener)
        }
        departmentBoard={departmentBoard}
        currBoard={currBoard}
        columns={columns}
        userOptions={userOptions && userOptions}
        usersMetadata={usersMetadata}
        taskInfo={currTaskInfo && currTaskInfo}
        modalTask={modalTask && modalTask}
        setModalTask={setModalTask}
        currTaskNum={currTaskNum}
        currTaskColumn={currTaskColumn}
        user={USER}
      />
      {/* Redirect to another board, when user clicks the board select input */}
      {redirectToBoard && <Redirect to={redirectToBoard}></Redirect>}
    </div>
  );
};

export default Tasks;
