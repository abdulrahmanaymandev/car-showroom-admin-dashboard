import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import {
  DashboardIcon,
  InventoryIcon,
  OrdersIcon,
  UsersIcon,
  SearchIcon,
  LogoutIcon,
  ShieldIcon
} from "./Icons";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../data/translations";

export default function SideBar({ isOpen, setIsLoggedIn }) {
  const { lang } = useLanguage();
  const t = translations[lang];

  const navItems = [
    { to: "/dashboard", title: t.dashboard, icon: <DashboardIcon /> },
    { to: "/dashboard/products", title: t.inventory, icon: <InventoryIcon /> },
    { to: "/dashboard/orders", title: t.orders, icon: <OrdersIcon /> },
    { to: "/dashboard/users", title: t.users, icon: <UsersIcon /> },
    { to: "/dashboard/specifications", title: t.specifications, icon: <SearchIcon /> },
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <h2 className="sidebar-title">
        <div className="logo-wrapper">
          <ShieldIcon size={24} />
          <span>{t.admin}</span>
        </div>
        <div className="sidebar-title-line"></div>
      </h2>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? "list-nav active" : "list-nav")}
                end={item.to === "/dashboard"}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.title}</span>
              </NavLink>
            </li>
          ))}

          <button className={"logout-btn"} onClick={handleLogout}>
            <LogoutIcon />
            <span>{t.logout}</span>
          </button>
        </ul>
      </nav>
    </aside>
  );
}
