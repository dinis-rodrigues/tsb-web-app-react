import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import {
  ApplicationFeatures,
  ApplicationSettings,
  Departments,
  DepartmentsWithDesc,
  userContext,
  UserMetadata,
} from "../interfaces";
import { userHasAdminPermissions } from "../utils/generalFunctions";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  setDisplayApplication,
  getDepartments,
  setUserInformation,
} from "./contextUtils";
import { get, off, onValue, ref } from "firebase/database";
import { User } from "firebase/auth";

interface ContextAuth {
  currentUser: User | null;
  USER: userContext | null;
  departments: Departments;
  departmentsWDesc: DepartmentsWithDesc;
  applicationFeatures: ApplicationFeatures;
  isAdminUser: boolean;
  isGod: boolean;
  isMarketingOrAdmin: boolean;
  usersMetadata: UserMetadata;
  applicationSettings: ApplicationSettings;
  displayContent: boolean;
  displayMaintenance: boolean;
  displayLogin: boolean;
  isDarkMode: boolean;
  setIsDarkMode: Function;
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
  applicationFeatures: {},
  departments: {},
  departmentsWDesc: {},
  isGod: false,
  isAdminUser: false,
  isMarketingOrAdmin: false,
  displayContent: true,
  displayLogin: false,
  displayMaintenance: false,
  isDarkMode: false,
  registerUser: () => {},
  loginUser: () => {},
  logoutUser: () => {},
  setCurrentUser: () => {},
  setUSER: () => {},
  setIsDarkMode: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
type Props = {
  children: JSX.Element | JSX.Element[];
};

export function AuthProvider({ children }: Props) {
  // All of the states below are used across the entire applciation
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
  const [applicationFeatures, setApplicationFeatures] =
    useState<ApplicationFeatures>({});
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isGod, setIsGod] = useState(false);
  const [isMarketingOrAdmin, setIsMarketingOrAdmin] = useState(false);
  const [displayContent, setDisplayContent] = useState(false);
  const [displayMaintenance, setDisplayMaintenance] = useState(false);
  const [displayLogin, setDisplayLogin] = useState(true);
  const [departments, setDepartments] = useState<Departments>({});
  const [departmentsWDesc, setDepartmentsWDesc] = useState<DepartmentsWithDesc>(
    {}
  );

  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("tsbDarkTheme") === "true" ? true : false
  );

  /**
   * Retrieves all essential data from the database in order to get the Website running
   * for the user
   * @param userId
   */
  const getUserState = (userId: string) => {
    onValue(ref(db, "public/applicationSettings"), (snapshot) => {
      let appSettings: ApplicationSettings = snapshot.val();
      setApplicationSettings(appSettings);

      // Get Application Features
      onValue(ref(db, "private/applicationFeatures"), (snapshot) => {
        if (snapshot.val()) {
          setApplicationFeatures(snapshot.val());
        }
      });

      onValue(ref(db, `private/usersMetadata/${userId}/pinfo`), (snapshot) => {
        var userInfo: userContext | null = snapshot.val();
        if (!userInfo) return;

        setUserInformation(userInfo, userId, setUSER);

        // Checks if the user is admin or not
        let userAdmin = userHasAdminPermissions(userInfo);
        let userMarketing =
          userInfo.department === "Management and Marketing" || userAdmin;
        setIsAdminUser(userAdmin);
        setIsGod(userInfo.position === "God");
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

        // Only set loading to false, after setting the users metadata info and
        get(ref(db, "private/usersMetadata")).then((snapshot) => {
          if (snapshot.val()) {
            setUsersMetadata(snapshot.val());
            setLoading(false);
          }
        });
      });
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
        onValue(ref(db, "public/applicationSettings"), (snapshot) => {
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
      off(ref(db, "public/applicationSettings"));
      off(ref(db, `private/usersMetadata/${USER?.id}/pinfo`));
      off(ref(db, "private/applicationFeatures"));
      off(ref(db, "private/departments"));
    };
  }, []); // eslint-disable-line

  // This functions and values will be available in the entire application
  const value = {
    currentUser,
    usersMetadata,
    USER,
    departments,
    applicationFeatures,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    applicationSettings,
    isAdminUser,
    isGod,
    isMarketingOrAdmin,
    displayContent,
    displayLogin,
    displayMaintenance,
    departmentsWDesc,
    setCurrentUser,
    setUSER,
    isDarkMode,
    setIsDarkMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// export default AuthProvider;
