import { Check } from "lucide-react";

const STEPS = ["Upload da Transcrição", "Confirmação e Envio", "Resultado"];

export default function AnalysisStepper({ currentStep }) {
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {STEPS.map((label, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={label} className="flex items-center flex-1">
            <div
              className="flex flex-col items-center"
              style={{ minWidth: 32 }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isCompleted
                    ? "#3DB87A"
                    : isActive
                      ? "#0B9EBF"
                      : "rgba(27,175,191,0.15)",
                  border: `2px solid ${isCompleted ? "#3DB87A" : isActive ? "#0B9EBF" : "rgba(27,175,191,0.3)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: '"Space Mono", monospace',
                  fontWeight: 700,
                  fontSize: 13,
                  color:
                    isCompleted || isActive
                      ? "#F2F2F2"
                      : "rgba(242,242,242,0.4)",
                  transition: "all 0.3s",
                }}
              >
                {isCompleted ? <Check size={16} /> : idx + 1}
              </div>
              <span
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? "#F2F2F2"
                    : isCompleted
                      ? "#3DB87A"
                      : "rgba(242,242,242,0.45)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 22,
                  background: isCompleted ? "#3DB87A" : "rgba(27,175,191,0.2)",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
