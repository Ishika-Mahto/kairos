import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Tracker", to: "/tracker" },
  { label: "Insights", to: "/insights" },
];

function ProtectedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar glass-panel">
        <div>
          <BrandLogo />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="muted">Predict better. Act earlier.</p>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar glass-panel">
          <div>
            <p className="eyebrow">Active Session</p>
            <h2>{user.name}</h2>
          </div>

          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        </header>

        <main className="page-transition">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ProtectedLayout;
