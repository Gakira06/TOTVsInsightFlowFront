const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("insightflow_token")}`,
});

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw { status: res.status, message: data.error || "Erro na requisição" };
  return data;
};

export const authService = {
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    }).then(handleResponse),
};

export const clientService = {
  getById: (id) =>
    fetch(`${API_BASE}/clients/${id}`, { headers: authHeaders() }).then(
      handleResponse,
    ),
};

export const analysisService = {
  submit: (payload) =>
    fetch(`${API_BASE}/analysis`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: authHeaders(),
    }).then(handleResponse),
  getById: (id) =>
    fetch(`${API_BASE}/analysis/${id}`, { headers: authHeaders() }).then(
      handleResponse,
    ),
  getAll: (filters = {}) =>
    fetch(`${API_BASE}/analysis?${new URLSearchParams(filters)}`, {
      headers: authHeaders(),
    }).then(handleResponse),
};

export const alertService = {
  getAll: (filters = {}) =>
    fetch(`${API_BASE}/alerts?${new URLSearchParams(filters)}`, {
      headers: authHeaders(),
    }).then(handleResponse),
  resolve: (id, status = "RESOLVED") =>
    fetch(`${API_BASE}/alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: authHeaders(),
    }).then(handleResponse),
};

export const dashboardService = {
  getKpis: (period = "30d") =>
    fetch(`${API_BASE}/dashboard/kpis?period=${period}`, {
      headers: authHeaders(),
    }).then(handleResponse),
  getConsultantsRanking: () =>
    fetch(`${API_BASE}/dashboard/consultants-ranking`, {
      headers: authHeaders(),
    }).then(handleResponse),
};
