import firebase from "firebase/app";
import { FieldValues, UseFormGetValues } from "react-hook-form";

const resetPassword = (getValues: UseFormGetValues<FieldValues>) => {
  //   const { password } = getValues();
};

const sendResetLink = (
  getValues: UseFormGetValues<FieldValues>,
  setSentEmail: Function,
  setErrorMsg: Function
) => {
  const { email } = getValues();
  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(() => {
      setSentEmail(true);
    })
    .catch((error) => {
      setErrorMsg(error.message);
      // ..
    });
};

export { resetPassword, sendResetLink };
