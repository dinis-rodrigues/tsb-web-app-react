import cx from "classnames";
type Props = {
  isDarkMode: boolean;
  setIsDarkMode: Function;
};
const DarkModeToggle = ({ isDarkMode, setIsDarkMode }: Props) => {
  return (
    <span
      className={cx("icon-wrapper icon-wrapper-alt rounded-circle")}
      onClick={() => {
        localStorage.setItem("tsbDarkTheme", isDarkMode ? "false" : "true"); // We store the contrary
        setIsDarkMode(!isDarkMode);
      }}
    >
      <span
        id="notificationColorWrapper"
        className={cx("icon-wrapper-bg ")}
      ></span>
      <i
        id="notificationColor"
        className={cx("icon fas", {
          "fa-moon": !isDarkMode,
          "fa-sun": isDarkMode,
        })}
      ></i>
    </span>
  );
};

export default DarkModeToggle;
