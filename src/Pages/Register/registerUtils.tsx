// Register User process, personal info

import { get, ref, set } from "firebase/database";
import { FieldValues, UseFormGetValues } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import { ApplicationSettings, UserMetadata } from "../../interfaces";
import { normalizedString } from "../../utils/generalFunctions";

import { savePublicUser } from "../Profile/profileUtils";

const swalAlert = withReactContent(Swal);

const showAlert = (getValues: UseFormGetValues<FieldValues>) => {
  var timerInterval: any = null;
  swalAlert.fire({
    customClass: {
      denyButton: "btn btn-shadow btn-danger",
      confirmButton: "btn btn-shadow btn-info",
    },
    title: "You are now a member of Técnico Solar Boat!",
    icon: "success",
    html: "<p>Get ready to work your ass off!</p> <p>You will be redirected in <b></b>s</p>",
    timer: 7000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      timerInterval = setInterval(() => {
        const content = Swal.getContent();
        if (content) {
          const b = content.querySelector("b");
          if (b) {
            b.textContent = String(Math.round(Swal.getTimerLeft()! / 1000));
          }
        }
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  });
};

/**
 * Registers the user to the databasae, setting metadata as well
 * @param getValues
 * @param registerUser
 */
const signUpUser = async (
  getValues: UseFormGetValues<FieldValues>,
  registerUser: Function,
  applicationSettings: ApplicationSettings
) => {
  const { fullName, email, password } = getValues();
  const { registrationIsOpen } = applicationSettings;
  const name = getNameFromFullName(fullName);
  if (registrationIsOpen) {
    // Sign up user to firebase
    registerUser(email, password)
      .then(async (data: any) => {
        const userId = data.user.uid;

        let userName = await buildUserName(fullName);
        var info = {
          uid: data.user.uid,
          fullName: fullName,
          department: "Management and Marketing",
          position:
            process.env.NODE_ENV === "production" ? "Team Member" : "God",
          joinedIn: "",
          name: name,
          email: email,
          phone: "",
          mbway: "No",
          university: "Instituto Superior Técnico",
          degree: "MEEC",
          studentId: "ist",
          idCard: "",
          nif: "",
          country: "Portugal",
          birth: "",
          address: "",
          city: "Lisbon",
          zip: "",
          iban: "",
          linkedin: "",
          inTeam: true,
          departmentStats: 1,
          generalStats: 1,
          gender: "undefined",
          curricularYear: 1,
          userName: userName,
        };
        set(ref(db, `private/usersMetadata/${userId}/pinfo`), info);

        savePublicUser(userId, info);
      })
      .catch((error: string) => {
        swalAlert.fire({
          customClass: {
            denyButton: "btn btn-shadow btn-danger",
            confirmButton: "btn btn-shadow btn-info",
          },
          title: "Ooops!",
          icon: "error",
          html: `<p>${error}</p>`,
        });
      });
  } else {
    swalAlert.fire({
      customClass: {
        denyButton: "btn btn-shadow btn-danger",
        confirmButton: "btn btn-shadow btn-info",
        container: "zIndex-inf",
      },
      title: "Registration is closed!",
      icon: "error",
      html: `<p>Contact the admin for further details.</p>`,
    });
  }
};

const getNameFromFullName = (fullName: string) => {
  const names = fullName.trim().split(" ");
  let firstName = names[0];
  let lastName = names[names.length - 1];
  return `${firstName} ${lastName}`;
};

const buildUserNameFromFullName = (fullName: string) => {
  const names = fullName.trim().split(" ");
  let firstName = normalizedString(names[0]);
  let lastName = normalizedString(names[names.length - 1]);
  return `${firstName}-${lastName}`.toLowerCase();
};

const buildUserName = (fullName: string) => {
  return get(ref(db, "private/usersMetadata")).then((snapshot) => {
    const users: UserMetadata = snapshot.val();

    const usersList = Object.entries(users);

    let existingUserNames: string[] = [];
    let currUserName = buildUserNameFromFullName(fullName);

    // Get existing user names
    for (let i = 0; i < usersList.length; i++) {
      const userInfo = usersList[i][1].pinfo;

      existingUserNames.push(userInfo.userName);
    }

    // check if user name already exists
    let equalUserNames: string[] = [];
    for (const userName of existingUserNames) {
      if (userName.includes(currUserName)) {
        equalUserNames.push(userName);
      }
    }

    // add index to current username
    if (equalUserNames.length > 0) {
      // sort equalusernames
      equalUserNames.sort();
      currUserName = `${currUserName}-${equalUserNames.length}`;
    }

    return currUserName;
  });
};

export { signUpUser, showAlert, getNameFromFullName };
