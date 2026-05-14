import { useLocation } from "react-router-dom";
import { Bell, User, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlertContext } from "../../contexts/AlertContext";

const BREADCRUMBS = {
  "/": "Dashboard",
  "/analysis/new": "Nova Análise",
  "/history": "Histórico",
  "/alerts": "Alertas",
  "/settings": "Configurações",
};

export default function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unresolvedCount } = useAlertContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const breadcrumb =
    BREADCRUMBS[location.pathname] ||
    (location.pathname.startsWith("/analysis/") &&
    location.pathname !== "/analysis/new"
      ? "Detalhes da Análise"
      : "InsightFlow");

  return (
    <header
      style={{
        height: 64,
        background: "#011C26",
        borderBottom: "1px solid rgba(27,175,191,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, color: "#F2F2F2" }}>
        {breadcrumb}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <Bell size={20} style={{ color: "rgba(242,242,242,0.6)" }} />
          {unresolvedCount > 0 && (
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

        {/* User dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: "rgba(7,74,89,0.6)",
              border: "1px solid rgba(27,175,191,0.25)",
              borderRadius: 8,
              padding: "6px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#F2F2F2",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(11,158,191,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={14} style={{ color: "#1FAFBF" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {user?.name?.split(" ")[0]}
            </span>
            <ChevronDown size={14} style={{ color: "rgba(242,242,242,0.5)" }} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                background: "#074A59",
                border: "1px solid rgba(27,175,191,0.25)",
                borderRadius: 8,
                minWidth: 180,
                zIndex: 100,
                padding: "4px",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(27,175,191,0.15)",
                }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#F2F2F2" }}
                >
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: "rgba(242,242,242,0.45)" }}>
                  {user?.email}
                </div>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  padding: "10px 14px",
                  cursor: "pointer",
                  color: "#E05252",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                <LogOut size={14} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
