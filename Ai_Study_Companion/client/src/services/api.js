import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("study_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401 && typeof message === "string" && message.toLowerCase().includes("token")) {
      localStorage.removeItem("study_token");
      localStorage.removeItem("study_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload)
};

export const taskApi = {
  create: (payload) => api.post("/tasks", payload),
  getAll: () => api.get("/tasks"),
  update: (id, payload) => api.put(`/tasks/${id}`, payload),
  remove: (id) => api.delete(`/tasks/${id}`)
};

export const performanceApi = {
  addQuiz: (payload) => api.post("/quiz", payload),
  getQuizHistory: () => api.get("/quiz"),
  removeQuiz: (id) => api.delete(`/quiz/${id}`),
  getAnalysis: () => api.get("/analysis")
};

export const goalApi = {
  setWeeklyGoal: (payload) => api.post("/goals", payload),
  getWeeklyGoal: () => api.get("/goals")
};

export const intelligenceApi = {
  getSchedule: (days = 7) => api.get(`/intelligence/schedule?days=${days}`),
  getPredictions: () => api.get("/intelligence/predictions"),
  addFocusSession: (payload) => api.post("/intelligence/focus/sessions", payload),
  getFocusInsights: () => api.get("/intelligence/focus/insights"),
  getDueReviews: () => api.get("/intelligence/spaced-repetition/due"),
  reviewTopic: (payload) => api.post("/intelligence/spaced-repetition/review", payload)
};

export default api;
