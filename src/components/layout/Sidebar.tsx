import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react"

const links = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/emploi-du-temps", label: "Emploi du temps", icon: CalendarDays },
  { to: "/planner", label: "Planner", icon: ClipboardList },
  { to: "/eleves", label: "Elèves", icon: Users },
  { to: "/cahier-journal", label: "Cahier journal", icon: BookOpen },
  { to: "/calendrier", label: "Calendrier", icon: Calendar },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-sidebar text-slate-200 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-semibold text-white">Gestion Classe</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "hover:bg-sidebar-hover text-slate-300"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
        v0.1 - usage interne
      </div>
    </aside>
  )
}
