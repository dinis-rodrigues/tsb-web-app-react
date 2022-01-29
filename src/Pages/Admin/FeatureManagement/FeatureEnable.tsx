import cx from "classnames";
import { child, ref, update } from "firebase/database";
import { db } from "../../../config/firebase";
import { useAuth } from "../../../contexts/AuthContext";
import { FeaturePermissions } from "../../../interfaces";
import { pascalStringToTitleCase } from "../../../utils/generalFunctions";

type Props = {
  featurePermissions: FeaturePermissions;
  featureName: string;
};
const FeatureEnable = ({ featurePermissions, featureName }: Props) => {
  const { isGod, isAdminUser } = useAuth();

  const publicToggle = () => {
    update(child(ref(db, "private/applicationFeatures"), featureName), {
      public: !featurePermissions.public,
      admin: true,
      god: true,
    });
  };
  const adminToggle = () => {
    update(child(ref(db, "private/applicationFeatures"), featureName), {
      public: featurePermissions.admin ? false : featurePermissions.public,
      admin: !featurePermissions.admin,
      god: true,
    });
  };

  return isGod || (featurePermissions.admin && isAdminUser) ? (
    <li className="list-group-item">
      <div className="widget-content p-0">
        <div className="widget-content-wrapper">
          <div className="widget-content-left">
            <div className="widget-heading">
              {pascalStringToTitleCase(featureName)}
              <span className="widget-subheading">
                {" "}
                -{" "}
                {featurePermissions.public
                  ? "All users can view this feature"
                  : featurePermissions.admin
                  ? "Only Admin users can view this feature."
                  : featurePermissions.god
                  ? "Only God users can view this feature."
                  : "Something went wrong"}
              </span>
            </div>
          </div>
          <div className="widget-content-right">
            <button
              type="button"
              className={cx("float-right mr-1 btn btn-shadow", {
                "btn-danger": !featurePermissions.public,
                "btn-success": featurePermissions.public,
              })}
              onClick={() => publicToggle()}
            >
              {"Public"}
            </button>
            <button
              type="button"
              className={cx("float-right mr-1 btn btn-shadow", {
                "btn-danger": !featurePermissions.admin,
                "btn-success": featurePermissions.admin,
              })}
              onClick={() => (isGod ? adminToggle() : () => {})}
            >
              {"Admin"}
            </button>
            {isGod && (
              <button
                type="button"
                className={cx("float-right mr-1 btn btn-shadow", {
                  "btn-danger": !featurePermissions.god,
                  "btn-success": featurePermissions.god,
                })}
                //   onClick={() => toggleFeature(isFeatureEnabled)}
              >
                {"God"}
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  ) : null;
};

export default FeatureEnable;
