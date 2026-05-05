import { useState } from "react";
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type AuthType = "login" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<AuthType>("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const inputStyles =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition text-sm";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint =
      type === "signup" ? "/api/auth/register" : "/api/auth/login";

    try {
      const body: any = {
        email: formData.email,
        password: formData.password,
      };

      if (type === "signup") {
        body.name = formData.name;
        body.phone = formData.phone; // ✅ ADD PHONE
      }

      const res = await fetch(`https://afrio-api.onrender.com${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data.user));

      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border dark:border-gray-800 overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-6 text-center border-b dark:border-gray-800">
          <h1 className="text-2xl font-black text-orange-600">
            AfriO<span className="text-gray-900 dark:text-white">.</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Shop fabrics, tailor styles, anywhere in the world 🌍
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex border-b dark:border-gray-800">
          <button
            onClick={() => {
              setType("signup");
              setError("");
            }}
            className={`flex-1 py-4 text-sm font-bold ${
              type === "signup"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-400"
            }`}
          >
            Sign Up
          </button>

          <button
            onClick={() => {
              setType("login");
              setError("");
            }}
            className={`flex-1 py-4 text-sm font-bold ${
              type === "login"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-400"
            }`}
          >
            Login
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            {type === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  name="name"
                  placeholder="Full name"
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* PHONE */}
            {type === "signup" && (
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  name="phone"
                  placeholder="Phone (e.g. +2348012345678)"
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : type === "signup" ? (
                "Create Account"
              ) : (
                "Login"
              )}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}