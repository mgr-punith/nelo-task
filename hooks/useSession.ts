"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useSession() {
  const [user, setUser] = useState<{ id: number; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("user");
    setUser(sessionUser ? JSON.parse(sessionUser) : null);
  }, []);

  const login = (userData: { id: number; email: string }) => {
    sessionStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    router.push("/dashboard");
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const checkProtected = () => {
    const sessionUser = sessionStorage.getItem("user");
    if (!sessionUser) router.push("/login");
  };

  // Optionally log out on tab close
  useEffect(() => {
    const handleUnload = () => logout();
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
    // eslint-disable-next-line
  }, []);

  return { user, login, logout, checkProtected };
}
