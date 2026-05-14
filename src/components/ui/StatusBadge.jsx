const STATUS_CONFIG = {
  RECEIVED: {
    label: "RECEBIDO",
    color: "#0B9EBF",
    bg: "rgba(11,158,191,0.15)",
  },
  SANITIZING: {
    label: "SANITIZANDO",
    color: "#E0A048",
    bg: "rgba(224,160,72,0.15)",
  },
  ORCHESTRATING: {
    label: "ORQUESTRANDO",
    color: "#E0A048",
    bg: "rgba(224,160,72,0.15)",
  },
  ANALYZING: {
    label: "ANALISANDO",
    color: "#1FAFBF",
    bg: "rgba(31,175,191,0.15)",
  },
  COMPLETED: {
    label: "CONCLUÍDO",
    color: "#3DB87A",
    bg: "rgba(61,184,122,0.15)",
  },
  ERROR: { label: "ERRO", color: "#E05252", bg: "rgba(224,82,82,0.15)" },
  OPEN: { label: "ABERTO", color: "#E05252", bg: "rgba(224,82,82,0.15)" },
  RESOLVED: {
    label: "RESOLVIDO",
    color: "#3DB87A",
    bg: "rgba(61,184,122,0.15)",
  },
  IGNORED: {
    label: "IGNORADO",
    color: "rgba(242,242,242,0.4)",
    bg: "rgba(242,242,242,0.08)",
  },
  PROCESSANDO: {
    label: "PROCESSANDO",
    color: "#E0A048",
    bg: "rgba(224,160,72,0.15)",
  },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "#F2F2F2",
    bg: "rgba(242,242,242,0.1)",
  };
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}55`,
        borderRadius: 4,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.8,
        fontFamily: '"Space Mono", monospace',
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
