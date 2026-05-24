import { useState } from "react";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Expanded to support recovery view
type AuthType = "login" | "signup" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<AuthType>("login");
  const [loading, setLoading] = useState(false);
const location = useLocation();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Destructured custom auth method assuming your hook supports it
  const { login, signup, forgotPassword } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const inputStyles =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition text-sm font-medium";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTabChange = (newType: AuthType) => {
    setType(newType);
    setError("");
    setSuccessMessage("");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccessMessage("");
  setLoading(true);

  try {
    if (type === "signup") {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await signup(formData);

      const redirectTo = location.state?.from || "/";
navigate(redirectTo, { replace: true });

    } else if (type === "login") {
      await login({
        email: formData.email,
        password: formData.password,
      });

      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { state: location.state });

    } else if (type === "forgot") {
      if (typeof forgotPassword === "function") {
        await forgotPassword(formData.email);
      }

      setSuccessMessage("Password reset link sent! Please check your inbox.");
    }

  } catch (err: any) {
    setError(err.response?.data?.message || err.message || "An error occurred");
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
        <div className="p-6 text-center border-b dark:border-gray-800 relative">
          {type === "forgot" && (
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className="absolute left-6 top-7 text-gray-400 hover:text-amber-500 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className="text-2xl font-black text-amber-500 tracking-tight uppercase">
            LuxeeHub<span className="text-gray-900 dark:text-white">.</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
            {type === "forgot" 
              ? "Recover your account credentials" 
              : "Shop fabrics, tailor styles, anywhere in the world 🌍"}
          </p>
        </div>

        {/* TOGGLE TABS (Hidden when in forgot password view) */}
        {type !== "forgot" && (
          <div className="flex border-b dark:border-gray-800">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
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
              onClick={() => handleTabChange("signup")}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                type === "signup"
                  ? "text-amber-500 border-b-2 border-amber-500"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-transparent">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-100 dark:border-transparent">
              {successMessage}
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
                  value={formData.name}
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
                  value={formData.phone}
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* EMAIL FIELD (Visible on all views) */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD FIELD */}
            {type !== "forgot" && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* CONFIRM PASSWORD FIELD */}
            {type === "signup" && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  className={inputStyles}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* FORGOT PASSWORD TRIGGER LINK */}
            {/* {type === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => handleTabChange("forgot")}
                  className="text-xs font-bold text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )} */}

            {/* SUBMIT BUTTON */}
            <button
              disabled={loading}
              className="w-full mt-2 bg-slate-950 dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-black font-black uppercase text-xs tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : type === "login" ? (
                "Sign In"
              ) : type === "signup" ? (
                "Create Account"
              ) : (
                "Send Reset Link"
              )}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}