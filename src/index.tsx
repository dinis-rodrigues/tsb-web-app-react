// import { Component } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "react-toastify/ReactToastify.css";
import "./assets/scss/base.scss";
import "./assets/scss/colors.scss";
import "./assets/scss/custom.scss";
import "./assets/scss/customBootstrap.scss";
import "./assets/scss/darkTheme.scss";
import "./assets/scss/icons.scss";

import Main from "./Pages/Main/Main";

import React from "react";
import { AuthProvider } from "./contexts/AuthContext";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!); // createRoot(container!) if you use TypeScript
const renderApp = () => {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Main />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
};

renderApp();

// if (module.hot) {
//   module.hot.accept("./Pages/Main/Main", () => {
//     renderApp();
//   });
// }
