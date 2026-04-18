import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authApi.register(form);
      login(data);
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-1" style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Get Started
        </h1>
        <p className="text-sm" style={{ color: 'var(--ink-700)' }}>
          Create your learning profile today.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            className="w-full rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            className="w-full rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            className="w-full rounded-lg border border-[var(--accent-purple)]/30 bg-white/70 dark:bg-slate-700 px-4 py-3 text-sm outline-none focus:border-[var(--accent-purple)] dark:text-white transition"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-emerald-900/80">
          Have an account? <Link to="/login" className="font-bold text-emerald-900">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
