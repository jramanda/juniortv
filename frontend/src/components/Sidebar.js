import { NavLink } from "react-router-dom";
import { LayoutDashboard, Send, Target, TrendingUp } from "lucide-react";

const Sidebar = () => {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/telegram", icon: Send, label: "Telegram" },
  ];

  return (
    <aside className="sidebar fixed left-0 top-0 h-full w-64 border-r border-slate-800 z-40" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-sm flex items-center justify-center">
            <Target className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">CORNERKICK</h1>
            <span className="text-[10px] font-mono text-green-500 tracking-widest">PRO STATS</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 ${
                isActive
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`
            }
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Stats Summary */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
        <div className="bg-slate-900/50 rounded-sm p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs uppercase tracking-wider text-slate-400">Dica Pro</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Jogos com mais de 9 corners previstos tem maior probabilidade de lucro.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
