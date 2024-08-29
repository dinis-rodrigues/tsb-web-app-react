import cx from "classnames";
import { useForm } from "react-hook-form";
import ValidationError from "../Register/ValidationError";

import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ResetPassword = () => {
  //   Form Validation
  const {
    register,
    // handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({ mode: "onChange" });
  const { displayContent, displayMaintenance } = useAuth();

  return (
    <>
      <div className="h-100 tsb-background">
        <div className="d-flex h-100 justify-content-center align-items-center">
          <div className="mx-auto app-login-box col-md-8">
            <div className="modal-dialog modal-lg w-100 mx-auto">
              <div className="modal-content glass-morph el-up">
                <div className="modal-body">
                  <div className="app-logo-w mx-auto mb-3"></div>
                  <div className="h5 modal-title text-center text-white">
                    <h4>
                      <div>Reset Password</div>
                    </h4>
                    {displayMaintenance && (
                      <div className="badge badge-danger ml-2">Under Maintenance</div>
                    )}
                  </div>
                  <form
                    className="mx-auto"
                    // onSubmit={handleSubmit(() =>
                    //   signUpUser(getValues, registerUser, applicationSettings)
                    // )}
                  >
                    <div className="form-row">
                      <div className="col-md-6">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="examplePassword">
                            <span className="text-info">* </span>
                            Password
                          </label>
                          <input
                            placeholder="Password here..."
                            type="password"
                            className={cx("form-control-login glass-morph", {
                              "is-invalid": errors.password,
                              "is-valid": !errors.password && getValues().password,
                            })}
                            {...register("password", {
                              required: "Please enter a password.",
                              validate: (value) => {
                                const values = getValues();
                                return (
                                  values.password.length >= 6 || "Must have at least 6 characters."
                                );
                              },
                            })}
                          />
                          {errors.password?.message && (
                            <ValidationError msg={errors.password.message?.toString()} />
                          )}
                          {/* {errors.password.type === "minLength" && (
                          <ValidationError msg={"Password must have at least 6 characters."} />
                        )} */}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="position-relative form-group text-white">
                          <label htmlFor="examplePasswordRep">
                            <span className="text-info">* </span>Repeat Password
                          </label>
                          <input
                            placeholder="Repeat Password here..."
                            type="password"
                            className={cx("form-control-login glass-morph", {
                              "is-invalid": errors.passwordConfirmation,
                              "is-valid":
                                !errors.passwordConfirmation && getValues().passwordConfirmation,
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
                          {errors.passwordConfirmation?.message && (
                            <ValidationError
                              msg={errors.passwordConfirmation.message?.toString()}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="divider"></div>
                    <div className="mt-4 d-flex align-items-center text-white">
                      <div className="ml-auto mr-auto">
                        <button
                          type="submit"
                          className="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-info btn-lg"
                        >
                          Confirm new password
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
      {displayContent && <Navigate to={"/dashboard"} />}
    </>
  );
};

export default ResetPassword;
