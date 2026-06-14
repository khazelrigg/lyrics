import { SquareLibrary, Music, Search, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

type BottomNavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: BottomNavItem[] = [
  {
    label: "Listen",
    to: "/",
    icon: Music,
  },
  {
    label: "Search",
    to: "/search",
    icon: Search,
  },
  {
    label: "Library",
    to: "/library",
    icon: SquareLibrary,
  },

];

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-white/15 bg-[#131313] px-4 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90",
                isActive
                  ? "scale-105 font-bold text-green-400"
                  : "text-white/35 hover:text-white",
              ].join(" ")
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-semibold">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}