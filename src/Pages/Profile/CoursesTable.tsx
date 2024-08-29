import { off, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { db } from "../../config/firebase";
import { Course, UserMetadata } from "../../interfaces";
import { getAndSetAllUsersMetadata } from "../../utils/generalFunctions";
import CourseRow from "./CourseRow";
import { fenixAuth, getMatchedUsers } from "./profileUtils";

type Props = {
  userName: string | null;
  userId: string;
};

const CoursesTable = ({ userName, userId }: Props) => {
  const [allCourses, setAllCourses] = useState<Course[] | []>();
  const [usersMetadata, setUsersMetadata] = useState<UserMetadata | null>(null);
  useEffect(() => {
    const getCourses = () => {
      onValue(ref(db, "private/usersAcademia"), (snapshot) => {
        // Collection of users Academics
        const users = snapshot.val();
        let courses;
        if (!users) return false;
        const allCoursesArray: Course[] = [];
        try {
          courses = users[userId].courses.enrolments;
        } catch (error) {
          return false;
        }
        // Retrieve the keys of each child of the parent node
        const keys = Object.keys(courses);
        // initialize full rows of table body
        for (const i in keys) {
          const k = keys[i];
          const courseAcro: string = courses[k].acronym;
          const courseName: string = courses[k].name;
          const matches: string[] = getMatchedUsers(courseAcro, users, userId);
          allCoursesArray.push({
            acronym: courseAcro.replace(/[0-9]/g, ""),
            name: courseName,
            userMatches: matches,
          });
        }
        setAllCourses(allCoursesArray);
      });
    };
    getCourses();
    return () => {
      off(ref(db, "private/usersAcademia"));
    };
  }, [userId]);

  useEffect(() => {
    getAndSetAllUsersMetadata(setUsersMetadata);
    // const allUsersData: any = getAllUsersMetadata(false);
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
                <CourseRow allCourses={allCourses} usersMetadata={usersMetadata} />
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
