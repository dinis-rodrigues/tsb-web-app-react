import { connect } from "react-redux";
import { Fragment } from "react";
import { setEnableLoginPage } from "../../reducers/ThemeOptions";
import cx from "classnames";
import ValidationError from "./ValidationError";
import emailValidate from "./emailValidate";
import { useForm } from "react-hook-form";

import { useAuth } from "../../contexts/AuthContext";
import { withRouter, Redirect, Link } from "react-router-dom";
import { signUpUser } from "./registerUtils";
type Props = {
  setEnableLoginPage: Function;
};
const Register = ({ setEnableLoginPage }: Props) => {
  //   Form Validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({ mode: "onChange" });
  const {
    registerUser,
    displayContent,
    applicationSettings,
    displayMaintenance,
  } = useAuth();

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
                      <div>Welcome!</div>
                      <span>
                        It only takes a{" "}
                        <span className="text-info">few seconds</span> to create
                        your account
                      </span>
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
                      signUpUser(getValues, registerUser, applicationSettings)
                    )}
                  >
                    <div className="form-group text-white">
                      <label htmlFor="fullName">
                        <span className="text-info">*</span>Full Name
                      </label>
                      <div>
                        <input
                          type="text"
                          className={cx("form-control-login glass-morph", {
                            "is-invalid": errors.fullName,
                            "is-valid":
                              !errors.fullName && getValues().fullName,
                          })}
                          placeholder="John The Greatest Doe"
                          {...register("fullName", {
                            validate: (value) => {
                              return (
                                parseInt(value.split(" ").length) > 1 ||
                                "Please enter your full name"
                              );
                            },
                            required: "Please enter your full name",
                          })}
                        />
                        {errors.fullName && (
                          <ValidationError msg={errors.fullName.message} />
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="col">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="exampleEmail" className="">
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
                      <div className="col-md-6">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="exampleConfirmEmail" className="">
                            <span className="text-info">* </span>
                            Confirm Email
                          </label>
                          <input
                            placeholder="example@tecnico.ulisboa.pt"
                            type="email"
                            className={cx("form-control-login glass-morph", {
                              "is-invalid": errors.emailConfirmation,
                              "is-valid":
                                !errors.emailConfirmation &&
                                getValues().emailConfirmation,
                            })}
                            //   onPaste={(e) => {
                            //     e.preventDefault();
                            //     return false;
                            //   }}
                            {...register("emailConfirmation", {
                              required: "Please confirm your email.",
                              validate: (value) => {
                                const values = getValues();
                                return (
                                  values.email === value ||
                                  "Please enter the same email as before."
                                );
                              },
                            })}
                          />
                          {errors.emailConfirmation && (
                            <ValidationError
                              msg={errors.emailConfirmation.message}
                            />
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="examplePassword" className="">
                            <span className="text-info">* </span>
                            Password
                          </label>
                          <input
                            placeholder="Password here..."
                            type="password"
                            className={cx("form-control-login glass-morph", {
                              "is-invalid": errors.password,
                              "is-valid":
                                !errors.password && getValues().password,
                            })}
                            {...register("password", {
                              required: "Please enter a password.",
                              validate: (value) => {
                                const values = getValues();
                                return (
                                  values.password.length >= 6 ||
                                  "Must have at least 6 characters."
                                );
                              },
                            })}
                          />
                          {errors.password && (
                            <ValidationError msg={errors.password.message} />
                          )}
                          {/* {errors.password.type === "minLength" && (
                          <ValidationError msg={"Password must have at least 6 characters."} />
                        )} */}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="examplePasswordRep" className="">
                            <span className="text-info">* </span>Repeat Password
                          </label>
                          <input
                            placeholder="Repeat Password here..."
                            type="password"
                            className={cx("form-control-login glass-morph", {
                              "is-invalid": errors.passwordConfirmation,
                              "is-valid":
                                !errors.passwordConfirmation &&
                                getValues().passwordConfirmation,
                            })}
                            onPaste={(e) => {
                              e.preventDefault();
                              return false;
                            }}
                            {...register("passwordConfirmation", {
                              required: "Please confirm your password!",
                              validate: (value) => {
                                const values = getValues();
                                return (
                                  values.password === value ||
                                  "Please enter the same password as before."
                                );
                              },
                            })}
                          />
                          {errors.passwordConfirmation && (
                            <ValidationError
                              msg={errors.passwordConfirmation.message}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="divider"></div>
                    <div className="mt-4 d-flex align-items-center text-white">
                      <h5 className="mb-0">
                        Already have an account?{" "}
                        <Link to="/login" className="text-info">
                          Sign in
                        </Link>
                      </h5>
                      <div className="ml-auto">
                        <button
                          type="submit"
                          className="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-info btn-lg"
                        >
                          Create Account
                        </button>
                      </div>
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
  connect(mapStateToProps, mapDispatchToProps)(Register)
);
