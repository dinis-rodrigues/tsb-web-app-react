import cx from "classnames";

type Props = {
  children?: React.ReactNode;
  isVisible?: boolean;
};

const NavigationSubSection = ({ children, isVisible = true }: Props) => {
  return (
    <ul
      className={cx("metismenu-container", {
        visible: isVisible,
      })}
    >
      {children}
    </ul>
  );
};

export default NavigationSubSection;
