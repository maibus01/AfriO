import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const inputStyles =
    "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition text-sm font-medium";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 🔗 Point this to your Render deployment API URL base
      const API_URL = "https://afrio-api.onrender.com/api";
      
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/auth"); // Redirects back to your custom login screen
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800/80 overflow-hidden p-8"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-amber-500 tracking-tight uppercase">
            LuxeeHub<span className="text-gray-900 dark:text-white">.</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wide">
            Create your new secure password
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Password reset successfully!
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Taking you back to the login screen...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-transparent">
                {error}
              </div>
            )}

            {/* NEW PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                name="password"
                type="password"
                placeholder="New Password"
                value={formData.password}
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONFIRM NEW PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={16} />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                className={inputStyles}
                onChange={handleChange}
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full mt-2 bg-slate-950 dark:bg-amber-500 hover:bg-slate-900 dark:hover:bg-amber-400 text-white dark:text-black font-black uppercase text-xs tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Update Password"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}