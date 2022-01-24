// import { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

// add bootstrap css
// import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "./colors.scss";
import "./base.scss";
import "./icons.scss";
import "./customBootstrap.scss";
import "./custom.scss";
import "./darkTheme.scss";

import Main from "./Pages/Main/Main";

import configureStore from "./config/configureStore";
import { Provider } from "react-redux";

import { AuthProvider } from "./contexts/AuthContext";

const store: any = configureStore();
const rootElement = document.getElementById("root");

const renderApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Main />
        </AuthProvider>
      </BrowserRouter>
    </Provider>,
    rootElement
  );
};

renderApp();

// if (module.hot) {
//   module.hot.accept("./Pages/Main/Main", () => {
//     renderApp();
//   });
// }
