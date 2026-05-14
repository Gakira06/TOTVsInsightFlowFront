import { createContext, useContext, useReducer } from "react";
import { alertService } from "../services/api";

const AlertContext = createContext(null);

const initialState = {
  alerts: [],
  unresolvedCount: 0,
  loading: false,
  error: null,
};

function alertReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        alerts: action.data,
        unresolvedCount: action.unresolvedCount,
      };
    case "RESOLVE_SUCCESS":
      return {
        ...state,
        loading: false,
        alerts: state.alerts.map((a) =>
          a.id === action.id ? { ...a, status: action.status } : a,
        ),
        unresolvedCount: Math.max(0, state.unresolvedCount - 1),
      };
    case "ERROR":
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

export function AlertProvider({ children }) {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  const fetchAlerts = async (filters = {}) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await alertService.getAll(filters);
      dispatch({
        type: "FETCH_SUCCESS",
        data: data.data,
        unresolvedCount: data.unresolvedCount,
      });
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
    }
  };

  const resolveAlert = async (id, status = "RESOLVED") => {
    try {
      await alertService.resolve(id, status);
      dispatch({ type: "RESOLVE_SUCCESS", id, status });
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
      throw err;
    }
  };

  return (
    <AlertContext.Provider value={{ ...state, fetchAlerts, resolveAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}
