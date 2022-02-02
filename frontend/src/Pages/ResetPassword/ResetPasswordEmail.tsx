import { connect } from "react-redux";
import { Fragment, useState } from "react";
import { setEnableLoginPage } from "../../reducers/ThemeOptions";
import cx from "classnames";
import ValidationError from "../Register/ValidationError";
import { useForm } from "react-hook-form";
import emailValidate from "../Register/emailValidate";

import { useAuth } from "../../contexts/AuthContext";
import { withRouter, Redirect, Link } from "react-router-dom";
import { sendResetLink } from "./resetPasswordUtils";
type Props = {
  setEnableLoginPage: Function;
};
const ResetPasswordEmail = ({ setEnableLoginPage }: Props) => {
  //   Form Validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({ mode: "onChange" });
  const { displayContent, displayMaintenance } = useAuth();

  const [emailSent, setEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  return (
    <Fragment>
      <div className="h-100 tsb-background">
        <div className="d-flex h-100 justify-content-center align-items-center">
          <div className="mx-auto app-login-box col-md-8">
            <div className="modal-dialog modal-lg w-100 mx-auto">
              <div className="modal-content glass-morph el-up">
                <div className="modal-body">
                  <Link to="/">
                    <div className="app-logo-w mx-auto mb-3"></div>
                  </Link>
                  <div className="h5 modal-title text-center text-white">
                    <h4>
                      <div>Reset Password</div>
                    </h4>
                    {displayMaintenance && (
                      <div className="badge badge-danger ml-2">
                        Under Maintenance
                      </div>
                    )}
                  </div>
                  <form
                    className="mx-auto"
                    onSubmit={handleSubmit(() =>
                      sendResetLink(getValues, setEmailSent, setErrorMsg)
                    )}
                  >
                    <div className="form-row">
                      <div className="col">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="exampleEmail">
                            <span className="text-info">*</span>Email
                          </label>
                          <input
                            id="email"
                            placeholder="example@tecnico.ulisboa.pt"
                            type="email"
                            className={cx("form-control-login glass-morph", {
                              "is-invalid": errors.email,
                              "is-valid": !errors.email && getValues().email,
                            })}
                            {...register("email", {
                              required: "Please enter a valid email address.",
                              validate: (value) => {
                                return (
                                  emailValidate(value) || "Email is not valid"
                                );
                              },
                            })}
                          />
                          {errors.email && (
                            <ValidationError msg={errors.email.message} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="divider"></div>
                    {errorMsg && !emailSent && (
                      <div className="mt-4 d-flex align-items-center text-white">
                        <div className="ml-auto mr-auto">
                          <div className="badge badge-danger ml-2">
                            {errorMsg}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 d-flex align-items-center text-white">
                      {!emailSent && (
                        <div className="ml-auto mr-auto">
                          <button
                            type="submit"
                            className="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-info btn-lg"
                          >
                            Send reset link to this email
                          </button>
                        </div>
                      )}
                      {emailSent && (
                        <div className="ml-auto mr-auto">
                          <div className="badge badge-success ml-2">
                            Email sent, please check your email and follow the
                            link
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="text-center text-white opacity-8 mt-3">
              Copyright © Técnico Solar Boat 2021
            </div>
          </div>
        </div>
      </div>
      {/* If the user is already logged in, send him to dashboard */}
      {displayContent && <Redirect to={"/dashboard"} />}
    </Fragment>
  );
};

const mapStateToProps = (state: any) => ({
  enableLoginPage: state.ThemeOptions.enableLoginPage,
});

const mapDispatchToProps = (dispatch: Function) => ({
  setEnableLoginPage: (enable: boolean) => dispatch(setEnableLoginPage(enable)),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ResetPasswordEmail)
);
