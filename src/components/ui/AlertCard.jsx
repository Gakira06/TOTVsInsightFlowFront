import { formatDateTime } from "../../utils/formatDate";

const TYPE_CONFIG = {
  CHURN_RISK: {
    label: "CHURN RISK",
    color: "#E05252",
    bg: "rgba(224,82,82,0.12)",
  },
  UPSELL_OPPORTUNITY: {
    label: "UPSELL",
    color: "#3DB87A",
    bg: "rgba(61,184,122,0.12)",
  },
  COMPETITOR_MENTIONED: {
    label: "CONCORRÊNCIA",
    color: "#E0A048",
    bg: "rgba(224,160,72,0.12)",
  },
  PERSONA_IDENTIFIED: {
    label: "PERSONA",
    color: "#0B9EBF",
    bg: "rgba(11,158,191,0.12)",
  },
};

export default function AlertCard({
  type,
  excerpt,
  competitor,
  clientName,
  date,
  severity,
  onResolve,
}) {
  const cfg = TYPE_CONFIG[type] || {
    label: type,
    color: "#0B9EBF",
    bg: "rgba(11,158,191,0.12)",
  };

  return (
    <div
      style={{
        background: "#074A59",
        border: `1px solid ${cfg.color}44`,
        borderLeft: `4px solid ${cfg.color}`,
        borderRadius: 8,
        padding: "1rem",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span
            style={{
              background: cfg.bg,
              color: cfg.color,
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 4,
              letterSpacing: 1,
            }}
          >
            {cfg.label}
          </span>
          {clientName && (
            <span style={{ color: "#F2F2F2", fontWeight: 600, fontSize: 14 }}>
              {clientName}
            </span>
          )}
        </div>
        <span
          style={{
            color: "rgba(242,242,242,0.55)",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {formatDateTime(date)}
        </span>
      </div>

      {severity && (
        <div className="flex gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                color: i < severity ? cfg.color : "rgba(242,242,242,0.2)",
                fontSize: 14,
              }}
            >
              ★
            </span>
          ))}
        </div>
      )}

      {excerpt && (
        <blockquote
          style={{
            borderLeft: `2px solid ${cfg.color}66`,
            paddingLeft: 12,
            margin: "8px 0",
            color: "rgba(242,242,242,0.75)",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          "{excerpt}"
        </blockquote>
      )}

      {competitor && (
        <p
          style={{
            color: "rgba(242,242,242,0.7)",
            fontSize: 13,
            margin: "4px 0 0",
          }}
        >
          Concorrente identificado:{" "}
          <strong style={{ color: cfg.color }}>{competitor}</strong>
        </p>
      )}

      {onResolve && (
        <button
          onClick={onResolve}
          style={{
            marginTop: 12,
            background: "transparent",
            border: `1px solid rgba(27,175,191,0.4)`,
            color: "#1FAFBF",
            borderRadius: 6,
            padding: "5px 14px",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          Marcar como tratado
        </button>
      )}
    </div>
  );
}
