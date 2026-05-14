import { formatVariation } from "../../utils/formatPercent";

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  color = "#0B9EBF",
}) {
  const trendPositive = trend != null && trend >= 0;

  return (
    <div
      style={{
        background: "#074A59",
        border: "1px solid rgba(27,175,191,0.25)",
        borderRadius: 8,
      }}
      className="p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span style={{ color: "rgba(242,242,242,0.55)", fontSize: 13 }}>
          {title}
        </span>
        <div
          style={{ background: `${color}22`, borderRadius: 8, padding: "6px" }}
        >
          {Icon && <Icon size={18} style={{ color }} />}
        </div>
      </div>
      <div
        style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: 28,
          fontWeight: 700,
          color: "#F2F2F2",
        }}
      >
        {value ?? "—"}
      </div>
      {trend != null && (
        <div
          style={{ fontSize: 12, color: trendPositive ? "#3DB87A" : "#E05252" }}
        >
          {formatVariation(trend)}
        </div>
      )}
    </div>
  );
}
