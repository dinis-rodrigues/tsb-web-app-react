import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isFeatureVisible } from "../../utils/generalFunctions";

type Props = {
  featureName?: string;
  children: JSX.Element | JSX.Element[];
};
const PrivateRoute = ({ featureName = undefined, children }: Props) => {
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

  const elemToRender =
    currentUser && displayContent ? (
      !featureName || isFeatureVisible(featureName, applicationFeatures, isAdminUser, isGod) ? (
        <>{children}</>
      ) : (
        <Navigate to="/dashboard" />
      )
    ) : displayLogin ? (
      <Navigate to="/login" />
    ) : (
      displayMaintenance && <Navigate to="/maintenance" />
    );

  return elemToRender;
};

export default PrivateRoute;
