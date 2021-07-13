import { connect } from "react-redux";
import { useState, Fragment } from "react";
import { setEnableLoginPage } from "../../reducers/ThemeOptions";
import { useAuth } from "../../contexts/AuthContext";
// import { auth } from "../../config/firebase";
// import firebase from "firebase/app";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { withRouter, Redirect } from "react-router-dom";

type Props = {
  setEnableLoginPage: Function;
};

const Login = ({ setEnableLoginPage }: Props) => {
  const swalAlert = withReactContent(Swal);
  const { loginUser, displayContent, displayMaintenance } = useAuth();

  // State of input listener
  const [inputVal, setInputVal] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const inputListener = (e: any) => {
    if (e.target.name === "rememberMe") {
      setInputVal({ ...inputVal, [e.target.name]: e.target.checked });
    } else {
      setInputVal({ ...inputVal, [e.target.name]: e.target.value });
    }
  };

  async function onLogin(e: any) {
    e.preventDefault();
    try {
      await loginUser(inputVal.email, inputVal.password, inputVal.rememberMe);
    } catch (error) {
      // console.log(error);
      swalAlert.fire({
        title: "Ooops!",
        icon: "error",
        html: `<p>${error.message}</p>`, // prettier message
      });
    }
  }

  return (
    <Fragment>
      <div className="h-100 tsb-background">
        <div className="d-flex h-100 justify-content-center align-items-center">
          <div className="mx-auto app-login-box col-md-8">
            <div className="modal-dialog w-100 mx-auto">
              <div className="modal-content glass-morph el-up">
                <div className="modal-body">
                  <div className="app-logo-w mx-auto mb-3"></div>
                  <div className="h5 modal-title text-center text-white">
                    <h4 className="mt-2">
                      <div>Welcome back</div>
                      <span>Please sign in to your account below.</span>
                      {displayMaintenance && (
                        <div
                          className="badge badge-danger ml-2"
                          style={{ opacity: 1 }}
                        >
                          Maintenance: Login disabled
                        </div>
                      )}
                    </h4>
                  </div>
                  <div className="form-row">
                    <div className="col-md-12">
                      <div className="position-relative form-group ">
                        <input
                          name="email"
                          value={inputVal.email || ""}
                          id="email"
                          placeholder="Email here..."
                          onChange={(e) => inputListener(e)}
                          type="email"
                          className="form-control-login glass-morph"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="position-relative form-group">
                        <input
                          name="password"
                          id="password"
                          value={inputVal.password || ""}
                          onChange={(e) => inputListener(e)}
                          placeholder="Password here..."
                          type="password"
                          className="form-control-login glass-morph"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col">
                      <div className="position-relative form-check text-white">
                        <input
                          name="rememberMe"
                          id="rememberMe"
                          type="checkbox"
                          className="form-check-input"
                          checked={inputVal.rememberMe}
                          onChange={inputListener}
                        />
                        <label
                          htmlFor="exampleCheck"
                          className="form-check-label"
                        >
                          Keep me logged in
                        </label>
                      </div>
                    </div>
                    <div className="col">
                      <div className="position-relative form-check float-right">
                        <label
                          htmlFor="exampleCheck"
                          className="form-check-label"
                        >
                          <a href="/#" className="text-white">
                            Recover Password
                          </a>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="row">
                    <div className="col">
                      <h6 className="mb-0 text-white">
                        No account?{" "}
                        <a href="/register" className="text-info">
                          Sign up now
                        </a>
                      </h6>
                    </div>
                    <div className="col">
                      <div className="float-right">
                        <button
                          className="btn btn-info btn-shadow btn-hover-shine btn-lg cursor-pointer"
                          onClick={onLogin}
                        >
                          Login
                        </button>
                      </div>
                    </div>
                  </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
