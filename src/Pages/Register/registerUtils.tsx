// Register User process, personal info

import { FieldValues, UseFormGetValues } from "react-hook-form";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { db } from "../../config/firebase";
import { ApplicationSettings } from "../../interfaces";

const swalAlert = withReactContent(Swal);

const showAlert = (getValues: UseFormGetValues<FieldValues>) => {
  var timerInterval: any = null;
  swalAlert.fire({
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
const signUpUser = (
  getValues: UseFormGetValues<FieldValues>,
  registerUser: Function,
  applicationSettings: ApplicationSettings
) => {
  const { fullName, email, password } = getValues();
  const { registrationIsOpen } = applicationSettings;
  const name = fullName.replace(/([a-z]+) .* ([a-z]+)/i, "$1 $2");
  if (registrationIsOpen) {
    // Sign up user to firebase
    registerUser(email, password)
      .then((data: any) => {
        const userId = data.user.uid;
        // console.log(data.user.uid);
        var info = {
          uid: data.user.uid,
          fullName: fullName,
          department: "Management and Marketing",
          position: "Team Member",
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
        };
        db.ref(`private/usersMetadata/${userId}/pinfo`).set(info);
        //   showAlert(getValues);
      })
      .catch((error: string) => {
        swalAlert.fire({
          title: "Ooops!",
          icon: "error",
          html: `<p>${error}</p>`,
        });
      });
  } else {
    swalAlert.fire({
      title: "Registration is closed!",
      icon: "error",
      html: `<p>Contact the admin for further details.</p>`,
    });
  }
};

export { signUpUser, showAlert };
