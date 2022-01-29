import { sendPasswordResetEmail } from "firebase/auth";
import { FieldValues, UseFormGetValues } from "react-hook-form";
import { auth } from "../../config/firebase";

const resetPassword = (getValues: UseFormGetValues<FieldValues>) => {
  //   const { password } = getValues();
};

const sendResetLink = (
  getValues: UseFormGetValues<FieldValues>,
  setSentEmail: Function,
  setErrorMsg: Function
) => {
  const { email } = getValues();
  sendPasswordResetEmail(auth, email)
    .then(() => {
      setSentEmail(true);
    })
    .catch((error) => {
      setErrorMsg(error.message);
      // ..
    });
};

export { resetPassword, sendResetLink };
