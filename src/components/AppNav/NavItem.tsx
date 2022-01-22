import { NavLink } from "react-router-dom";

type Props = {
  pageName: string;
  to: string;
  activeClassName?: string;
  icon?: string;
};

const NavItem = ({
  pageName,
  to,
  activeClassName = "active",
  icon = "",
}: Props) => {
  return (
    <li className="metismenu-item">
      <NavLink
        className="metismenu-link"
        to={to}
        activeClassName={activeClassName}
      >
        <i className={`metismenu-icon ${icon}`}></i>
        {pageName}
      </NavLink>
    </li>
  );
};

export default NavItem;
