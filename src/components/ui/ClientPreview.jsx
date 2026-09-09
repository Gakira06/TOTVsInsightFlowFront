import { useClient } from "../../hooks/useClient";
import { useEffect } from "react";
import { Building2, Heart, User } from "lucide-react";

export default function ClientPreview({ clientId }) {
  const { client, loading, error, fetchClient } = useClient();

  useEffect(() => {
    if (!clientId || clientId.length < 3) return;
    // Debounce: evita disparar uma requisição a cada tecla digitada.
    const timer = setTimeout(() => fetchClient(clientId), 400);
    return () => clearTimeout(timer);
  }, [clientId, fetchClient]);

  if (!clientId || clientId.length < 3) return null;
  if (loading)
    return (
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(7,74,89,0.5)",
          borderRadius: 8,
          border: "1px solid rgba(27,175,191,0.25)",
          marginTop: 8,
          fontSize: 13,
          color: "rgba(242,242,242,0.55)",
        }}
      >
        Buscando cliente...
      </div>
    );
  if (error)
    return (
      <div
        style={{
          padding: "10px 14px",
          background: "rgba(224,82,82,0.1)",
          borderRadius: 8,
          border: "1px solid rgba(224,82,82,0.3)",
          marginTop: 8,
          fontSize: 13,
          color: "#E05252",
        }}
      >
        {error}
      </div>
    );
  if (!client) return null;

  return (
    <div
      style={{
        padding: "12px 16px",
        background: "rgba(11,158,191,0.08)",
        borderRadius: 8,
        border: "1px solid rgba(27,175,191,0.3)",
        marginTop: 8,
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div className="flex items-center gap-2">
        <Building2 size={15} style={{ color: "#0B9EBF" }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F2" }}>
          {client.companyName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Heart
          size={15}
          style={{
            color:
              client.healthScore >= 70
                ? "#3DB87A"
                : client.healthScore >= 40
                  ? "#E0A048"
                  : "#E05252",
          }}
        />
        <span style={{ fontSize: 13, color: "rgba(242,242,242,0.75)" }}>
          Health:{" "}
          <strong style={{ fontFamily: '"Space Mono", monospace' }}>
            {client.healthScore}
          </strong>
        </span>
      </div>
      {client.responsibleConsultant && (
        <div className="flex items-center gap-2">
          <User size={15} style={{ color: "#1FAFBF" }} />
          <span style={{ fontSize: 13, color: "rgba(242,242,242,0.75)" }}>
            {client.responsibleConsultant.name}
          </span>
        </div>
      )}
      {client.activeProducts?.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {client.activeProducts.map((p) => (
            <span
              key={p}
              style={{
                background: "rgba(11,158,191,0.2)",
                color: "#1FAFBF",
                borderRadius: 4,
                padding: "1px 8px",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
