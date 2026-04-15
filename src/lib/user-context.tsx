"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "./types";

interface UserContextValue {
  user: User | null;
  setUser: (user: User) => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  setUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("content-planner-user");
    if (stored === "Chrigu" || stored === "Marco") {
      setUserState(stored);
    }
  }, []);

  function setUser(u: User) {
    localStorage.setItem("content-planner-user", u);
    setUserState(u);
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
