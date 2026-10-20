//src/context/UserContext.jsx
/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useState } from "react";
import { api } from "../api";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the auth cookie on page load
  useEffect(() => {
    api("/api/user")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password) => {
    const u = await api("/api/auth/login", {
      method: "POST",
      body: { identifier, password },
    });
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
