import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Mic,
  RefreshCw,
} from "lucide-react";
import KPICard from "../components/ui/KPICard";
import StatusBadge from "../components/ui/StatusBadge";
import { dashboardService, analysisService } from "../services/api";
import { formatDateTime } from "../utils/formatDate";

const ALERT_BADGE = {
  UPSELL_OPPORTUNITY: {
    label: "UPSELL DETECTADO",
    color: "#3DB87A",
    bg: "rgba(61,184,122,0.15)",
  },
  CHURN_RISK: {
    label: "CHURN RISK",
    color: "#E05252",
    bg: "rgba(224,82,82,0.15)",
  },
  COMPETITOR_MENTIONED: {
    label: "CONCORRÊNCIA",
    color: "#E0A048",
    bg: "rgba(224,160,72,0.15)",
  },
};

function getAlertBadge(alerts) {
  if (!alerts?.length)
    return {
      label: "NORMAL",
      color: "rgba(242,242,242,0.4)",
      bg: "rgba(242,242,242,0.08)",
    };
  return (
    ALERT_BADGE[alerts[0].type] || {
      label: alerts[0].type,
      color: "#0B9EBF",
      bg: "rgba(11,158,191,0.15)",
    }
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [sortCol, setSortCol] = useState("totalAnalyses");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [kpiData, rankData, analysisData] = await Promise.all([
        dashboardService.getKpis("30d"),
        dashboardService.getConsultantsRanking(),
        analysisService.getAll({ limit: 5 }),
      ]);
      setKpis(kpiData);
      setRanking(rankData);
      setAnalyses(analysisData.data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message || "Não foi possível carregar o dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedRanking = [...ranking].sort((a, b) => {
    const mult = sortDir === "asc" ? 1 : -1;
    return (a[sortCol] > b[sortCol] ? 1 : -1) * mult;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  };

  const cmp = kpis?.periodComparison || {};

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h2
          style={{ color: "#F2F2F2", fontSize: 20, fontWeight: 700, margin: 0 }}
        >
          Dashboard Executivo
        </h2>
        <button
          onClick={load}
          style={{
            background: "transparent",
            border: "1px solid rgba(27,175,191,0.3)",
            borderRadius: 8,
            color: "#1FAFBF",
            padding: "6px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <RefreshCw
            size={14}
            style={loading ? { animation: "spin 1s linear infinite" } : {}}
          />{" "}
          Atualizar
        </button>
      </div>

      {loadError && (
        <div
          style={{
            background: "rgba(224,82,82,0.1)",
            border: "1px solid rgba(224,82,82,0.3)",
            borderRadius: 8,
            padding: "10px 16px",
            marginBottom: 20,
            color: "#E05252",
            fontSize: 13,
          }}
        >
          {loadError}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
        className="kpi-grid"
      >
        <KPICard
          title="Reuniões Analisadas"
          value={kpis ? kpis.totalAnalyses : "—"}
          icon={FileText}
          trend={cmp.totalAnalysesVariation}
          color="#0B9EBF"
        />
        <KPICard
          title="Upsell Detectados"
          value={kpis ? kpis.upsellOpportunities : "—"}
          icon={TrendingUp}
          trend={cmp.upsellVariation}
          color="#3DB87A"
        />
        <KPICard
          title="Alertas de Churn"
          value={kpis ? kpis.churnAlerts : "—"}
          icon={AlertTriangle}
          trend={cmp.churnVariation}
          color="#E05252"
        />
        <KPICard
          title="Talk-to-Listen Médio"
          value={kpis ? `${(kpis.avgTalkRatioConsultant ?? 0).toFixed(1)}%` : "—"}
          icon={Mic}
          trend={cmp.talkVariation}
          color={kpis?.avgTalkRatioConsultant > 60 ? "#E0A048" : "#3DB87A"}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        className="bottom-grid"
      >
        {/* Recent Analyses */}
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: "20px",
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 15,
              fontWeight: 600,
              margin: "0 0 16px",
            }}
          >
            Últimas Análises
          </h3>
          {analyses.length === 0 && (
            <p style={{ color: "rgba(242,242,242,0.4)", fontSize: 13 }}>
              Nenhuma análise realizada ainda.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analyses.map((a) => {
              const badge = getAlertBadge(a.alerts);
              return (
                <div
                  key={a.id}
                  onClick={() => navigate(`/analysis/${a.id}`)}
                  style={{
                    padding: "12px",
                    background: "rgba(1,28,38,0.4)",
                    borderRadius: 8,
                    border: "1px solid rgba(27,175,191,0.15)",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "rgba(27,175,191,0.4)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(27,175,191,0.15)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#F2F2F2",
                        }}
                      >
                        {a.clientName || a.clientId}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "rgba(242,242,242,0.5)" }}
                      >
                        {a.consultant || a.consultantName} ·{" "}
                        {formatDateTime(a.createdAt)}
                      </div>
                    </div>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        letterSpacing: 0.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking */}
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: "20px",
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 15,
              fontWeight: 600,
              margin: "0 0 16px",
            }}
          >
            Ranking de Consultores
          </h3>
          {ranking.length === 0 && (
            <p style={{ color: "rgba(242,242,242,0.4)", fontSize: 13 }}>
              Nenhum consultor com análises concluídas ainda.
            </p>
          )}
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  {[
                    { col: null, label: "#" },
                    { col: "consultantName", label: "Nome" },
                    { col: "totalAnalyses", label: "Reuniões" },
                    { col: "avgTalkRatio", label: "Talk%" },
                    { col: "efficiencyScore", label: "Score" },
                  ].map(({ col, label }) => (
                    <th
                      key={label}
                      onClick={() => col && handleSort(col)}
                      style={{
                        color: "rgba(242,242,242,0.5)",
                        fontWeight: 600,
                        padding: "6px 8px",
                        textAlign: "left",
                        cursor: col ? "pointer" : "default",
                        borderBottom: "1px solid rgba(27,175,191,0.15)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}{" "}
                      {col && sortCol === col
                        ? sortDir === "asc"
                          ? "↑"
                          : "↓"
                        : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRanking.map((c, idx) => (
                  <tr
                    key={c.consultantId}
                    style={{ borderBottom: "1px solid rgba(27,175,191,0.08)" }}
                  >
                    <td
                      style={{
                        padding: "8px",
                        color: "rgba(242,242,242,0.4)",
                        fontFamily: '"Space Mono", monospace',
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: "#F2F2F2",
                        fontWeight: 500,
                      }}
                    >
                      {c.consultantName}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: "#F2F2F2",
                        fontFamily: '"Space Mono", monospace',
                      }}
                    >
                      {c.totalAnalyses}
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: c.avgTalkRatio > 60 ? "#E0A048" : "#3DB87A",
                        fontFamily: '"Space Mono", monospace',
                      }}
                    >
                      {c.avgTalkRatio?.toFixed(1)}%
                    </td>
                    <td
                      style={{
                        padding: "8px",
                        color: "#0B9EBF",
                        fontFamily: '"Space Mono", monospace',
                        fontWeight: 700,
                      }}
                    >
                      {c.efficiencyScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr !important; } .bottom-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
