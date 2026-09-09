import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import AnalysisStepper from "../components/ui/AnalysisStepper";
import ClientPreview from "../components/ui/ClientPreview";
import ProcessingStatus from "../components/ui/ProcessingStatus";
import { useAnalysis } from "../hooks/useAnalysis";
import { useAuth } from "../contexts/AuthContext";
import { onMessage, offMessage } from "../services/websocket";
import { analysisService } from "../services/api";
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
  const [processingError, setProcessingError] = useState("");
  const fileInputRef = useRef();

  // WebSocket listener for processing status (real, vindo do backend)
  useEffect(() => {
    if (!analysisId) return;
    onMessage("new-analysis", (msg) => {
      if (msg.analysisId !== analysisId) return;
      if (msg.step === "ERROR") {
        setProcessingError(
          msg.errorMessage || "A análise falhou durante o processamento.",
        );
        return;
      }
      const stepIdx = STATUS_TO_STEP[msg.step] ?? processingStep;
      setProcessingStep(stepIdx);
      if (msg.step === "COMPLETED") {
        setTimeout(() => navigate(`/analysis/${analysisId}`), 800);
      }
    });
    return () => offMessage("new-analysis");
  }, [analysisId, navigate]);

  // Fallback real (sem simulação): confere o status de verdade via API caso
  // o WebSocket não entregue a notificação a tempo.
  useEffect(() => {
    if (!analysisId || !isProcessing) return;
    const interval = setInterval(async () => {
      try {
        const analysis = await analysisService.getById(analysisId);
        if (analysis.status === "COMPLETED") {
          clearInterval(interval);
          navigate(`/analysis/${analysisId}`);
        } else if (analysis.status === "ERROR") {
          clearInterval(interval);
          setProcessingError(
            analysis.errorMessage ||
              "A análise falhou durante o processamento.",
          );
        }
      } catch {
        // ignora falhas pontuais de polling, tenta de novo no próximo ciclo
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [analysisId, isProcessing, navigate]);

  const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".json", ".xlsx", ".xls"];
  const MAX_TRANSCRIPTION_LENGTH = 200000;

  const extractTextFromJson = (raw) => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return raw; // não era JSON válido, usa o texto cru mesmo
    }
    if (typeof parsed === "string") return parsed;

    const pickText = (item) =>
      item?.text ?? item?.texto ?? item?.fala ?? item?.transcricao ?? null;
    const pickSpeaker = (item) =>
      item?.speaker ?? item?.falante ?? item?.autor ?? item?.nome ?? null;

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") return item;
          const text = pickText(item);
          const speaker = pickSpeaker(item);
          if (text && speaker) return `${speaker}: ${text}`;
          if (text) return text;
          return JSON.stringify(item);
        })
        .join("\n");
    }

    // Busca case-insensitive por um campo de transcrição — cobre variações
    // reais como ANON_TRANSCRICAO (formato usado pela TOTVS), transcricao,
    // transcription, transcript etc.
    const keys = Object.keys(parsed);
    const transcriptKey = keys.find((k) => /transcri/i.test(k));
    const genericTextKey = keys.find((k) =>
      /^(text|texto|conteudo|content)$/i.test(k),
    );
    const matchKey = transcriptKey || genericTextKey;
    if (matchKey && typeof parsed[matchKey] === "string") {
      return parsed[matchKey];
    }

    return JSON.stringify(parsed, null, 2);
  };

  const extractTextFromSpreadsheet = async (f) => {
    const XLSX = await import("xlsx");
    const buffer = await f.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const blocks = workbook.SheetNames.map((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
      const lines = rows
        .map((row) => row.filter((cell) => cell !== undefined && cell !== "").map(String))
        .filter((row) => row.length > 0)
        .map((row) => (row.length === 2 ? `${row[0]}: ${row[1]}` : row.join(" ")));
      const heading = workbook.SheetNames.length > 1 ? `--- ${sheetName} ---\n` : "";
      return heading + lines.join("\n");
    });
    return blocks.join("\n\n");
  };

  const handleFileRead = async (f) => {
    if (!f) return;
    const nameLower = f.name.toLowerCase();
    const ext = SUPPORTED_EXTENSIONS.find((e) => nameLower.endsWith(e));
    if (!ext) {
      setError(
        `Formato inválido. Use arquivos ${SUPPORTED_EXTENSIONS.join(", ")}`,
      );
      return;
    }
    setFile(f);
    setError("");

    try {
      const text =
        ext === ".xlsx" || ext === ".xls"
          ? await extractTextFromSpreadsheet(f)
          : ext === ".json"
            ? extractTextFromJson(await f.text())
            : await f.text();

      if (text.length > MAX_TRANSCRIPTION_LENGTH) {
        setError(
          `Transcrição muito longa: ${text.length.toLocaleString("pt-BR")} caracteres (limite: ${MAX_TRANSCRIPTION_LENGTH.toLocaleString("pt-BR")}). Reduza o conteúdo do arquivo.`,
        );
        setFile(null);
        setTranscriptionText("");
        return;
      }

      setTranscriptionText(text);
    } catch (err) {
      setError(`Não foi possível ler o arquivo: ${err.message}`);
      setFile(null);
    }
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
    setProcessingError("");
    try {
      const result = await submitAnalysis({ clientId, transcriptionText });
      setAnalysisId(result.analysisId);
      setProcessingStep(0);
      setIsProcessing(true);
      setStep(2);
      // O progresso real chega via WebSocket (com fallback por polling da
      // API real logo acima) — nada aqui é simulado.
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
                    Formatos: .txt, .pdf, .json, .xlsx, .xls
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.json,.xlsx,.xls"
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
          {processingError ? (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(224,82,82,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: 28,
                  color: "#E05252",
                }}
              >
                ✕
              </div>
              <h3
                style={{
                  color: "#F2F2F2",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 8,
                  marginTop: 0,
                }}
              >
                Falha no processamento
              </h3>
              <p style={{ color: "#E05252", marginBottom: 32 }}>
                {processingError}
              </p>
              <button
                onClick={() => {
                  setStep(0);
                  setProcessingError("");
                  setIsProcessing(false);
                  setAnalysisId(null);
                }}
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
                Tentar novamente
              </button>
            </>
          ) : (
            <>
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
              <div
                style={{ textAlign: "left", maxWidth: 320, margin: "0 auto" }}
              >
                <ProcessingStatus
                  steps={PROCESSING_STEPS}
                  currentStep={processingStep}
                />
              </div>
            </>
          )}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}
