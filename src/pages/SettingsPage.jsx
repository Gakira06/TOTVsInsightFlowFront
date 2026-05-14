import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        textAlign: "center",
        padding: "80px 24px",
      }}
    >
      <Settings
        size={48}
        style={{ color: "rgba(27,175,191,0.4)", marginBottom: 16 }}
      />
      <h2
        style={{
          color: "#F2F2F2",
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Configurações
      </h2>
      <p style={{ color: "rgba(242,242,242,0.5)", fontSize: 14 }}>
        Em desenvolvimento. Aqui você poderá gerenciar preferências de
        notificação, integrações e perfil de usuário.
      </p>
    </div>
  );
}
