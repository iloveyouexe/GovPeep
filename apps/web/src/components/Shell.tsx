import type { ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Building2,
  Settings,
  Plus,
  LogOut,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { brand } from "@govpeep/contracts";
import { Brand } from "./Brand";

const navigation = [
  { to: "/app", label: "Overview", icon: LayoutDashboard },
  { to: "/requests", label: "My requests", icon: FileText },
  { to: "/directory", label: "Directory", icon: Building2 },
  { to: "/schedules", label: "Schedules", icon: CalendarClock },
  { to: "/settings", label: "Settings", icon: Settings },
];
export function Shell({ children }: { children?: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const section =
    navigation.find((n) => location.pathname.startsWith(n.to))?.label ||
    "Workspace";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="workspace-label">
          <span className="workspace-avatar">{brand.name.charAt(0)}</span>
          <div>
            Personal workspace<small>Public records, organized</small>
          </div>
        </div>
        <Link to="/requests/new" className="button primary new-request">
          <Plus size={17} /> New request
        </Link>
        <nav aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
              {to === "/schedules" && <small className="soon">Soon</small>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {user ? (
            <div className="account-row">
              <span className="account-avatar">
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </span>
              <Link to="/settings">
                <strong>{user.name || "Your account"}</strong>
                <small>{user.email}</small>
              </Link>
              <button
                className="icon-button"
                aria-label="Sign out"
                onClick={() => {
                  void api("/api/auth/sign-out", { method: "POST", body: "{}" })
                    .then(() => window.location.assign("/"))
                    .catch(() =>
                      window.alert("Could not sign out. Please try again."),
                    );
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <Link to="/sign-in" className="sign-in-link">
              Sign in / Create account <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </aside>
      <div className="main-shell">
        <div className="topbar">
          <span>
            {brand.name} <span className="breadcrumb-separator">/</span>{" "}
            <strong>{section}</strong>
          </span>
          <span className="early-access">
            <span className="live-dot" /> Early access
          </span>
        </div>
        <main id="main" className="page-content">
          {children ?? <Outlet />}
        </main>
        <footer className="app-footer">
          <span>Clear requests. Better access.</span>
          <span>{brand.name} · Independent public records workspace</span>
        </footer>
      </div>
    </div>
  );
}
