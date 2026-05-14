import { createContext, useContext, useReducer } from "react";
import { analysisService } from "../services/api";

const AnalysisContext = createContext(null);

const initialState = {
  analyses: [],
  currentAnalysis: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
};

function analysisReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_ALL_SUCCESS":
      return {
        ...state,
        loading: false,
        analyses: action.data,
        pagination: action.pagination,
      };
    case "FETCH_ONE_SUCCESS":
      return { ...state, loading: false, currentAnalysis: action.analysis };
    case "SUBMIT_SUCCESS":
      return { ...state, loading: false };
    case "ERROR":
      return { ...state, loading: false, error: action.error };
    case "UPDATE_STATUS":
      return {
        ...state,
        currentAnalysis:
          state.currentAnalysis?.id === action.analysisId
            ? { ...state.currentAnalysis, status: action.status }
            : state.currentAnalysis,
      };
    default:
      return state;
  }
}

export function AnalysisProvider({ children }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  const fetchAnalyses = async (filters = {}) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await analysisService.getAll(filters);
      dispatch({
        type: "FETCH_ALL_SUCCESS",
        data: data.data,
        pagination: data.pagination,
      });
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
    }
  };

  const fetchAnalysis = async (id) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await analysisService.getById(id);
      dispatch({ type: "FETCH_ONE_SUCCESS", analysis: data });
      return data;
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
      throw err;
    }
  };

  const submitAnalysis = async (payload) => {
    dispatch({ type: "FETCH_START" });
    try {
      const data = await analysisService.submit(payload);
      dispatch({ type: "SUBMIT_SUCCESS" });
      return data;
    } catch (err) {
      dispatch({ type: "ERROR", error: err.message });
      throw err;
    }
  };

  const updateStatus = (analysisId, status) => {
    dispatch({ type: "UPDATE_STATUS", analysisId, status });
  };

  return (
    <AnalysisContext.Provider
      value={{
        ...state,
        fetchAnalyses,
        fetchAnalysis,
        submitAnalysis,
        updateStatus,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  return useContext(AnalysisContext);
}
