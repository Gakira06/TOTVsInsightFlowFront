import { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/api";
import { connectWebSocket, disconnectWebSocket } from "../services/websocket";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.user,
        token: action.token,
        loading: false,
        error: null,
      };
    case "LOGIN_ERROR":
      return { ...state, loading: false, error: action.error };
    case "LOGOUT":
      return { ...initialState, loading: false };
    case "INIT_DONE":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("insightflow_token");
    const user = localStorage.getItem("insightflow_user");
    if (token && user) {
      const parsedUser = JSON.parse(user);
      dispatch({ type: "LOGIN_SUCCESS", token, user: parsedUser });
      connectWebSocket(parsedUser.id);
    } else {
      dispatch({ type: "INIT_DONE" });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: "INIT_DONE" }); // clear error
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("insightflow_token", data.token);
      localStorage.setItem("insightflow_user", JSON.stringify(data.user));
      dispatch({ type: "LOGIN_SUCCESS", token: data.token, user: data.user });
      connectWebSocket(data.user.id);
      return data;
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        error: err.message || "Credenciais inválidas",
      });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("insightflow_token");
    localStorage.removeItem("insightflow_user");
    disconnectWebSocket();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
