"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  name: string;
  email: string;
  token: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const isAuth = localStorage.getItem("isAuthenticated") === "true";
      const token = localStorage.getItem("token");

      if (isAuth && storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser({ ...parsedUser, token });
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userData.token);
    router.push("/dashboard");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    if (loading) return;

    const isPublicRoute =
      PUBLIC_ROUTES.includes(pathname) ||
      pathname.startsWith("/reset-password");

    if (isAuthenticated && isPublicRoute) {
      router.push("/dashboard");
    } else if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-5/6 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
