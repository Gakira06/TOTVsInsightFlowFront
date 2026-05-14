import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import AnalysisStepper from "../components/ui/AnalysisStepper";
import ClientPreview from "../components/ui/ClientPreview";
import ProcessingStatus from "../components/ui/ProcessingStatus";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAuth } from "../contexts/AuthContext";
import { onMessage, offMessage } from "../services/websocket";
import { truncateText } from "../utils/truncateText";

const PROCESSING_STEPS = [
  "Recebido",
  "Sanitizando (LGPD)",
  "Orquestrando",
  "Analisando",
  "Concluído",
];
const STATUS_TO_STEP = {
  RECEIVED: 0,
  SANITIZING: 1,
  ORCHESTRATING: 2,
  ANALYZING: 3,
  COMPLETED: 4,
};

export default function NewAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitAnalysis } = useAnalysis();

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState("");
  const [clientIdInput, setClientIdInput] = useState("");
  const [file, setFile] = useState(null);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [lgpdConfirmed, setLgpdConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisId, setAnalysisId] = useState(null);
  const [processingStep, setProcessingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef();

  // WebSocket listener for processing status
  useEffect(() => {
    if (!analysisId) return;
    onMessage("new-analysis", (msg) => {
      if (msg.analysisId !== analysisId) return;
      const stepIdx = STATUS_TO_STEP[msg.step] ?? processingStep;
      setProcessingStep(stepIdx);
      if (msg.step === "COMPLETED") {
        setTimeout(() => navigate(`/analysis/${analysisId}`), 800);
      }
    });
    return () => offMessage("new-analysis");
  }, [analysisId, navigate]);

  const handleFileRead = (f) => {
    if (!f) return;
    if (!f.name.endsWith(".txt") && !f.name.endsWith(".pdf")) {
      setError("Formato inválido. Use arquivos .txt ou .pdf");
      return;
    }
    setFile(f);
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => setTranscriptionText(e.target.result);
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileRead(f);
  };

  const handleStep1Next = () => {
    if (!clientIdInput.trim()) {
      setError("Informe o ID do cliente");
      return;
    }
    if (!file || !transcriptionText) {
      setError("Faça upload da transcrição");
      return;
    }
    setClientId(clientIdInput.trim());
    setError("");
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!lgpdConfirmed) {
      setError("Confirme o termo LGPD para continuar");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await submitAnalysis({ clientId, transcriptionText });
      setAnalysisId(result.analysisId);
      setIsProcessing(true);
      setStep(2);
      // Simulate progress if no websocket
      let s = 0;
      const interval = setInterval(() => {
        s++;
        setProcessingStep(s);
        if (s >= 4) {
          clearInterval(interval);
          setTimeout(() => navigate(`/analysis/${result.analysisId}`), 1000);
        }
      }, 2000);
    } catch (err) {
      setError(err.message || "Erro ao enviar análise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <AnalysisStepper currentStep={step} />

      {/* Step 0 — Upload */}
      {step === 0 && (
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: 32,
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            Upload da Transcrição
          </h3>

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
              ID do Cliente *
            </label>
            <input
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              onBlur={() => clientIdInput && setClientId(clientIdInput)}
              placeholder="Ex: CLI001"
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
            <ClientPreview clientId={clientIdInput} />
          </div>

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
              Transcrição da Reunião *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${file ? "#3DB87A" : "rgba(27,175,191,0.35)"}`,
                borderRadius: 8,
                padding: "32px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(1,28,38,0.3)",
                transition: "border-color 0.2s",
              }}
            >
              {file ? (
                <div>
                  <CheckCircle
                    size={32}
                    style={{ color: "#3DB87A", marginBottom: 8 }}
                  />
                  <div
                    style={{ color: "#3DB87A", fontWeight: 600, fontSize: 14 }}
                  >
                    {file.name}
                  </div>
                  <div style={{ color: "rgba(242,242,242,0.5)", fontSize: 12 }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              ) : (
                <div>
                  <Upload
                    size={32}
                    style={{ color: "rgba(27,175,191,0.6)", marginBottom: 8 }}
                  />
                  <div style={{ color: "rgba(242,242,242,0.6)", fontSize: 14 }}>
                    Arraste um arquivo ou clique para selecionar
                  </div>
                  <div
                    style={{
                      color: "rgba(242,242,242,0.35)",
                      fontSize: 12,
                      marginTop: 4,
                    }}
                  >
                    Formatos: .txt, .pdf
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFileRead(e.target.files[0])}
            />
          </div>

          {transcriptionText && (
            <div
              style={{
                background: "rgba(1,28,38,0.4)",
                border: "1px solid rgba(27,175,191,0.15)",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <FileText size={14} style={{ color: "#0B9EBF" }} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(242,242,242,0.6)",
                  }}
                >
                  Preview
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(242,242,242,0.65)",
                  margin: 0,
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}
              >
                {truncateText(transcriptionText, 300)}
              </p>
            </div>
          )}

          {error && (
            <p style={{ color: "#E05252", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            onClick={handleStep1Next}
            style={{
              background: "#0B9EBF",
              border: "none",
              borderRadius: 8,
              color: "#F2F2F2",
              padding: "11px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            Avançar →
          </button>
        </div>
      )}

      {/* Step 1 — Confirm */}
      {step === 1 && (
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: 32,
          }}
        >
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            Confirmação e Envio
          </h3>

          <div
            style={{
              background: "rgba(1,28,38,0.4)",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span style={{ color: "rgba(242,242,242,0.5)", minWidth: 120 }}>
                ID do Cliente:
              </span>
              <span
                style={{
                  color: "#F2F2F2",
                  fontWeight: 600,
                  fontFamily: '"Space Mono", monospace',
                }}
              >
                {clientId}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span style={{ color: "rgba(242,242,242,0.5)", minWidth: 120 }}>
                Arquivo:
              </span>
              <span style={{ color: "#F2F2F2" }}>{file?.name}</span>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span style={{ color: "rgba(242,242,242,0.5)", minWidth: 120 }}>
                Tamanho:
              </span>
              <span style={{ color: "#F2F2F2" }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "—"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <span style={{ color: "rgba(242,242,242,0.5)", minWidth: 120 }}>
                Consultor:
              </span>
              <span style={{ color: "#F2F2F2" }}>{user?.name}</span>
            </div>
          </div>

          <label
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              cursor: "pointer",
              marginBottom: 24,
              padding: "14px 16px",
              background: "rgba(27,175,191,0.06)",
              border: "1px solid rgba(27,175,191,0.2)",
              borderRadius: 8,
            }}
          >
            <input
              type="checkbox"
              checked={lgpdConfirmed}
              onChange={(e) => setLgpdConfirmed(e.target.checked)}
              style={{
                width: 16,
                height: 16,
                marginTop: 2,
                accentColor: "#0B9EBF",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: "rgba(242,242,242,0.75)",
                lineHeight: 1.5,
              }}
            >
              Confirmo que esta transcrição não contém dados financeiros sem
              tratamento prévio (LGPD) e que estou autorizado a processar este
              conteúdo na plataforma InsightFlow.
            </span>
          </label>

          {error && (
            <p style={{ color: "#E05252", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setStep(0)}
              style={{
                background: "transparent",
                border: "1px solid rgba(27,175,191,0.3)",
                borderRadius: 8,
                color: "#1FAFBF",
                padding: "11px 24px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              ← Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: loading ? "rgba(11,158,191,0.5)" : "#0B9EBF",
                border: "none",
                borderRadius: 8,
                color: "#F2F2F2",
                padding: "11px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {loading ? "Enviando..." : "Processar Agora"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Processing */}
      {step === 2 && (
        <div
          style={{
            background: "#074A59",
            border: "1px solid rgba(27,175,191,0.25)",
            borderRadius: 8,
            padding: 40,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              border: "3px solid rgba(27,175,191,0.2)",
              borderTop: "3px solid #0B9EBF",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 24px",
            }}
          />
          <h3
            style={{
              color: "#F2F2F2",
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            Processando com IA
          </h3>
          <p style={{ color: "rgba(242,242,242,0.6)", marginBottom: 32 }}>
            Sua análise está sendo processada pela IA...
          </p>
          <div style={{ textAlign: "left", maxWidth: 320, margin: "0 auto" }}>
            <ProcessingStatus
              steps={PROCESSING_STEPS}
              currentStep={processingStep}
            />
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
