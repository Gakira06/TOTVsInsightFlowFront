import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Zap,
  Star,
  SearchX,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AlertCard from "../components/ui/AlertCard";
import ProductTag from "../components/ui/ProductTag";
import StatusBadge from "../components/ui/StatusBadge";
import { useAnalysis } from "../hooks/useAnalysis";
import { formatDateTime } from "../utils/formatDate";

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentAnalysis, loading, error, fetchAnalysis } = useAnalysis();

  useEffect(() => {
    fetchAnalysis(id).catch(() => {});
  }, [id]);

  const data = currentAnalysis && currentAnalysis.id === id ? currentAnalysis : null;

  if (loading && !data) {
    return (
      <div
        style={{
          color: "rgba(242,242,242,0.6)",
          padding: 40,
          textAlign: "center",
        }}
      >
        Carregando análise...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          color: "rgba(242,242,242,0.6)",
          padding: 60,
          textAlign: "center",
        }}
      >
        <SearchX
          size={36}
          style={{ color: "rgba(242,242,242,0.3)", marginBottom: 12 }}
        />
        <p style={{ margin: "0 0 16px" }}>
          {error || "Análise não encontrada."}
        </p>
        <button
          onClick={() => navigate("/history")}
          style={{
            background: "transparent",
            border: "1px solid rgba(27,175,191,0.3)",
            borderRadius: 8,
            color: "#1FAFBF",
            padding: "8px 20px",
            cursor: "pointer",
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          ← Voltar ao histórico
        </button>
      </div>
    );
  }

  const pieData = [
    { name: "Consultor", value: data.talkRatioConsultant },
    { name: "Cliente", value: data.talkRatioClient },
  ];

  const mentionTypeLabel = {
    ALREADY_USES: "já usa",
    INTERESTED: "interesse",
    COMPLAINT: "reclamação",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(242,242,242,0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ flex: 1 }}>
          <h2
            style={{
              color: "#F2F2F2",
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {data.clientName}
          </h2>
          <div
            style={{
              fontSize: 13,
              color: "rgba(242,242,242,0.5)",
              marginTop: 2,
            }}
          >
            {data.consultantName} · {formatDateTime(data.createdAt)}
          </div>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Executive Summary */}
      <div
        style={{
          background: "#074A59",
          border: "1px solid rgba(27,175,191,0.25)",
          borderRadius: 8,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <h3
          style={{
            color: "#F2F2F2",
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 12,
            marginTop: 0,
          }}
        >
          Resumo Executivo
        </h3>
        <p
          style={{
            color: "rgba(242,242,242,0.8)",
            lineHeight: 1.7,
            fontSize: 14,
            margin: 0,
          }}
        >
          {data.executiveSummary}
        </p>
      </div>

      {/* Next Best Action */}
      <div
        style={{
          background: "rgba(31,175,191,0.06)",
          border: "1px solid rgba(31,175,191,0.25)",
          borderLeft: "4px solid #1FAFBF",
          borderRadius: 8,
          padding: 24,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <Zap
            size={18}
            style={{ color: "#1FAFBF", marginTop: 1, flexShrink: 0 }}
          />
          <h3
            style={{
              color: "#1FAFBF",
              fontSize: 15,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Next Best Action
          </h3>
        </div>
        <p
          style={{
            color: "rgba(242,242,242,0.8)",
            lineHeight: 1.7,
            fontSize: 14,
            margin: "0 0 16px",
          }}
        >
          {data.nextBestAction}
        </p>
        {data.suggestedActions?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.suggestedActions.slice(0, 3).map((action, i) => (
              <button
                key={i}
                style={{
                  background: "rgba(31,175,191,0.15)",
                  border: "1px solid rgba(31,175,191,0.35)",
                  borderRadius: 6,
                  color: "#1FAFBF",
                  padding: "7px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: '"DM Sans", sans-serif',
                }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Alerts */}
      {data.alerts?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            <AlertTriangle
              size={15}
              style={{ display: "inline", marginRight: 6, color: "#E0A048" }}
            />
            Alertas Detectados
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                type={alert.type}
                excerpt={alert.excerpt}
                competitor={alert.detail}
                severity={alert.severity}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
        className="detail-grid"
      >
        {/* Products */}
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 16,
              marginTop: 0,
            }}
          >
            Mapeamento de Produtos
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.products?.map((p) => (
              <ProductTag
                key={p.name}
                name={p.name}
                owned={p.mentionType === "ALREADY_USES"}
              />
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 16 }}>
            <span
              style={{
                fontSize: 11,
                color: "rgba(242,242,242,0.45)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#0B9EBF",
                  display: "inline-block",
                }}
              />{" "}
              Já usa
            </span>
            <span
              style={{
                fontSize: 11,
                color: "rgba(242,242,242,0.45)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  border: "1px solid #1FAFBF",
                  display: "inline-block",
                }}
              />{" "}
              Interesse
            </span>
          </div>
        </div>

        {/* Talk-to-Listen */}
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            Talk-to-Listen
          </h3>
          {data.talkRatioConsultant > 60 && (
            <div
              style={{
                background: "rgba(224,160,72,0.12)",
                border: "1px solid rgba(224,160,72,0.3)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                color: "#E0A048",
                marginBottom: 12,
              }}
            >
              ⚠ Atenção: o consultor falou mais que o recomendado
            </div>
          )}
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
              >
                <Cell fill="#0B9EBF" />
                <Cell fill="#074A59" stroke="#1FAFBF" />
              </Pie>
              <Tooltip
                formatter={(v) => `${v.toFixed(1)}%`}
                contentStyle={{
                  background: "#011C26",
                  border: "1px solid rgba(27,175,191,0.3)",
                  borderRadius: 8,
                  color: "#F2F2F2",
                  fontSize: 13,
                }}
              />
              <Legend
                formatter={(v) => (
                  <span
                    style={{ color: "rgba(242,242,242,0.7)", fontSize: 12 }}
                  >
                    {v}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pain Points */}
      {data.painPoints?.length > 0 && (
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 16,
              marginTop: 0,
            }}
          >
            Dores Identificadas
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.painPoints.slice(0, 5).map((p, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={14}
                      fill={si < p.urgency ? "#E0A048" : "none"}
                      style={{
                        color:
                          si < p.urgency ? "#E0A048" : "rgba(242,242,242,0.2)",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(242,242,242,0.8)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@media (max-width: 640px) { .detail-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
