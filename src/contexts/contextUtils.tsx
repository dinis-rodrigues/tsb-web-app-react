import { auth, db } from "../config/firebase";
import {
  ApplicationSettings,
  Departments,
  DepartmentsWithDesc,
  userContext,
} from "../interfaces";
import firebase from "firebase/app";

/**
 * Get and set application settings state
 * @param setMaintenanceIsOpen
 * @param setRegistrationIsOpen
 */
const getAndSetApplicationSettings = (setApplicationSettings: Function) => {
  db.ref("public/applicationSettings").on("value", (snapshot) => {
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
    const unsubscribe: any = auth.onAuthStateChanged((user: firebase.User) => {
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

  return auth.createUserWithEmailAndPassword(email, password);
};

/**
 * Logins the user with email and password to the application
 * @param email
 * @param password
 * @returns
 */
const loginUser = (email: string, password: string, rememberMe: boolean) => {
  firebase
    .auth()
    .setPersistence(
      rememberMe
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION
    )
    .then(() => {
      return auth.signInWithEmailAndPassword(email, password);
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

    // console.log("Display content", displayContent);
    // console.log("Display login", displayLogin);
    // console.log("Display maintenance", displayMaintenance);

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
  db.ref("private/departments").on("value", (snapshot) => {
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

export {
  getAndSetApplicationSettings,
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  setDisplayApplication,
  getDepartments,
};
