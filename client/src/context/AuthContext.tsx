import { createContext, useEffect, useState } from "react";
import API from "../api/User";

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>; // 1. Added type definition
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Restore session on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    API.get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔐 LOGIN
  const login = async (formData: any) => {
    const res = await API.post("/auth/login", formData);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // 🆕 SIGNUP
  const signup = async (formData: any) => {
    const res = await API.post("/auth/register", formData);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔑 FORGOT PASSWORD
  // 🔑 Update your function inside AuthProvider
const forgotPassword = async (email: string) => {
  await API.post(
    "/auth/forgot-password", 
    { email },
    { headers: { Authorization: "" } } // 👈 Explicitly clear the token for this request
  );
};

  return (
    // 3. Added forgotPassword to the Provider value below
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};