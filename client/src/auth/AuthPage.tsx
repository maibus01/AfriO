import { useState } from "react";
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type AuthType = "login" | "signup";

export default function AuthPage() {
  const navigate = useNavigate();
  // Changed default initialization view state to "login" first
  const [type, setType] = useState<AuthType>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Updated focus ring validation token to match your brand's Amber setup
  const inputStyles =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition text-sm font-medium";

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
        body.phone = formData.phone;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden"
      >
        {/* HEADER */}
        <div className="p-6 text-center border-b dark:border-gray-800">
          {/* Text branding color conversion to signature amber color */}
          <h1 className="text-2xl font-black text-amber-500 tracking-tight uppercase">
            LuxxeHub<span className="text-gray-900 dark:text-white">.</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
            Shop fabrics, tailor styles, anywhere in the world 🌍
          </p>
        </div>

        {/* TOGGLE: Re-ordered to place Login first (left side) */}
        <div className="flex border-b dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setType("login");
              setError("");
            }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
              type === "login"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setType("signup");
              setError("");
            }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
              type === "signup"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-transparent">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME FIELD */}
            {type === "signup" && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* PHONE FIELD */}
            {type === "signup" && (
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input
                  name="phone"
                  type="tel"
                  placeholder="Phone (e.g. +2348012345678)"
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                name="password"
                type="password"
                placeholder="Password"
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            {/* SUBMIT BUTTON CONTROL */}
            <button
              disabled={loading}
              className="w-full mt-2 bg-slate-950 dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-black font-black uppercase text-xs tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : type === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}