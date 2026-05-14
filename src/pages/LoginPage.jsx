import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Loader, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.message || "Credenciais inválidas. Verifique seu e-mail e senha.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#011C26",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #0B9EBF, #1FAFBF)",
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            <Activity size={32} style={{ color: "#011C26" }} />
          </div>
          <h1
            style={{
              color: "#F2F2F2",
              fontSize: 28,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            InsightFlow
          </h1>
          <p
            style={{
              color: "rgba(242,242,242,0.55)",
              fontSize: 14,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Minerando o ouro invisível das suas conversas
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 12,
            padding: 32,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(242,242,242,0.7)",
                marginBottom: 6,
              }}
            >
              E-mail corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@totvs.com.br"
              required
              style={{
                width: "100%",
                background: "rgba(1,28,38,0.6)",
                border: "1px solid rgba(27,175,191,0.3)",
                borderRadius: 8,
                color: "#F2F2F2",
                padding: "10px 14px",
                fontSize: 14,
                fontFamily: '"DM Sans", sans-serif',
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "rgba(242,242,242,0.7)",
                marginBottom: 6,
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                background: "rgba(1,28,38,0.6)",
                border: "1px solid rgba(27,175,191,0.3)",
                borderRadius: 8,
                color: "#F2F2F2",
                padding: "10px 14px",
                fontSize: 14,
                fontFamily: '"DM Sans", sans-serif',
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                background: "rgba(224,82,82,0.12)",
                border: "1px solid rgba(224,82,82,0.35)",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <AlertCircle
                size={16}
                style={{ color: "#E05252", marginTop: 1, flexShrink: 0 }}
              />
              <span style={{ color: "#E05252", fontSize: 13 }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "rgba(11,158,191,0.5)" : "#0B9EBF",
              border: "none",
              borderRadius: 8,
              color: "#F2F2F2",
              padding: "12px",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: '"DM Sans", sans-serif',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s",
            }}
          >
            {loading ? (
              <>
                <Loader
                  size={16}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            fontSize: 12,
            color: "rgba(242,242,242,0.3)",
          }}
        >
          TOTVS InsightFlow — Plataforma de Inteligência Conversacional
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
