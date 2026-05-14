import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Bell,
  Settings,
  Activity,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlertContext } from "../../contexts/AlertContext";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/analysis/new", icon: PlusCircle, label: "Nova Análise" },
  { to: "/history", icon: History, label: "Histórico" },
  { to: "/alerts", icon: Bell, label: "Alertas" },
  { to: "/settings", icon: Settings, label: "Configurações" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { unresolvedCount } = useAlertContext();
  const location = useLocation();

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: "100vh",
        background: "#011C26",
        borderRight: "1px solid rgba(27,175,191,0.15)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 0" : "20px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(27,175,191,0.12)",
          minHeight: 64,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            minWidth: 32,
            background: "linear-gradient(135deg, #0B9EBF, #1FAFBF)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Activity size={18} style={{ color: "#011C26" }} />
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#F2F2F2",
                lineHeight: 1,
              }}
            >
              InsightFlow
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(242,242,242,0.45)",
                fontWeight: 400,
              }}
            >
              TOTVS
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0" }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(to, exact);
          return (
            <NavLink
              key={to}
              to={to}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "10px 0" : "10px 20px",
                justifyContent: collapsed ? "center" : "flex-start",
                textDecoration: "none",
                background: active ? "rgba(11,158,191,0.12)" : "transparent",
                borderLeft: active
                  ? "3px solid #0B9EBF"
                  : "3px solid transparent",
                color: active ? "#1FAFBF" : "rgba(242,242,242,0.6)",
                transition: "all 0.15s",
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={20} />
                {label === "Alertas" && unresolvedCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      background: "#E05252",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unresolvedCount > 9 ? "9+" : unresolvedCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>
                  {label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          borderTop: "1px solid rgba(27,175,191,0.12)",
          padding: collapsed ? "12px 0" : "12px 16px",
        }}
      >
        {!collapsed && user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(11,158,191,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={16} style={{ color: "#1FAFBF" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2" }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "rgba(242,242,242,0.45)" }}>
                {user.role === "director" ? "Diretor Comercial" : "Consultor"}
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: collapsed ? "center" : "space-between",
            alignItems: "center",
          }}
        >
          {!collapsed && (
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(242,242,242,0.5)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
              }}
            >
              <LogOut size={15} /> Sair
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "rgba(27,175,191,0.1)",
              border: "1px solid rgba(27,175,191,0.25)",
              borderRadius: 6,
              color: "#1FAFBF",
              cursor: "pointer",
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
