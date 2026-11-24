import { useEffect, useState } from "react";
import { SessionContext } from "./session-context";

function initialUser() {
  try {
    return localStorage.getItem("accessToken")
      ? JSON.parse(localStorage.getItem("usuario"))
      : null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("usuario");
    setUser(null);
  }
  useEffect(() => {
    const expire = () => setUser(null);
    const synchronize = () => setUser(initialUser());
    window.addEventListener("session-expired", expire);
    window.addEventListener("storage", synchronize);
    return () => {
      window.removeEventListener("session-expired", expire);
      window.removeEventListener("storage", synchronize);
    };
  }, []);
  function login(data) {
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    setUser(data.usuario);
  }
  return (
    <SessionContext.Provider value={{ user, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
