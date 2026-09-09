import { useEffect, useState } from "react";
import AlertCard from "../components/ui/AlertCard";
import { useAlerts } from "../hooks/useAlerts";
import { Filter } from "lucide-react";

const TYPE_LABELS = {
  CHURN_RISK: "Churn Risk",
  UPSELL_OPPORTUNITY: "Upsell",
  COMPETITOR_MENTIONED: "Concorrência",
  PERSONA_IDENTIFIED: "Persona",
};

export default function AlertsPage() {
  const { alerts, unresolvedCount, fetchAlerts, resolveAlert, loading } =
    useAlerts();
  const [displayAlerts, setDisplayAlerts] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");

  useEffect(() => {
    fetchAlerts({ status: "OPEN" }).catch(() => {});
  }, []);

  useEffect(() => {
    setDisplayAlerts(alerts || []);
  }, [alerts]);

  const handleResolve = async (id) => {
    try {
      await resolveAlert(id, "RESOLVED");
      setDisplayAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setDisplayAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const filtered = displayAlerts
    .filter((a) => {
      if (filterType && a.type !== filterType) return false;
      if (filterSeverity && a.severity < Number(filterSeverity)) return false;
      return true;
    })
    .sort((a, b) => b.severity - a.severity);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              color: "#F2F2F2",
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Alertas Ativos
          </h2>
          <p
            style={{
              color: "rgba(242,242,242,0.5)",
              fontSize: 13,
              margin: "4px 0 0",
            }}
          >
            {unresolvedCount || filtered.length} alertas pendentes de tratamento
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#074A59",
          border: "1px solid rgba(27,175,191,0.25)",
          borderRadius: 8,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Filter size={15} style={{ color: "rgba(242,242,242,0.5)" }} />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            background: "rgba(1,28,38,0.6)",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 6,
            color: "#F2F2F2",
            padding: "6px 12px",
            fontSize: 13,
            fontFamily: '"DM Sans", sans-serif',
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">Todos os tipos</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          style={{
            background: "rgba(1,28,38,0.6)",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 6,
            color: "#F2F2F2",
            padding: "6px 12px",
            fontSize: 13,
            fontFamily: '"DM Sans", sans-serif',
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">Todas as urgências</option>
          <option value="4">Alta urgência (4+)</option>
          <option value="3">Média urgência (3+)</option>
          <option value="1">Todas</option>
        </select>
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            color: "rgba(242,242,242,0.4)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#3DB87A" }}>
            Nenhum alerta pendente
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Todos os alertas foram tratados!
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              type={alert.type}
              excerpt={alert.excerpt}
              competitor={alert.detail}
              clientName={alert.clientName}
              date={alert.createdAt}
              severity={alert.severity}
              onResolve={() => handleResolve(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
