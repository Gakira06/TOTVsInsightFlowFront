import { CheckCircle, Circle, Loader } from "lucide-react";

export default function ProcessingStatus({ steps, currentStep }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        return (
          <div key={step} className="flex items-center gap-3">
            <div
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isCompleted ? (
                <CheckCircle size={22} style={{ color: "#3DB87A" }} />
              ) : isActive ? (
                <Loader
                  size={22}
                  style={{
                    color: "#0B9EBF",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <Circle size={22} style={{ color: "rgba(242,242,242,0.25)" }} />
              )}
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isCompleted
                  ? "#3DB87A"
                  : isActive
                    ? "#F2F2F2"
                    : "rgba(242,242,242,0.4)",
              }}
            >
              {step}
            </span>
          </div>
        );
      })}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
