"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  department?: string;
  id: string;
  googleId: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user); // Asegurarse de que el backend devuelva `user`
      } else {
        setUser(null);
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
            window.location.href = '/'; // Redirige al login si no se encuentra usuario
        }
      }
    } catch (err) {
      console.error("Error al obtener usuario desde la cookie:", err);
      setUser(null);
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.href = '/'; // Redirige si ocurre un error al obtener el usuario
      }
    }
  };

  if (!user) {
    fetchUser();
  }
}, [user]);


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser debe usarse dentro de un UserProvider");
  }
  return context;
};
