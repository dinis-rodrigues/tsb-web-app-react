import { useState, useEffect } from "react";
import { setUserProfilePicture } from "../../reducers/ThemeOptions";
import { connect } from "react-redux";
import cx from "classnames";
import {
  defaultInfo,
  setDepartmentPositions,
  editInformation,
  saveInformation,
  discardInformation,
  handleUpload,
  sendImgToServer,
} from "./profileUtils";
import PersonalInformationOptions from "./PersonalInformationOptions";
import CoursesTable from "./CoursesTable";
import { PersonalInformation } from "../../interfaces";
import "croppie/croppie.css";
import Croppie from "croppie";

import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase";
import UserAttendance from "./UserAttendance";
import ImageContainer from "../../components/AppImage/ImageContainer";

type Props = {
  setUserProfilePicture: Function;
};

const Profile = ({ setUserProfilePicture }: Props) => {
  const { USER, setUSER } = useAuth();
  const [info, setInfo] = useState<PersonalInformation>(defaultInfo); // current info
  const [prevInfo, setPrevInfo] = useState<PersonalInformation>(defaultInfo); // save info on edit (restore on discard)
  const [disabledInput, setDisabledInput] = useState(true); // enalbe/disable on edit
  const [selectPositions, setSelectPositions] = useState({});
  // ------------
  // Croppie part
  // ------------
  const [showSaveImg, setShowSaveImg] = useState(false);
  const [croppie, setCroppie] = useState<Croppie>();

  useEffect(() => {
    // Update the info state on first render
    async function getPersonalInfo() {
      if (!USER) {
        return;
      }
      db.ref(`private/usersMetadata/${USER.id}/pinfo`)
        .once("value")
        .then((snapshot) => {
          const data = snapshot.val();
          const dataArr: any = {};
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              dataArr[key] = data[key];
              // // console.log(key + " -> " + data[key]);
            }
          }
          setDepartmentPositions(dataArr.department, USER, setSelectPositions);
          setInfo(dataArr);
          setPrevInfo(dataArr);
          // console.log("getting info");
        });
    }
    getPersonalInfo();
    return () => {
      db.ref(`private/departments/es/positions`).off("value");
      db.ref(`private/departments/ms/positions`).off("value");
      db.ref(`private/departments/dc/positions`).off("value");
      db.ref(`private/departments/hp/positions`).off("value");
      db.ref(`private/departments/mm/positions`).off("value");
    };
  }, [USER]);

  return (
    <div className="app-main__outer">
      <div className="app-main__inner">
        <div className="no-gutters row">
          <div className="col">
            <div className="card-hover-shadow profile-responsive card-border border-success mb-3 card">
              {/* Avatar and brief  description */}
              <div className="dropdown-menu-header">
                <div className="dropdown-menu-header-inner bg-vicious-stance">
                  <div className="menu-header-content">
                    <div
                      className={cx("avatar-icon-wrapper mb-2", {
                        "btn-hover-shine": disabledInput,
                      })}
                    >
                      <div
                        id="PImgContainer"
                        className={cx("rounded w-fit h-fit", {
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
                              onChange={(e) =>
                                handleUpload(
                                  e,
                                  croppie,
                                  setShowSaveImg,
                                  setCroppie
                                )
                              }
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
                              onClick={() =>
                                sendImgToServer(
                                  USER,
                                  undefined,
                                  "",
                                  croppie!,
                                  setCroppie,
                                  setShowSaveImg,
                                  setUSER
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
        <CoursesTable
          userId={USER ? USER.id : ""}
          userName={USER ? USER.name : ""}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => ({
  userProfilePicture: state.ThemeOptions.userProfilePicture,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setUserProfilePicture: (img: string) => dispatch(setUserProfilePicture(img)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
