import cx from "classnames";

type Props = {
  children?: React.ReactNode;
  title: string;
  isActive?: boolean;
  toggle: () => void;
  icon: string;
};

const NavigationDropdown = ({ children, title, toggle, icon, isActive = false }: Props) => {
  return (
    <li className="metismenu-item">
      <span
        className={cx("metismenu-link", "cursor-pointer", {
          "font-weight-bold": isActive,
        })}
        onClick={toggle}
      >
        <i className={`metismenu-icon ${icon}`}></i>
        {title}
        <i className="metismenu-state-icon pe-7s-angle-down fa fa-caret-left"></i>
      </span>
      {children}
    </li>
  );
};

export default NavigationDropdown;
