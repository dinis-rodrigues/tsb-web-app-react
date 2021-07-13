import { fenixAuth, getMatchedUsers } from "./profileUtils";
import { db } from "../../config/firebase";
import { useState, useEffect } from "react";
import { Course } from "../../interfaces";
import CourseRow from "./CourseRow";
import { getAndSetAllUsersMetadata } from "../../utils/generalFunctions";
import { UserMetadata } from "../../interfaces";

type Props = {
  userName: string | null;
  userId: string;
};

const CoursesTable = ({ userName, userId }: Props) => {
  const [allCourses, setAllCourses] = useState<Course[] | []>();
  const [usersMetadata, setUsersMetadata] = useState<UserMetadata | null>(null);
  useEffect(() => {
    const getCourses = () => {
      db.ref("private/usersAcademia").on("value", (snapshot) => {
        // Collection of users Academics
        var users = snapshot.val();
        if (!users) return false;
        let allCoursesArray: Course[] = [];
        try {
          var courses = users[userId].courses.enrolments;
        } catch (error) {
          // console.log("Not connected to fenix");
          return false;
        }
        // Retrieve the keys of each child of the parent node
        var keys = Object.keys(courses);
        // initialize full rows of table body
        for (const i in keys) {
          var k = keys[i];
          let courseAcro: string = courses[k].acronym;
          let courseName: string = courses[k].name;
          let matches: string[] = getMatchedUsers(courseAcro, users, userId);
          allCoursesArray.push({
            acronym: courseAcro.replace(/[0-9]/g, ""),
            name: courseName,
            userMatches: matches,
          });
        }
        // // console.log(allCoursesArray);
        setAllCourses(allCoursesArray);
      });
    };
    getCourses();
    return () => {
      db.ref("private/usersAcademia").off("value");
    };
  }, [userId]);

  useEffect(() => {
    getAndSetAllUsersMetadata(setUsersMetadata);
    // const allUsersData: any = getAllUsersMetadata(false);
    // // console.log("Courses Table", allUsersData);
    // setUsersMetadata(allUsersData);
  }, []);

  return (
    <div className="row">
      <div className="col-md-12">
        <div className="main-card mb-3 card">
          <div className="card-header">Academics</div>
          <div className="table-responsive">
            <table className="align-middle mb-0 table table-borderless table-striped table-hover">
              <thead>
                <tr>
                  <th className="text-center">Acronym</th>
                  <th className="text-center">Course Name</th>
                  <th className="text-center">Match</th>
                </tr>
              </thead>

              {allCourses && usersMetadata && (
                <CourseRow
                  allCourses={allCourses}
                  usersMetadata={usersMetadata}
                />
              )}
            </table>
          </div>
          {userName && (
            <div className="d-block text-center card-footer">
              <button
                type="button"
                className="btn-shadow btn btn-info"
                onClick={() => fenixAuth(userName, userId)}
              >
                Connect to FenixEdu™
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursesTable;
