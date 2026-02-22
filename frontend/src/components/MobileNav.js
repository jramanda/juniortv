import { NavLink } from "react-router-dom";
import { LayoutDashboard, Send, Target } from "lucide-react";

const MobileNav = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/telegram", icon: Send, label: "Telegram" },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50" data-testid="mobile-nav">
        <div className="flex justify-around items-center py-3 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-sm transition-all ${
                  isActive
                    ? "text-green-500"
                    : "text-slate-500"
                }`
              }
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wider font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 z-50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-sm flex items-center justify-center">
            <Target className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white">CORNERKICK PRO</h1>
          </div>
        </div>
      </header>
    </>
  );
};

export default MobileNav;
