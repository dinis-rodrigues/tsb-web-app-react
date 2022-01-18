import React, { useContext, useState, useEffect } from "react";
import firebase from "firebase/app";
import { auth, db } from "../config/firebase";
import {
  ApplicationSettings,
  Departments,
  DepartmentsWithDesc,
  userContext,
  UserMetadata,
} from "../interfaces";
import {
  getUserImgUrl,
  userHasAdminPermissions,
} from "../utils/generalFunctions";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  setDisplayApplication,
  getDepartments,
} from "./contextUtils";

interface ContextAuth {
  currentUser: firebase.User | null;
  USER: userContext | null;
  departments: Departments;
  departmentsWDesc: DepartmentsWithDesc;
  isAdminUser: boolean;
  isMarketingOrAdmin: boolean;
  usersMetadata: UserMetadata;
  applicationSettings: ApplicationSettings;
  displayContent: boolean;
  displayMaintenance: boolean;
  displayLogin: boolean;
  registerUser: Function;
  loginUser: Function;
  logoutUser: Function;
  setCurrentUser: Function;
  setUSER: Function;
}
const AuthContext = React.createContext<ContextAuth>({
  currentUser: null,
  USER: null,
  usersMetadata: {},
  applicationSettings: {
    registrationIsOpen: false,
    maintenanceIsOpen: false,
  },
  departments: {},
  departmentsWDesc: {},
  isAdminUser: false,
  isMarketingOrAdmin: false,
  displayContent: true,
  displayLogin: false,
  displayMaintenance: false,
  registerUser: () => {},
  loginUser: () => {},
  logoutUser: () => {},
  setCurrentUser: () => {},
  setUSER: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
type Props = {
  children: JSX.Element | JSX.Element[];
};

export function AuthProvider({ children }: Props) {
  const [currentUser, setCurrentUser] = useState<any>();
  const [USER, setUSER] = useState<userContext | null>({
    id: "",
    name: "",
    department: "",
    position: "",
    joinedIn: "",
    usrImg: "",
    usrImgComp: "",
  });
  const [loading, setLoading] = useState(true);
  const [usersMetadata, setUsersMetadata] = useState<UserMetadata>({});
  const [applicationSettings, setApplicationSettings] =
    useState<ApplicationSettings>({
      registrationIsOpen: false,
      maintenanceIsOpen: false,
    });
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isMarketingOrAdmin, setIsMarketingOrAdmin] = useState(false);
  const [displayContent, setDisplayContent] = useState(false);
  const [displayMaintenance, setDisplayMaintenance] = useState(false);
  const [displayLogin, setDisplayLogin] = useState(true);
  const [departments, setDepartments] = useState<Departments>({});
  const [departmentsWDesc, setDepartmentsWDesc] = useState<DepartmentsWithDesc>(
    {}
  );

  const getUserState = (userId: string) => {
    db.ref("public/applicationSettings").on("value", (snapshot) => {
      let appSettings: ApplicationSettings = snapshot.val();
      setApplicationSettings(appSettings);
      db.ref(`private/usersMetadata/${userId}/pinfo`).on(
        "value",
        (snapshot) => {
          var userInfo: userContext | null = snapshot.val();
          if (!userInfo) return;
          let usrImgUrlComp = getUserImgUrl(userId, null, true);
          let usrImgUrl = getUserImgUrl(userId, null, false);
          console.log("Env", process.env);
          setUSER({
            id: userId,
            name: userInfo.name,
            department: userInfo.department,
            position: userInfo.position,
            joinedIn: userInfo.joinedIn,
            usrImg: usrImgUrl,
            usrImgComp: usrImgUrlComp,
          });
          // Checks if the user is admin or not
          let userAdmin = userHasAdminPermissions(userInfo);
          let userMarketing =
            userInfo.position === "Management and Marketing" || userAdmin;
          setIsAdminUser(userAdmin);
          setIsMarketingOrAdmin(userMarketing);
          setDisplayApplication(
            userInfo,
            appSettings.maintenanceIsOpen,
            userAdmin,
            setDisplayContent,
            setDisplayMaintenance,
            setDisplayLogin
          );
          // Get deparments
          getDepartments(setDepartments, setDepartmentsWDesc);

          // Only set loading to false, after setting the user info
          db.ref("private/usersMetadata")
            .once("value")
            .then((snapshot) => {
              if (snapshot.val()) {
                setUsersMetadata(snapshot.val());
                setLoading(false);
              }
            });
        }
      );
    });
  };

  // Run the on state changed only once
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        getUserState(user.uid);
      } else {
        // sets loading to false, for the login/register page
        db.ref("public/applicationSettings").on("value", (snapshot) => {
          let appSettings: ApplicationSettings = snapshot.val();
          setApplicationSettings(appSettings);
          setDisplayApplication(
            null,
            appSettings.maintenanceIsOpen,
            null,
            setDisplayContent,
            setDisplayMaintenance,
            setDisplayLogin
          );
          setLoading(false);
        });
      }
    });
    return () => {
      db.ref("public/applicationSettings").off("value");
      db.ref(`private/usersMetadata`).off("value");
    };
  }, []);

  // This functions and values will be available in the entire application
  const value = {
    currentUser,
    usersMetadata,
    USER,
    departments,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    applicationSettings,
    isAdminUser,
    isMarketingOrAdmin,
    displayContent,
    displayLogin,
    displayMaintenance,
    departmentsWDesc,
    setCurrentUser,
    setUSER,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// export default AuthProvider;
