import { Redirect, Route } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isFeatureVisible } from "../../utils/generalFunctions";

type Props = {
  component: any;
  path: string;
  exact?: boolean;
  featureName?: string;
};
const PrivateRoute = ({
  component: Component,
  path,
  exact = false,
  featureName = undefined,
}: Props) => {
  // This private route includes the header and the sidebar of the application
  // It's only rendered if a logged in user exists
  const {
    currentUser,
    displayContent,
    displayMaintenance,
    displayLogin,
    applicationFeatures,
    isAdminUser,
    isGod,
  } = useAuth();

  // const isVisible = (
  //   applicationFeatures: ApplicationFeatures,
  //   isAdminUser: boolean,
  //   isGod: boolean,
  //   featureName?: string
  // ) => {
  //   if (!featureName) return true;
  //   if (applicationFeatures[featureName].public) return true;
  //   else if ((applicationFeatures.admin && isAdminUser) || isGod) return true;
  //   else if (isGod) return true;
  //   return false;
  // };

  return (
    <Route
      exact={exact}
      path={path}
      render={(props) => {
        return currentUser && displayContent ? (
          !featureName || isFeatureVisible(featureName, applicationFeatures, isAdminUser, isGod) ? (
            <>
              <Component {...props} />
            </>
          ) : (
            <Redirect to="/dashboard" />
          )
        ) : displayLogin ? (
          <Redirect to="/login" />
        ) : (
          displayMaintenance && <Redirect to="/maintenance" />
        );
      }}
    ></Route>
  );
};

export default PrivateRoute;
