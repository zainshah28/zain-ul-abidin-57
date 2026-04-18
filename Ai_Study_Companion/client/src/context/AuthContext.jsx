import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("study_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("study_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = ({ token: jwtToken, user: userData }) => {
    localStorage.setItem("study_token", jwtToken);
    localStorage.setItem("study_user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("study_token");
    localStorage.removeItem("study_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
