export function formatPercent(value, decimals = 1) {
  if (value == null) return "—";
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatVariation(value) {
  if (value == null) return "";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${Number(value).toFixed(1)}% vs mês anterior`;
}
