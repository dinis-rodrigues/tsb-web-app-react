// import { Component } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import "./base.css";
import "./custom.css";

import Main from "./Pages/Main/Main";

import configureStore from "./config/configureStore";
import { Provider } from "react-redux";

import { AuthProvider } from "./contexts/AuthContext";

import register from "./registerServiceWorker";
const store: any = configureStore();
const rootElement = document.getElementById("root");

register();

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
