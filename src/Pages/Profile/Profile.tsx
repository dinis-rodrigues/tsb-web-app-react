import cx from "classnames";
import Croppie from "croppie";
import "croppie/croppie.css";
import { useEffect, useState } from "react";
import { PersonalInformation } from "../../interfaces";
import CoursesTable from "./CoursesTable";
import PersonalInformationOptions from "./PersonalInformationOptions";
import {
  defaultInfo,
  discardInformation,
  editInformation,
  getCoverBgColor,
  getCoverBorderColor,
  handleUpload,
  saveInformation,
  sendImgToServer,
  setDepartmentPositions,
} from "./profileUtils";

import { get, off, ref } from "firebase/database";
import ImageContainer from "../../components/AppImage/ImageContainer";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import UserAttendance from "./UserAttendance";

const Profile = () => {
  const { USER, setUSER, departmentsWDesc } = useAuth();
  const [info, setInfo] = useState<PersonalInformation>(defaultInfo); // current info
  const [prevInfo, setPrevInfo] = useState<PersonalInformation>(defaultInfo); // save info on edit (restore on discard)
  const [disabledInput, setDisabledInput] = useState(true); // enalbe/disable on edit
  const [selectPositions, setSelectPositions] = useState({});
  // ------------
  // Croppie part
  // ------------
  const [showSaveImg, setShowSaveImg] = useState(false);
  const [croppie, setCroppie] = useState<Croppie>();

  const coverBgColor = getCoverBgColor(USER, departmentsWDesc);
  const coverBorderColor = getCoverBorderColor(USER, departmentsWDesc);

  useEffect(() => {
    // Update the info state on first render
    async function getPersonalInfo() {
      if (!USER) {
        return;
      }
      get(ref(db, `private/usersMetadata/${USER.id}/pinfo`)).then((snapshot) => {
        const data = snapshot.val();
        const dataArr: any = {};
        for (const key in data) {
          if (Object.hasOwn(data, key)) {
            dataArr[key] = data[key];
          }
        }
        setDepartmentPositions(dataArr.department, USER, setSelectPositions);
        setInfo(dataArr);
        setPrevInfo(dataArr);
      });
    }
    getPersonalInfo();
    return () => {
      off(ref(db, `private/departments/es/positions`));
      off(ref(db, `private/departments/ms/positions`));
      off(ref(db, `private/departments/dc/positions`));
      off(ref(db, `private/departments/hp/positions`));
      off(ref(db, `private/departments/mm/positions`));
    };
  }, [USER]);

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
                    <div className={cx("avatar-icon-wrapper mb-2")}>
                      <div
                        id="PImgContainer"
                        className={cx("rounded w-fit h-fit profile-image", {
                          "avatar-icon": disabledInput,
                        })}
                      >
                        <ImageContainer
                          classNames={"croppie-img avatar-h avatar-w"}
                          id={"croppie-img"}
                          imageSrc={USER!.usrImg}
                          compressed={false}
                        />
                      </div>
                    </div>
                    <div className="">
                      <div className="btn-group text-center">
                        <div className="nav">
                          <label
                            id="PImg"
                            className={cx("btn btn-info", {
                              "invisible-none": disabledInput,
                            })}
                          >
                            <span className="text">Upload</span>
                            <input
                              type="file"
                              onChange={(e) => handleUpload(e, croppie, setShowSaveImg, setCroppie)}
                              className="custom-file-input"
                              accept="image/*"
                              hidden
                            />
                          </label>
                          <label
                            id="PSendDiv"
                            className={cx({
                              "invisible-none": !showSaveImg,
                            })}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                sendImgToServer(
                                  USER,
                                  undefined,
                                  "",
                                  croppie!,
                                  setCroppie,
                                  setShowSaveImg,
                                  setUSER,
                                )
                              }
                              className="btn btn-dark"
                            >
                              Save
                            </button>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="menu-header-title">{info && info.name}</h5>
                      <h6 className="menu-header-subtitle">
                        {info && info.position} at {info && info.department}
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
              {/* Statistics */}
              {USER && <UserAttendance userId={USER.id} />}

              {/* Profile Information */}
              <PersonalInformationOptions
                info={info}
                selectPositions={selectPositions}
                disabledInput={disabledInput}
                editInformation={editInformation}
                saveInformation={saveInformation}
                discardInformation={discardInformation}
                setInfo={setInfo}
                setDisabledInput={setDisabledInput}
                setPrevInfo={setPrevInfo}
                setCroppie={setCroppie}
                setShowSaveImg={setShowSaveImg}
                setSelectPositions={setSelectPositions}
                user={USER}
                croppie={croppie}
                prevInfo={prevInfo}
              />
            </div>
          </div>
        </div>
        <CoursesTable userId={USER ? USER.id : ""} userName={USER ? USER.name : ""} />
      </div>
    </div>
  );
};

export default Profile;
