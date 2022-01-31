import { Fragment } from "react";
import { Redirect } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Maintenance = () => {
  const { displayContent, displayMaintenance, displayLogin } = useAuth();
  return displayMaintenance ? (
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
                      <div>Sorry</div>
                      <span>The application is down for maintenance</span>
                      {displayMaintenance && (
                        <div
                          className="badge badge-danger ml-2"
                          style={{ opacity: 1 }}
                        >
                          ETA: Undefined
                        </div>
                      )}
                    </h4>
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
  ) : displayContent ? (
    <Redirect to={"/dashboard"} />
  ) : displayLogin ? (
    <Redirect to={"/dashboard"} />
  ) : null;
};

export default Maintenance;
