import { NavLink } from "react-router-dom";

type Props = {
  pageName: string;
  to: string;
  activeClassName?: string;
  icon?: string;
  isVisible?: boolean;
  reloadDocument?: boolean;
};

const NavItem = ({
  pageName,
  to,
  activeClassName = "active",
  icon = "",
  isVisible = true,
  reloadDocument = false,
}: Props) => {
  return isVisible ? (
    <li className="metismenu-item">
      <NavLink
        reloadDocument={reloadDocument}
        className={({ isActive }) => `metismenu-link ${isActive ? activeClassName : ""}`}
        to={to}
      >
        <i className={`metismenu-icon ${icon}`}></i>
        {pageName}
      </NavLink>
    </li>
  ) : null;
};

export default NavItem;
