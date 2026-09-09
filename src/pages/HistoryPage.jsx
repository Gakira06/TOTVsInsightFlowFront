import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import { useAnalysis } from "../hooks/useAnalysis";
import { formatDateTime } from "../utils/formatDate";

const EMPTY_PAGINATION = { page: 1, limit: 10, total: 0, totalPages: 1 };

export default function HistoryPage() {
  const navigate = useNavigate();
  const { analyses, pagination, fetchAnalyses, loading } = useAnalysis();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [displayData, setDisplayData] = useState([]);
  const [displayPagination, setDisplayPagination] = useState(EMPTY_PAGINATION);

  useEffect(() => {
    fetchAnalyses({ page, limit: 10 }).catch(() => {});
  }, [page]);

  useEffect(() => {
    setDisplayData(analyses || []);
    setDisplayPagination(pagination || EMPTY_PAGINATION);
  }, [analyses, pagination]);

  const filtered = displayData.filter(
    (a) =>
      !search ||
      a.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.clientId?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleExportCSV = () => {
    const headers = ["ID", "Cliente", "Consultor", "Status", "Data"];
    const rows = filtered.map((a) => [
      a.id,
      a.clientName,
      a.consultantName,
      a.status,
      formatDateTime(a.createdAt),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insightflow-historico.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <h2
          style={{ color: "#F2F2F2", fontSize: 20, fontWeight: 700, margin: 0 }}
        >
          Histórico de Análises
        </h2>
        <button
          onClick={handleExportCSV}
          style={{
            background: "transparent",
            border: "1px solid rgba(27,175,191,0.3)",
            borderRadius: 8,
            color: "#1FAFBF",
            padding: "8px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Search & Filters */}
      <div
        style={{
          background: "#074A59",
          border: "1px solid rgba(27,175,191,0.25)",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(242,242,242,0.4)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou ID..."
            style={{
              width: "100%",
              background: "rgba(1,28,38,0.5)",
              border: "1px solid rgba(27,175,191,0.25)",
              borderRadius: 8,
              color: "#F2F2F2",
              padding: "8px 12px 8px 36px",
              fontSize: 13,
              fontFamily: '"DM Sans", sans-serif',
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#074A59",
          border: "1px solid rgba(27,175,191,0.25)",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(27,175,191,0.15)" }}>
              {["Cliente", "ID", "Consultor", "Status", "Alertas", "Data"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "rgba(242,242,242,0.5)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => navigate(`/analysis/${a.id}`)}
                style={{
                  borderBottom: "1px solid rgba(27,175,191,0.08)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(11,158,191,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td
                  style={{
                    padding: "12px 16px",
                    color: "#F2F2F2",
                    fontWeight: 500,
                  }}
                >
                  {a.clientName}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "rgba(242,242,242,0.5)",
                    fontFamily: '"Space Mono", monospace',
                    fontSize: 12,
                  }}
                >
                  {a.clientId}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "rgba(242,242,242,0.75)",
                  }}
                >
                  {a.consultantName}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusBadge status={a.status} />
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color:
                      a.alertCount > 0 ? "#E0A048" : "rgba(242,242,242,0.4)",
                    fontFamily: '"Space Mono", monospace',
                  }}
                >
                  {a.alertCount || 0}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "rgba(242,242,242,0.5)",
                    fontSize: 12,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatDateTime(a.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(27,175,191,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(242,242,242,0.5)" }}>
            {displayPagination.total} análises no total
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: "transparent",
                border: "1px solid rgba(27,175,191,0.25)",
                borderRadius: 6,
                color: page === 1 ? "rgba(242,242,242,0.3)" : "#1FAFBF",
                padding: "5px 10px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: 13, color: "rgba(242,242,242,0.6)" }}>
              {page} / {displayPagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(displayPagination.totalPages, p + 1))
              }
              disabled={page === displayPagination.totalPages}
              style={{
                background: "transparent",
                border: "1px solid rgba(27,175,191,0.25)",
                borderRadius: 6,
                color:
                  page === displayPagination.totalPages
                    ? "rgba(242,242,242,0.3)"
                    : "#1FAFBF",
                padding: "5px 10px",
                cursor:
                  page === displayPagination.totalPages
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
