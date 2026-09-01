import { useLocation, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconCalendarEvent,
  IconUsers,
  IconChartBar,
  IconReceipt2,
  IconBrush,
} from "@tabler/icons-react";
import styles from "./BottomNav.module.css";

const tabs = [
  {
    path: "/dashboard",
    label: "Home",
    icon: IconHome,
  },
  {
    path: "/appointments",
    label: "Appointments",
    icon: IconCalendarEvent,
  },
  {
    path: "/clients",
    label: "Clients",
    icon: IconUsers,
  },
  {
    path: "/financials",
    label: "Financials",
    icon: IconChartBar,
  },
  {
    path: "/expenses",
    label: "Expenses",
    icon: IconReceipt2,
  },
  {
    path: "/services",
    label: "Services",
    icon: IconBrush,
  },
];
const HIDDEN_NAV_ROUTES = [/^\/clients\/[^/]+$/];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideNav = HIDDEN_NAV_ROUTES.some((pattern) =>
    pattern.test(location.pathname)
  );

  if (hideNav) return null
  return (
    <nav className={styles.nav}>
      {tabs.map((tab) => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;

        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
            aria-label={tab.label}
          >
            <Icon className={styles.icon} size={22} stroke={1.8} />
          </button>
        );
      })}
    </nav>
  );
}
