import { NavLink, Outlet } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAuth } from "../../lib/auth";

const NAV = [
  { to: "/console", label: "Overview", end: true },
  { to: "/console/playground", label: "Playground" },
  { to: "/console/keys", label: "API keys" },
  { to: "/console/quickstart", label: "Quickstart" },
];

export default function ConsoleLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-line bg-paper-2/60 md:flex md:w-60 md:flex-col md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Logo to="/console" />
          <button onClick={logout} className="text-sm text-ink-3 hover:text-ink md:hidden">Sign out</button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? "bg-white font-medium text-ink shadow-sm ring-1 ring-line" : "text-ink-2 hover:bg-white/60"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden px-5 py-6 text-sm md:block">
          {user && (
            <div className="mb-3">
              <div className="truncate font-medium">{user.full_name}</div>
              <div className="truncate text-ink-3">{user.email}</div>
            </div>
          )}
          <button onClick={logout} className="text-ink-3 hover:text-ink">Sign out</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
