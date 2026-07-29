import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Leaf, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import api from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("nutrition_tracker_token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("nutrition_tracker_token", response.data.token);
      localStorage.setItem("nutrition_tracker_user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page" className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#0B0B0B]">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-green-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel border border-[#2A2A2A] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 mb-3 green-glow">
            <Leaf className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-[#B3B3B3] mt-1 text-center">
            Sign in to access your premium personal nutrition dashboard
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mb-5 text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#B3B3B3] block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#B3B3B3]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#B3B3B3] block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#B3B3B3]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B3B3B3] hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl py-3 text-sm font-semibold transition duration-200 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-center text-[#B3B3B3] mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#22C55E] hover:underline font-medium">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
