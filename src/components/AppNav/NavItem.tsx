import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ApplicationFeatures } from "../../interfaces";

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
      <NavLink
        className="metismenu-link"
        to={to}
        activeClassName={activeClassName}
      >
        <i className={`metismenu-icon ${icon}`}></i>
        {pageName}
      </NavLink>
    </li>
  ) : null;
};

export default NavItem;
