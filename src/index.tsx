// import { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import "./assets/scss/colors.scss";
import "./assets/scss/base.scss";
import "./assets/scss/icons.scss";
import "./assets/scss/customBootstrap.scss";
import "./assets/scss/custom.scss";
import "./assets/scss/darkTheme.scss";

import Main from "./Pages/Main/Main";

import { Provider } from "react-redux";
import configureStore from "./config/configureStore";

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
    rootElement,
  );
};

renderApp();

// if (module.hot) {
//   module.hot.accept("./Pages/Main/Main", () => {
//     renderApp();
//   });
// }
