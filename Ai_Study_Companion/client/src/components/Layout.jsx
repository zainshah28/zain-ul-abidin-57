import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useDarkMode } from "../context/DarkModeContext";

const links = [
  { to: "/dashboard", label: "📊 Dashboard" },
  { to: "/planner", label: "📝 Study Planner" },
  { to: "/performance", label: "📈 Performance" },
  { to: "/ai", label: "✨ AI Insights" }
];

const navBase = "block rounded-xl px-4 py-3 text-sm font-semibold transition duration-200";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ backgroundColor: 'var(--bg-0)' }}>
      <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="glass fade-up rounded-2xl p-6 h-fit sticky top-6">
          <div className="space-y-1 mb-8">
            <p className="serif text-2xl leading-none" style={{ color: 'var(--primary)' }}>
              📚 Study Companion
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--accent-cyan)' }}>
              AI-Powered Learning
            </p>
          </div>

          <div className="mb-6 pb-6 border-b" style={{ borderColor: 'rgba(168, 85, 247, 0.15)' }}>
            <p className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--primary)' }}>
              Welcome
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--ink-900)' }}>
              {user?.name}
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${navBase} rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--primary)] to-[var(--accent-purple)] text-white shadow-lg"
                      : "text-[var(--ink-700)] hover:bg-white/60 dark:hover:bg-slate-700/50 dark:text-slate-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2">
            <button
              onClick={toggle}
              className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))"
                  : "linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(168, 85, 247, 0.15))",
                color: "var(--primary)",
                border: "1px solid rgba(168, 85, 247, 0.2)"
              }}
            >
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <button
              onClick={onLogout}
              className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-semibold"
            >
              Sign Out
            </button>
          </div>
        </aside>

        <main className="fade-up">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
