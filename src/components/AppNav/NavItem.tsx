import { NavLink } from "react-router-dom";

type Props = {
  pageName: string;
  to: string;
  activeClassName?: string;
  icon?: string;
  isVisible?: boolean;
};

const NavItem = ({
  pageName,
  to,
  activeClassName = "active",
  icon = "",
  isVisible = true,
}: Props) => {
  return isVisible ? (
    <li className="metismenu-item">
      <NavLink className="metismenu-link" to={to} activeClassName={activeClassName}>
        <i className={`metismenu-icon ${icon}`}></i>
        {pageName}
      </NavLink>
    </li>
  ) : null;
};

export default NavItem;
