import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Bell,
  Settings,
} from "lucide-react";

const MOBILE_NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analysis/new", icon: PlusCircle, label: "Análise" },
  { to: "/history", icon: History, label: "Histórico" },
  { to: "/alerts", icon: Bell, label: "Alertas" },
  { to: "/settings", icon: Settings, label: "Config" },
];

export default function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 64 : 240;

  return (
    <div style={{ minHeight: "100vh", background: "#06242E" }}>
      {!isMobile && <Sidebar onCollapse={setSidebarCollapsed} />}

      <div
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          transition: "margin-left 0.25s ease",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: isMobile ? "16px" : "24px",
            paddingBottom: isMobile ? "80px" : "24px",
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            background: "#011C26",
            borderTop: "1px solid rgba(27,175,191,0.2)",
            display: "flex",
            zIndex: 50,
          }}
        >
          {MOBILE_NAV.map(({ to, icon: Icon, label }) => {
            const active =
              location.pathname === to ||
              (to !== "/" && location.pathname.startsWith(to));
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  color: active ? "#0B9EBF" : "rgba(242,242,242,0.5)",
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
