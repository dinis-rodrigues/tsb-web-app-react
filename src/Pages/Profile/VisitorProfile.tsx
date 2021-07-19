import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserImgUrl } from "../../utils/generalFunctions";
import altUserImgLarge from "../../assets/images/altUserImg.png";
import {
  getCoverBgColor,
  getCoverBorderColor,
  getUserIdFromUrl,
} from "./profileUtils";
import CoursesTable from "./CoursesTable";
import UserAttendance from "./UserAttendance";

const VisitorProfile = () => {
  const { usersMetadata, departmentsWDesc } = useAuth();
  const [userImage, setUserImage] = useState(altUserImgLarge);

  const userId = getUserIdFromUrl();
  const userInfo = usersMetadata[userId].pinfo;

  const coverBgColor = getCoverBgColor(userInfo, departmentsWDesc);
  const coverBorderColor = getCoverBorderColor(userInfo, departmentsWDesc);
  useEffect(() => {
    const userImgUrl = getUserImgUrl(userId, null, false);
    setUserImage(userImgUrl);
  }, [userId]);
  // console.log();
  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="no-gutters row">
          <div className="col">
            <div
              className="card-hover-shadow profile-responsive card-border mb-3 card"
              style={{ borderColor: coverBorderColor }}
            >
              {/* Avatar and brief  description */}
              <div className="dropdown-menu-header">
                <div className={`dropdown-menu-header-inner ${coverBgColor}`}>
                  <div className="menu-header-content">
                    <div className={"avatar-icon-wrapper mb-2 btn-hover-shine"}>
                      <div
                        id="PImgContainer"
                        className={"rounded w-fit h-fit avatar-icon"}
                      >
                        <img
                          id="croppie-img"
                          className="croppie-img avatar-h avatar-w"
                          src={userImage}
                          onError={(e: any) => setUserImage(altUserImgLarge)}
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="">
                      <div className="btn-group text-center"></div>
                    </div>
                    <div>
                      <h5 className="menu-header-title">
                        {userInfo && userInfo.name}
                      </h5>
                      <h6 className="menu-header-subtitle">
                        {userInfo && userInfo.position} at{" "}
                        {userInfo && userInfo.department}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              {/* Statistics */}
              <UserAttendance userId={userId} />

              {/* Personal Information */}
              <li className="list-group-item">
                <div className="widget-content text-center">
                  <h5 className="widget-heading opacity-4">
                    Personal Information
                  </h5>
                  <div className="form-group">
                    <span className="form-control text-center">
                      {userInfo.fullName}
                    </span>
                  </div>
                  <div className="form-group row">
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Department</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.department}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Position</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.position}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Joined in</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.joinedIn}
                      </span>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Email</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.email}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Phone Number</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.phone}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>MBWay</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.mbway}
                      </span>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>University</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.university}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Degree</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.degree}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Curricular year</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.curricularYear}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Student id</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.studentId}
                      </span>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>ID Card number</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.idCard}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>NIF (niss)</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.nif}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Country</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.country}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>Birth Date</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.birth}
                      </span>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-7">
                      <span className="text-dark small text-uppercase">
                        <strong>Address</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.address}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>City</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.city}
                      </span>
                    </div>
                    <div className="col">
                      <span className="text-dark small text-uppercase">
                        <strong>ZIP Code</strong>
                      </span>
                      <span className="form-control text-center">
                        {userInfo.zip}
                      </span>
                    </div>
                  </div>
                  <span className="text-dark small text-uppercase">
                    <strong>IBAN</strong>
                  </span>
                  <div className="form-group">
                    <span className="form-control text-center">
                      {userInfo.iban}
                    </span>
                  </div>
                  <h6>Linkedin</h6>
                  <div className="form-group">
                    <span className="form-control text-center">
                      {userInfo.linkedin}
                    </span>
                  </div>
                </div>
              </li>
            </div>
          </div>
        </div>
        <CoursesTable userId={userId ? userId : ""} userName={null} />
      </div>
    </div>
  );
};

export default VisitorProfile;
