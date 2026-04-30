import { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = localStorage.getItem("user");
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
