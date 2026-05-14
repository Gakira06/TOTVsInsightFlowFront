import { useAlertContext } from "../contexts/AlertContext";

export function useAlerts() {
  return useAlertContext();
}
