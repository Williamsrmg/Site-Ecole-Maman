import { Routes, Route } from "react-router-dom"
import Sidebar from "./components/layout/Sidebar"
import Header from "./components/layout/Header"
import Dashboard from "./pages/Dashboard"
import ElevesTable from "./components/eleves/ElevesTable"
import Planificateur from "./components/planificateur/Planificateur"
import EmploiDuTempsGrille from "./components/emploi-du-temps/EmploiDuTempsGrille"
import CahierJournalGrille from "./components/cahier-journal/CahierJournalGrille"
import Calendrier from "./components/calendrier/Calendrier"
function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      <p className="text-slate-500 mt-2">Module en construction.</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/emploi-du-temps" element={<EmploiDuTempsGrille />} />
            <Route path="/planner" element={<Planificateur />} />
            <Route path="/eleves" element={<ElevesTable />} />
            <Route path="/cahier-journal" element={<CahierJournalGrille />} />
            <Route path="/calendrier" element={<Calendrier />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

