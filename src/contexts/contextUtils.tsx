import { auth, db } from "../config/firebase";
import {
  ApplicationSettings,
  Departments,
  DepartmentsWithDesc,
  userContext,
} from "../interfaces";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { getUserImgUrl } from "../utils/generalFunctions";
import { onValue, ref } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  User,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

/**
 * Get and set application settings state
 * @param setMaintenanceIsOpen
 * @param setRegistrationIsOpen
 */
const getAndSetApplicationSettings = (setApplicationSettings: Function) => {
  onValue(ref(db, "public/applicationSettings"), (snapshot) => {
    let applicationSettings: ApplicationSettings = snapshot.val();
    if (!applicationSettings) return;
    setApplicationSettings(applicationSettings);
  });
};

/**
 * Retrieves current user of the application
 * @param auth
 * @returns
 */
const getCurrentUser = (auth: any) => {
  return new Promise((resolve, reject) => {
    const unsubscribe: any = auth.onAuthStateChanged((user: User) => {
      resolve([user, unsubscribe]);
    }, reject);
  });
};

/**
 * Registers user with email and password to the application
 * @param email
 * @param password
 * @returns
 */
const registerUser = (email: string, password: string): Promise<any> => {
  // this returns a promise

  return createUserWithEmailAndPassword(auth, email, password);
};
const swalAlert = withReactContent(Swal);
/**
 * Logins the user with email and password to the application
 * @param email
 * @param password
 * @returns
 */
const loginUser = (email: string, password: string, rememberMe: boolean) => {
  setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  )
    .then(() => {
      return signInWithEmailAndPassword(auth, email, password);
    })
    .catch((error) => {
      // Display alert with the login error
      swalAlert.fire({
        target: ".app-container",
        customClass: {
          denyButton: "btn btn-shadow btn-danger",
          confirmButton: "btn btn-shadow btn-info",
        },
        title: "Ooops!",
        icon: "error",
        html: `<p>${error.message}</p>`, // prettier message
      });
    });
};

const logoutUser = (setCurrentUser: Function): Promise<any> => {
  setCurrentUser(false);
  return auth.signOut();
};

/**
 * Defines variables to what the user can see or not
 * @param user
 * @param maintenanceIsOpen
 * @param isAdminUser
 * @param setDisplayContent
 * @param setDisplayMaintenance
 * @param setDisplayLogin
 */
const setDisplayApplication = (
  user: userContext | null,
  maintenanceIsOpen: boolean,
  isAdminUser: boolean | null,
  setDisplayContent: Function,
  setDisplayMaintenance: Function,
  setDisplayLogin: Function
) => {
  return new Promise<void>((resolve, reject) => {
    // Used for maintenance purposes and authenticated users
    const displayContent = user && (!maintenanceIsOpen || isAdminUser);
    const displayLogin = !user && !maintenanceIsOpen;
    const displayMaintenance = maintenanceIsOpen && !isAdminUser;

    setDisplayContent(displayContent);
    setDisplayMaintenance(displayMaintenance);
    setDisplayLogin(displayLogin);
    resolve();
  });
};

/**
 * Retrieve departments from database
 * @param setDepartments
 */
const getDepartments = (
  setDepartments: Function,
  setDepartmentsWDesc: Function
) => {
  onValue(ref(db, "private/departments"), (snapshot) => {
    let departments: Departments = snapshot.val();
    if (!departments) return;
    setDepartments(departments);
    // Build the departments object with the description as key of the object
    let departmentsWithDescription: DepartmentsWithDesc = {};
    Object.entries(departments).forEach(([acronym, department]) => {
      departmentsWithDescription[department.description] = department;
    });
    setDepartmentsWDesc(departmentsWithDescription);
  });
};

/**
 * Sets the User essential information
 * @param userInfo
 * @param userId
 * @param setUSER
 */
const setUserInformation = (
  userInfo: userContext,
  userId: string,
  setUSER: Function
) => {
  let usrImgUrlComp = getUserImgUrl(userId, null, true);
  let usrImgUrl = getUserImgUrl(userId, null, false);
  setUSER({
    id: userId,
    name: userInfo.name,
    department: userInfo.department,
    position: userInfo.position,
    joinedIn: userInfo.joinedIn,
    usrImg: usrImgUrl,
    usrImgComp: usrImgUrlComp,
  });
};

export {
  getAndSetApplicationSettings,
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  setDisplayApplication,
  setUserInformation,
  getDepartments,
};
