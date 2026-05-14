import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  Mic,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import KPICard from "../components/ui/KPICard";
import StatusBadge from "../components/ui/StatusBadge";
import { dashboardService, analysisService } from "../services/api";
import { formatDateTime } from "../utils/formatDate";

// --- Mock data for demo when backend not connected ---
const MOCK_KPIS = {
  totalAnalyses: 142,
  upsellOpportunities: 38,
  churnAlerts: 7,
  avgTalkRatioConsultant: 58.4,
  periodComparison: {
    totalAnalysesVariation: 12,
    upsellVariation: 8,
    churnVariation: -3,
    talkVariation: -2,
  },
};

const MOCK_CHART = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: `${d.getDate()}/${d.getMonth() + 1}`,
    total: Math.floor(Math.random() * 8) + 2,
    churn: Math.floor(Math.random() * 3),
  };
});

const MOCK_ANALYSES = [
  {
    id: "1",
    clientName: "Metalúrgica São Paulo",
    clientId: "CLI001",
    consultant: "Ricardo Alves",
    createdAt: new Date().toISOString(),
    alerts: [{ type: "UPSELL_OPPORTUNITY" }],
  },
  {
    id: "2",
    clientName: "Grupo Horizonte",
    clientId: "CLI002",
    consultant: "Ana Costa",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    alerts: [{ type: "CHURN_RISK" }],
  },
  {
    id: "3",
    clientName: "Tech Solutions LTDA",
    clientId: "CLI003",
    consultant: "Carlos Mendes",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    alerts: [{ type: "COMPETITOR_MENTIONED" }],
  },
  {
    id: "4",
    clientName: "Distribuidora Norte",
    clientId: "CLI004",
    consultant: "Ricardo Alves",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    alerts: [],
  },
  {
    id: "5",
    clientName: "Construtora Delta",
    clientId: "CLI005",
    consultant: "Fernanda Lima",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    alerts: [{ type: "UPSELL_OPPORTUNITY" }],
  },
];

const MOCK_RANKING = [
  {
    consultantId: "1",
    consultantName: "Ricardo Alves",
    totalAnalyses: 42,
    avgTalkRatio: 55.2,
    efficiencyScore: 94,
  },
  {
    consultantId: "2",
    consultantName: "Ana Costa",
    totalAnalyses: 38,
    avgTalkRatio: 58.7,
    efficiencyScore: 89,
  },
  {
    consultantId: "3",
    consultantName: "Carlos Mendes",
    totalAnalyses: 31,
    avgTalkRatio: 62.1,
    efficiencyScore: 82,
  },
  {
    consultantId: "4",
    consultantName: "Fernanda Lima",
    totalAnalyses: 29,
    avgTalkRatio: 53.4,
    efficiencyScore: 91,
  },
  {
    consultantId: "5",
    consultantName: "Roberto Silva",
    totalAnalyses: 18,
    avgTalkRatio: 67.8,
    efficiencyScore: 74,
  },
];

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
  const [kpis, setKpis] = useState(MOCK_KPIS);
  const [chartData] = useState(MOCK_CHART);
  const [analyses, setAnalyses] = useState(MOCK_ANALYSES);
  const [ranking, setRanking] = useState(MOCK_RANKING);
  const [sortCol, setSortCol] = useState("totalAnalyses");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(false);

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
    } catch {
      // keep mock data if backend unavailable
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

  const cmp = kpis.periodComparison || {};

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
          value={kpis.totalAnalyses}
          icon={FileText}
          trend={cmp.totalAnalysesVariation}
          color="#0B9EBF"
        />
        <KPICard
          title="Upsell Detectados"
          value={kpis.upsellOpportunities}
          icon={TrendingUp}
          trend={cmp.upsellVariation}
          color="#3DB87A"
        />
        <KPICard
          title="Alertas de Churn"
          value={kpis.churnAlerts}
          icon={AlertTriangle}
          trend={cmp.churnVariation}
          color="#E05252"
        />
        <KPICard
          title="Talk-to-Listen Médio"
          value={`${kpis.avgTalkRatioConsultant?.toFixed(1)}%`}
          icon={Mic}
          trend={cmp.talkVariation}
          color={kpis.avgTalkRatioConsultant > 60 ? "#E0A048" : "#3DB87A"}
        />
      </div>

      {/* Chart */}
      <div
        style={{
          background: "#074A59",
          border: "1px solid rgba(27,175,191,0.25)",
          borderRadius: 8,
          padding: "20px",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            color: "#F2F2F2",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 16,
            margin: "0 0 16px",
          }}
        >
          Reuniões — Últimos 30 dias
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(27,175,191,0.1)"
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(242,242,242,0.5)", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(242,242,242,0.5)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#011C26",
                border: "1px solid rgba(27,175,191,0.3)",
                borderRadius: 8,
                color: "#F2F2F2",
              }}
            />
            <Legend
              wrapperStyle={{ color: "rgba(242,242,242,0.6)", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="#0B9EBF"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="churn"
              name="Com Churn"
              stroke="#E05252"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
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
