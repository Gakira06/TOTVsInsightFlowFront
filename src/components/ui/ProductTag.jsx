export default function ProductTag({ name, owned }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        border: "1px solid rgba(27,175,191,0.5)",
        background: owned ? "#0B9EBF" : "transparent",
        color: owned ? "#011C26" : "#1FAFBF",
        cursor: "default",
      }}
    >
      {name}
      {owned && <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>}
    </span>
  );
}
