import { Fragment, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const AppLoading = () => {
  useEffect(() => {
    NProgress.start();
    return () => {
      NProgress.done();
    };
  }, []);
  return <Fragment />;
};

export default AppLoading;
