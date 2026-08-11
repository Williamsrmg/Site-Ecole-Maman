import { CalendarDays, ClipboardList, Users, BookOpen } from "lucide-react"
import DashboardCard from "../components/layout/DashboardCard"
import { useAppContext } from "../context/AppContext"

export default function Dashboard() {
  const { anneeScolaire } = useAppContext()

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-slate-800">
        Bonjour Maîtresse
      </h2>
      <p className="text-slate-500 mt-1">
        {anneeScolaire?.niveau} - {anneeScolaire?.libelle}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <DashboardCard
          title="Emploi du temps"
          description="Semainier et creneaux de cours"
          icon={CalendarDays}
          to="/emploi-du-temps"
          color="#0ea5e9"
        />
        <DashboardCard
          title="Planner"
          description="A.P.C, concertations, animations"
          icon={ClipboardList}
          to="/planner"
          color="#8b5cf6"
        />
        <DashboardCard
          title="Eleves"
          description="Liste et informations des eleves"
          icon={Users}
          to="/eleves"
          color="#f59e0b"
        />
        <DashboardCard
          title="Cahier journal"
          description="Seances, bilans et ressources"
          icon={BookOpen}
          to="/cahier-journal"
          color="#10b981"
        />
      </div>
    </div>
  )
}
