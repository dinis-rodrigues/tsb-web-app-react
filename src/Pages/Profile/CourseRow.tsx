import { Course } from "../../interfaces";
import AvatarOverlap from "../../components/AppImage/AvatarOverlap";
import { UserMetadata } from "../../interfaces";

type Props = {
  allCourses: Course[];
  usersMetadata: UserMetadata;
};

const CourseRow = ({ allCourses, usersMetadata }: Props) => {
  return (
    <tbody>
      {allCourses.map((course, idx) => (
        <tr key={idx}>
          <td className="text-center">{course.acronym}</td>
          <td className="text-center">{course.name}</td>
          <td className="text-center">
            <AvatarOverlap
              users={course.userMatches}
              usersMetadata={usersMetadata}
              size={"md"}
              rounded={false}
              withTooltip={true}
            />
          </td>
        </tr>
      ))}
    </tbody>
  );
};

export default CourseRow;
