import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Fragment } from "react";

type Props = {
  component: any;
  path: string;
  exact?: boolean;
};
const PrivateRoute = ({ component: Component, path, exact = false }: Props) => {
  // This private route includes the header and the sidebar of the application
  // It's only rendered if a logged in user exists
  const { currentUser, displayContent, displayMaintenance, displayLogin } =
    useAuth();

  return (
    <Route
      exact={exact}
      path={path}
      render={(props) => {
        return currentUser && displayContent ? (
          <Fragment>
            <Component {...props} />
          </Fragment>
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
